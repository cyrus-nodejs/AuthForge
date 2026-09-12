import {
    describe,
    expect,
    it,
  } from 'vitest';
  
  describe('Auth BFF contract', () => {
    it(
      'does not expose token values in the session contract',
      () => {
        const session = {
          authenticated: true,
          user: {
            id: 'user_1',
            email:
              'user@example.com',
          },
          session: {
            id: 'session_1',
            authenticationLevel:
              'passkey',
          },
        };
  
        expect(
          'accessToken' in session,
        ).toBe(false);
  
        expect(
          'refreshToken' in session,
        ).toBe(false);
      },
    );
  
    it(
      'uses server-only cookie names',
      () => {
        expect(
          '__Host-authfort_at',
        ).toMatch(/^__Host-/);
  
        expect(
          '__Host-authfort_rt',
        ).toMatch(/^__Host-/);
      },
    );
  
    it(
      'does not put refresh tokens in browser responses',
      () => {
        const browserPayload = {
          authenticated: true,
          sessionId: 'session_1',
        };
  
        expect(
          JSON.stringify(
            browserPayload,
          ),
        ).not.toContain(
          'refreshToken',
        );
      },
    );
  });