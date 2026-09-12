import {
    test,
    expect,
  } from '@playwright/test';
  
  test.describe(
    'AuthFort authentication',
    () => {
      test('renders passwordless login', async ({
        page,
      }) => {
        await page.goto('/login');
  
        await expect(
          page.getByRole(
            'heading',
            {
              name: 'Welcome back',
            },
          ),
        ).toBeVisible();
  
        await expect(
          page.getByLabel(
            'Email address',
          ),
        ).toBeVisible();
  
        await expect(
          page.getByRole(
            'button',
            {
              name: /continue with email/i,
            },
          ),
        ).toBeVisible();
      });
  
      test('validates signup email', async ({
        page,
      }) => {
        await page.goto('/signup');
  
        await page
          .getByLabel('Your name')
          .fill('Test User');
  
        await page
          .getByLabel('Email address')
          .fill('invalid');
  
        await page
          .getByRole('button', {
            name: /create account/i,
          })
          .click();
  
        await expect(
          page.getByText(
            'Enter a valid email address',
          ),
        ).toBeVisible();
      });
  
      test('supports recovery navigation', async ({
        page,
      }) => {
        await page.goto('/login');
  
        await page
          .getByRole('link', {
            name: /can't access/i,
          })
          .click();
  
        await expect(
          page
            .getByRole('heading', {
              name: 'Recover your account',
            }),
        ).toBeVisible();
      });
  
      test('protects dashboard without session', async ({
        page,
      }) => {
        await page.goto('/dashboard');
  
        await expect(
          page,
        ).toHaveURL(
          /\/login\?returnTo=%2Fdashboard/,
        );
      });
  
      test('protects onboarding without session', async ({
        page,
      }) => {
        await page.goto('/onboarding');
  
        await expect(
          page,
        ).toHaveURL(
          /\/login\?returnTo=%2Fonboarding/,
        );
      });
  
      test('rejects invalid CSRF mutation', async ({
        request,
      }) => {
        const response =
          await request.post(
            '/api/auth/logout',
            {
              headers: {
                'x-csrf-token':
                  'invalid',
              },
            },
          );
  
        expect(
          response.status(),
        ).toBe(403);
      });
  
      test('Google login begins through BFF', async ({
        page,
      }) => {
        await page.goto('/login');
  
        const requestPromise =
          page.waitForRequest(
            request =>
              request
                .url()
                .includes(
                  '/api/auth/google',
                ),
          );
  
        await page
          .getByRole('button', {
            name: /continue with google/i,
          })
          .click();
  
        await requestPromise;
      });
    },
  );