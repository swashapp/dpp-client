import { AuthTokenConfig, dppClientOptions } from '../types';

import { Request } from './request-service';

export class TokenRequest extends Request {
  private config: AuthTokenConfig;

  constructor(config: AuthTokenConfig, options?: dppClientOptions) {
    super(options, config.onExpired);
    this.config = config;
  }

  async getToken(): Promise<string> {
    return Promise.resolve(this.config.token);
  }

  public async login(): Promise<{ access_token: string; user: any }> {
    throw Error('Cannot login with token');
  }
}
