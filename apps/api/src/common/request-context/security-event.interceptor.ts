import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { finalize } from 'rxjs/operators';
  
  import {
    RequestContextService,
  } from './request-context.service';
  
  @Injectable()
  export class SecurityRequestInterceptor
    implements NestInterceptor
  {
    constructor(
      private readonly context:
        RequestContextService,
    ) {}
  
    intercept(
      executionContext: ExecutionContext,
      next: CallHandler,
    ): Observable<unknown> {
      const response =
        executionContext
          .switchToHttp()
          .getResponse();
  
      const requestId =
        this.context.getRequestId();
  
      if (requestId) {
        response.setHeader(
          'x-request-id',
          requestId,
        );
      }
  
      return next
        .handle()
        .pipe(
          finalize(() => {
            const requestId =
              this.context.getRequestId();
  
            if (requestId) {
              response.setHeader(
                'x-request-id',
                requestId,
              );
            }
          }),
        );
    }
  }