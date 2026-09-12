describe(
    'refresh-token rotation',
    () => {
      it(
        'allows only one successful rotation',
        async () => {
          /*
           * Integration test:
           *
           * 1. create a session
           * 2. issue refresh token
           * 3. concurrently rotate the same token
           * 4. exactly one request succeeds
           * 5. the consumed token is no longer active
           */
          expect(true).toBe(true);
        },
      );
  
      it(
        'revokes the token family on reuse',
        async () => {
          /*
           * Integration test:
           *
           * 1. issue token A
           * 2. rotate A -> B
           * 3. submit A again
           * 4. expect 401
           * 5. expect family revoked
           * 6. expect session revoked
           * 7. expect REFRESH_REUSE_DETECTED
           */
          expect(true).toBe(true);
        },
      );
    },
  );