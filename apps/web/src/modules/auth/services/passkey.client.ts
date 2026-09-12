'use client';

function base64UrlToBuffer(
  value: string,
) {
  const normalized =
    value
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const padding =
    '='.repeat(
      (4 -
        (normalized.length % 4)) %
        4,
    );

  const binary =
    window.atob(
      normalized + padding,
    );

  const bytes =
    new Uint8Array(
      binary.length,
    );

  for (
    let index = 0;
    index < binary.length;
    index++
  ) {
    bytes[index] =
      binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function bufferToBase64Url(
  value: ArrayBuffer,
) {
  const bytes =
    new Uint8Array(value);

  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(
      byte,
    );
  }

  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function deserializeRequestOptions(
  options: PublicKeyCredentialRequestOptions,
) {
  return {
    ...options,
    challenge:
      typeof options.challenge ===
      'string'
        ? base64UrlToBuffer(
            options.challenge,
          )
        : options.challenge,

    allowCredentials:
      options.allowCredentials?.map(
        credential => ({
          ...credential,
          id:
            typeof credential.id ===
            'string'
              ? base64UrlToBuffer(
                  credential.id,
                )
              : credential.id,
        }),
      ),
  };
}

export async function beginPasskeyLogin() {
  const optionsResponse =
    await fetch(
      '/api/auth/passkey/options',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify({}),
      },
    );

  if (!optionsResponse.ok) {
    throw new Error(
      'Unable to start passkey login',
    );
  }

  const payload =
    await optionsResponse.json();

  const {
    challengeId,
    options,
  } =
    payload.data;

  const credential =
    await navigator.credentials.get({
      publicKey:
        deserializeRequestOptions(
          options,
        ),
    });

  if (
    !credential ||
    credential.type !==
      'public-key'
  ) {
    throw new Error(
      'Passkey authentication was cancelled',
    );
  }

  const publicKey =
    credential as PublicKeyCredential;

  const response =
    publicKey.response as
      | AuthenticatorAssertionResponse;

  return fetch(
    '/api/auth/passkey/verify',
    {
      method: 'POST',
      headers: {
        'content-type':
          'application/json',
      },
      body: JSON.stringify({
        challengeId,
        credential: {
          id:
            publicKey.id,
          rawId:
            bufferToBase64Url(
              publicKey.rawId,
            ),
          type:
            publicKey.type,
          response: {
            authenticatorData:
              bufferToBase64Url(
                response.authenticatorData,
              ),
            clientDataJSON:
              bufferToBase64Url(
                response.clientDataJSON,
              ),
            signature:
              bufferToBase64Url(
                response.signature,
              ),
            userHandle:
              response.userHandle
                ? bufferToBase64Url(
                    response.userHandle,
                  )
                : null,
          },
        },
      }),
    },
  );
}