import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedApiKey } from '../api-keys.types';

export const CurrentApiKey = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedApiKey | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<{ apiKey?: AuthenticatedApiKey }>();
    return request.apiKey;
  },
);
