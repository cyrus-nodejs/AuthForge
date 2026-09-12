import {
    INestApplication,
  } from '@nestjs/common';
  import {
    Test,
  } from '@nestjs/testing';
  import request from 'supertest';
  
  import { AppModule } from '../../src/app.module';
  
  describe('Authentication API', () => {
    let app: INestApplication;
  
    beforeAll(async () => {
      const moduleRef =
        await Test.createTestingModule({
          imports: [AppModule],
        }).compile();
  
      app =
        moduleRef.createNestApplication();
  
      await app.init();
    });
  
    afterAll(async () => {
      await app.close();
    });
  
    describe('request correlation', () => {
      it('returns an x-request-id', async () => {
        const response =
          await request(app.getHttpServer())
            .get('/api/auth/session');
  
        expect(
          response.headers['x-request-id'],
        ).toBeDefined();
      });
  
      it('preserves a valid request id', async () => {
        const requestId =
          'test-request-123456';
  
        const response =
          await request(app.getHttpServer())
            .get('/api/auth/session')
            .set(
              'x-request-id',
              requestId,
            );
  
        expect(
          response.headers['x-request-id'],
        ).toBe(requestId);
      });
    });
  
    describe('authentication boundary', () => {
      it('rejects protected endpoints without a token', async () => {
        await request(
          app.getHttpServer(),
        )
          .get('/api/auth/session')
          .expect(401);
      });
  
      it('rejects malformed bearer tokens', async () => {
        await request(
          app.getHttpServer(),
        )
          .get('/api/auth/session')
          .set(
            'authorization',
            'Bearer invalid',
          )
          .expect(401);
      });
    });
  
    describe('signup', () => {
      it('accepts a valid signup request', async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .post('/api/auth/signup')
            .send({
              email:
                `test-${Date.now()}@example.com`,
              displayName:
                'AuthFort Test',
            })
            .expect(200);
  
        expect(
          response.body.success,
        ).toBe(true);
  
        expect(
          response.body.data
            .challengeId,
        ).toBeDefined();
      });
  
      it('rejects invalid email', async () => {
        await request(
          app.getHttpServer(),
        )
          .post('/api/auth/signup')
          .send({
            email: 'invalid',
          })
          .expect(400);
      });
    });
  
    describe('Google OAuth', () => {
      it('returns an authorization redirect', async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .get('/api/auth/google')
            .expect(302);
  
        expect(
          response.headers.location,
        ).toContain(
          'accounts.google.com',
        );
  
        expect(
          response.headers.location,
        ).toContain(
          'state=',
        );
      });
  
      it('rejects an invalid callback state', async () => {
        await request(
          app.getHttpServer(),
        )
          .get(
            '/api/auth/google/callback?code=x&state=invalid',
          )
          .expect(401);
      });
    });
  
    describe('Passkeys', () => {
      it('creates a public authentication challenge', async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/passkey/login/options',
            )
            .expect(200);
  
        expect(
          response.body.success,
        ).toBe(true);
  
        expect(
          response.body.data.challengeId,
        ).toBeDefined();
  
        expect(
          response.body.data.options
            .challenge,
        ).toBeDefined();
      });
  
      it('rejects an expired challenge', async () => {
        await request(
          app.getHttpServer(),
        )
          .post(
            '/api/auth/passkey/login/verify',
          )
          .send({
            challengeId:
              'missing-challenge',
            credential: {},
          })
          .expect(401);
      });
    });
  
    describe('Recovery', () => {
      it('starts recovery without revealing account existence', async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/recovery/start',
            )
            .send({
              email:
                'unknown@example.com',
            })
            .expect(200);
  
        expect(
          response.body.success,
        ).toBe(true);
  
        expect(
          response.body.data
            .recoveryAttemptId,
        ).toBeDefined();
      });
    });
  
    describe('refresh token', () => {
      it('rejects an invalid refresh token', async () => {
        await request(
          app.getHttpServer(),
        )
          .post(
            '/api/auth/token/refresh',
          )
          .send({
            refreshToken:
              'invalid-refresh-token',
          })
          .expect(401);
      });
    });
  
    describe('security headers', () => {
      it('sets helmet security headers', async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .get('/api/auth/session');
  
        expect(
          response.headers[
            'x-content-type-options'
          ],
        ).toBe('nosniff');
      });
    });
  });