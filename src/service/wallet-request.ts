import { getDefaultProvider, providers, Wallet } from 'ethers';

import * as jwt from 'jsonwebtoken';

import { AuthWalletConfig, dppClientOptions } from '../types';

import { MESSAGE_TO_SIGN_PREFIX, Request } from './request-service';

async function walletSignMessage(
  wallet: Wallet,
  nonce: number,
): Promise<{ wallet: string; signature: string; nonce: number }> {
  if (!nonce) throw Error('Nonce is not provided');
  const address = await wallet.getAddress();
  return await new Promise((resolve, reject) => {
    wallet
      .signMessage(`${MESSAGE_TO_SIGN_PREFIX}: ${nonce}`)
      .then((signature) => {
        resolve({ wallet: address, nonce, signature });
      })
      .catch(reject);
  });
}
export class WalletRequest extends Request {
  private config: AuthWalletConfig;
  private wallet: Wallet;

  constructor(config: AuthWalletConfig, options: dppClientOptions) {
    super(options);
    this.config = config;
    const provider = config.rpcUrl
      ? new providers.JsonRpcProvider(config.rpcUrl)
      : getDefaultProvider();
    this.wallet = new Wallet(config.privateKey, provider);
  }

  async getToken(): Promise<string> {
    const wallet = this.wallet;
    const signMessage = (
      nonce: number,
    ): Promise<{ wallet: string; signature: string; nonce: number }> =>
      walletSignMessage(wallet, nonce);
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
