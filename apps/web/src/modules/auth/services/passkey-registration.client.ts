'use client';

type PasskeyCredentialDescriptor = {
  id: string;
  type: 'public-key';
  transports?: AuthenticatorTransport[];
};

type PasskeyUser = {
  id: string;
  name: string;
  displayName: string;
};

type PasskeyRegistrationOptions = {
  challenge: string;
  rp: {
    name: string;
    id?: string;
  };
  user: PasskeyUser;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  excludeCredentials?: PasskeyCredentialDescriptor[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
};

function bufferToBase64Url(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);

  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBuffer(value: string) {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const binary = window.atob(
    normalized +
      '='.repeat(
        (4 - (normalized.length % 4)) % 4,
      ),
  );

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

export async function registerPasskey() {
  const optionsResponse = await fetch(
    '/api/auth/passkey/register/options',
    {
      method: 'POST',
    },
  );

  if (!optionsResponse.ok) {
    throw new Error(
      'Unable to start passkey registration',
    );
  }

  const payload = await optionsResponse.json();

  const {
    challengeId,
    options,
  }: {
    challengeId: string;
    options: PasskeyRegistrationOptions;
  } = payload.data;

  const credential = await navigator.credentials.create({
    publicKey: {
      ...options,

      challenge: base64UrlToBuffer(
        options.challenge,
      ),

      user: {
        ...options.user,

        id: base64UrlToBuffer(
          options.user.id,
        ),
      },

      excludeCredentials:
        options.excludeCredentials?.map(
          (
            credential: PasskeyCredentialDescriptor,
          ) => ({
            ...credential,

            id: base64UrlToBuffer(
              credential.id,
            ),
          }),
        ),
    },
  });

  if (
    !credential ||
    credential.type !== 'public-key'
  ) {
    throw new Error(
      'Passkey registration was cancelled',
    );
  }

  const publicKey =
    credential as PublicKeyCredential;

  const response =
    publicKey.response as AuthenticatorAttestationResponse;

  const verification = await fetch(
    '/api/auth/passkey/register/verify',
    {
      method: 'POST',

      headers: {
        'content-type': 'application/json',
      },

      body: JSON.stringify({
        challengeId,

        credential: {
          id: publicKey.id,

          rawId: bufferToBase64Url(
            publicKey.rawId,
          ),

          type: publicKey.type,

          response: {
            clientDataJSON:
              bufferToBase64Url(
                response.clientDataJSON,
              ),

            attestationObject:
              bufferToBase64Url(
                response.attestationObject,
              ),
          },
        },
      }),
    },
  );

  if (!verification.ok) {
    throw new Error(
      'Unable to save your passkey',
    );
  }

  return verification.json();
}
