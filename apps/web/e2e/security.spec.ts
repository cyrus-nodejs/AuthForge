import {
    test,
    expect,
  } from '@playwright/test';
  
  test.describe(
    'BFF security boundary',
    () => {
      test('session response contains request id', async ({
        request,
      }) => {
        const response =
          await request.get(
            '/api/auth/session',
          );
  
        expect(
          response.headers()[
            'x-request-id'
          ],
        ).toBeTruthy();
      });
  
      test('session is not cacheable', async ({
        request,
      }) => {
        const response =
          await request.get(
            '/api/auth/session',
          );
  
        expect(
          response.headers()[
            'cache-control'
          ],
        ).toContain('no-store');
      });
  
      test('CSRF token endpoint is cache disabled', async ({
        request,
      }) => {
        const response =
          await request.get(
            '/api/auth/csrf',
          );
  
        expect(
          response.headers()[
            'cache-control'
          ],
        ).toContain('no-store');
      });
  
      test('invalid OAuth callback does not authenticate', async ({
        page,
      }) => {
        await page.goto(
          '/api/auth/google/callback?code=invalid&state=invalid',
        );
  
        await expect(
          page,
        ).toHaveURL(
          /\/login\?reason=invalid_oauth_state/,
        );
      });
  
      test('external OAuth return URL is rejected', async ({
        page,
      }) => {
        await page.goto(
          '/api/auth/google?returnTo=https%3A%2F%2Fevil.example',
        );
  
        /*
         * The callback cookie stores only an internal
         * path. The external URL must never become a
         * redirect target.
         */
        expect(
          page.url(),
        ).not.toContain(
          'evil.example',
        );
      });
    },
  );