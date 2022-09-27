import * as jwt from 'jsonwebtoken';
import Web3 from 'web3';

import { AuthWeb3Config, dppClientOptions } from '../types';

import { MESSAGE_TO_SIGN_PREFIX, Request } from './request-service';

async function web3SignMessage(
  web3: Web3,
  nonce: number,
): Promise<{ wallet: string; signature: string; nonce: number }> {
  if (!nonce) throw Error('Nonce is not provided');
  const isMetaMask =
    web3 && web3.currentProvider && (web3.currentProvider as any).isMetaMask;
  const accounts = await web3.eth.getAccounts();
  const wallet = accounts[0];
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
      Web3.utils.fromUtf8(`${MESSAGE_TO_SIGN_PREFIX}: ${nonce}`),
      wallet || '',
      (err: any, signature: string) => {
        if (err) reject(err);
        resolve({ wallet, nonce, signature });
      },
    );
  });
}

export class Web3Request extends Request {
  private config: AuthWeb3Config;

  constructor(config: AuthWeb3Config, options: dppClientOptions) {
    super(options);
    this.config = config;
  }

  async getToken(): Promise<string> {
    const web3 = this.config.web3;
    const signMessage = (
      nonce: number,
    ): Promise<{ wallet: string; signature: string; nonce: number }> =>
      web3SignMessage(web3, nonce);
    const signatureObj = await this.signWith(signMessage);
    return jwt.sign(
      {
        wallet: signatureObj.wallet,
        signature: signatureObj.signature,
        nonce: signatureObj.nonce,
      },
      'shhhhh',
    );
  }
}
