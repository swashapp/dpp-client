import fetch from 'cross-fetch';
import * as jwt from 'jsonwebtoken';
import Web3 from 'web3';

import { AuthConfig } from './types';

export enum URI {
  DATA_REQUEST = '/data-request/',
}

export function encodeQueryString(params: {
  [key: string]: string | boolean | number;
}): string {
  return Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
}

async function signMessage(
  web3: Web3,
  user?: {
    wallet: string;
    nonce: string;
    email: string;
    first_name: string;
    last_name: string;
  },
): Promise<{ wallet: string; signature: string }> {
  if (!user) throw Error('No Such User Found.');
  const isMetaMask =
    web3 && web3.currentProvider && (web3.currentProvider as any).isMetaMask;
  let sign = web3?.eth.sign;
  if (isMetaMask)
    sign = (
      dataToSign: string,
      address: string,
      callback?: (error: Error, signature: string) => void,
    ): Promise<string> =>
      web3?.eth.personal.sign(dataToSign, address, '', callback);
  return await new Promise((resolve, reject) => {
    sign(
      web3?.utils.fromUtf8(`I am signing my one-time nonce: ${user.nonce}`),
      user?.wallet || '',
      (err: any, signature: string) => {
        if (err) reject(err);
        resolve({ ...user, signature });
      },
    );
  });
}

export class Request {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  private getServerApiURL = (): string =>
    `${this.config.serverURL || 'http://swash.scompute'}/v2/`;

  public async sign(): Promise<{ wallet: string; signature: string }> {
    const web3 = this.config.provider.web3;
    const accounts = await web3.eth.getAccounts();
    return await this.call(
      `${this.getServerApiURL()}${URI.USER}?wallet=${accounts[0].toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then(
      (user?: {
        wallet: string;
        nonce: string;
        email: string;
        first_name: string;
        last_name: string;
      }) => signMessage(web3, user),
    );
  }

  private async getToken(): Promise<string> {
    let token = '';
    if (this.config.session && this.config.session.token)
      token = this.config.session.token;
    else if (this.config.provider && this.config.provider.web3) {
      const signatureObj = await this.sign();
      token = jwt.sign(
        { wallet: signatureObj.wallet, signature: signatureObj.signature },
        'shhhhh',
      );
    }
    return token;
  }

  private async createRequest(method = 'GET'): Promise<RequestInit> {
    const token = await this.getToken();
    return {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    };
  }

  private async call<Type>(url: string, req: any): Promise<Type> {
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
        if (this.config.session && this.config.session.onExpired)
          this.config.session.onExpired();
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
    const url = this.getServerApiURL() + api;
    let req: RequestInit = await this.createRequest(method);
    let query = '';
    if (['GET', 'DELETE'].includes(method))
      query = params ? `?${encodeQueryString(params)}` : '';
    else req = params ? { ...req, body: JSON.stringify(params) } : req;
    return this.call<Type>(url + query, req);
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

  public async POSTForm<Type>(api: string, body?: any): Promise<Type> {
    let req: RequestInit = await this.createRequest('POST');
    delete req.headers['Content-Type'];
    const url = this.getServerApiURL() + api;
    const form = new FormData();
    Object.keys(body).forEach((key) => form.append(key, body[key]));
    if (body) req = { ...req, body: form };
    return this.call<Type>(url, req);
  }
}
