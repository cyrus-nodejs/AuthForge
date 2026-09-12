'use client';

import {
  useEffect,
  useState,
} from 'react';

export interface PasskeyCapability {
  supported: boolean;
  platformAuthenticator: boolean;
  conditionalUI: boolean;
}

export function usePasskeyCapability() {
  const [
    capability,
    setCapability,
  ] = useState<PasskeyCapability>({
    supported: false,
    platformAuthenticator: false,
    conditionalUI: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      if (
        !window.PublicKeyCredential
      ) {
        return;
      }

      let platform = false;
      let conditional = false;

      try {
        platform =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch {
        platform = false;
      }

      try {
        conditional =
          typeof PublicKeyCredential
            .isConditionalMediationAvailable ===
            'function' &&
          (await PublicKeyCredential.isConditionalMediationAvailable());
      } catch {
        conditional = false;
      }

      if (!cancelled) {
        setCapability({
          supported: true,
          platformAuthenticator:
            platform,
          conditionalUI:
            conditional,
        });
      }
    }

    void detect();

    return () => {
      cancelled = true;
    };
  }, []);

  return capability;
}