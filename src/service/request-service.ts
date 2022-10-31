import fetch from 'cross-fetch';
import { providers, Signer } from 'ethers';
import FormData from 'form-data';
import * as jwt from 'jsonwebtoken';

import { AuthSessionConfig, dppClientOptions, SignatureOBJ } from '../types';

export enum URI {
  DATA_REQUEST = 'data-request',
  ACCEPTED_VALUE = 'accepted-value',
  SIGNATURE = 'public/signature',
  LOG = 'log',
}

export function encodeQueryString(params: {
  [key: string]: string | boolean | number;
}): string {
  return Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
}

export const MESSAGE_TO_SIGN_PREFIX = 'I am signing my one-time nonce';

export abstract class Request {
  private options?: dppClientOptions;
  private session?: AuthSessionConfig;

  constructor(session?: AuthSessionConfig, options?: dppClientOptions) {
    this.session = session;
    this.options = options;
  }

  private getServerApiURL = (): string =>
    `${this.options?.host || 'https://dpp-client.swashapp.io'}/v2/`;

  private getServicesApiURL = (): string =>
    `${this.options?.servicesHost || 'https://api.swashapp.io'}/v2/`;

  protected async signWith(
    signMessage: (nonce: number) => Promise<SignatureOBJ>,
  ): Promise<SignatureOBJ> {
    return await this.call(
      `${this.getServicesApiURL()}${URI.SIGNATURE}/nonce`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then(signMessage);
  }

  public abstract getSignatureObj(): Promise<SignatureOBJ>;
  public abstract getProvider(): providers.BaseProvider;
  public abstract getAccount(): Promise<string>;
  public abstract getSigner(): Signer;

  protected async createRequest(method = 'GET'): Promise<RequestInit> {
    let token = this.session?.token;
    if (!token) {
      const signatureObj = await this.getSignatureObj();
      token = jwt.sign(signatureObj, 'shhhhh');
    }
    return {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    };
  }

  protected async call<Type>(url: string, req: any): Promise<Type> {
    let message = '';

    try {
      const resp = await fetch(url, req);
      const payload = await resp.json();
      if (payload.status === 'success') {
        return payload.data as Type;
      }
      if (payload.status === 'error' || payload.message) {
        message = payload.message;
      }
      if (payload.status === 'expired') {
        if (this.session?.onExpired) this.session.onExpired();
        throw Error(`Session is expired`);
      }
    } catch (err) {
      throw Error(`Failed to fetch ${url}`);
    }

    throw Error(message);
  }

  private async send<Type>(
    api: string,
    method: string,
    params?: any,
  ): Promise<Type> {
    try {
      const url = this.getServerApiURL() + api;
      let req: RequestInit = await this.createRequest(method);
      let query = '';
      if (['GET', 'DELETE'].includes(method))
        query = params ? `?${encodeQueryString(params)}` : '';
      else req = params ? { ...req, body: JSON.stringify(params) } : req;
      return this.call<Type>(url + query, req);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async GET<Type>(api: string, params?: any): Promise<Type> {
    return this.send<Type>(api, 'GET', params);
  }

  public async DELETE<Type>(api: string, params?: any): Promise<Type> {
    return this.send<Type>(api, 'DELETE', params);
  }

  public async POST<Type>(api: string, body?: any): Promise<Type> {
    return this.send<Type>(api, 'POST', body);
  }

  public async PUT<Type>(api: string, body?: any): Promise<Type> {
    return this.send<Type>(api, 'PUT', body);
  }

  public async DOWNLOAD<Type>(api: string, params?: any): Promise<any> {
    const req: RequestInit = await this.createRequest('GET');
    const query = params ? `?${encodeQueryString(params)}` : '';
    const url = this.getServerApiURL() + api + query;
    return await fetch(url, req);
  }

  public async POSTFile<Type>(
    api: string,
    file: File | Buffer,
    fileName: string,
  ): Promise<Type> {
    let req: RequestInit = await this.createRequest('POST');
    delete req.headers['Content-Type'];
    const url = this.getServerApiURL() + api;
    const form = new FormData();
    form.append('file', file, fileName);
    req = { ...req, body: form as any };
    return this.call<Type>(url, req);
  }
}
