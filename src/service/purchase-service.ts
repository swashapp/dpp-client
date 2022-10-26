import { Contract } from '@ethersproject/contracts';
import { formatEther, parseEther } from '@ethersproject/units';
import { Protocol } from '@uniswap/router-sdk';
import { Token, TradeType } from '@uniswap/sdk-core';
import { providers } from 'ethers';

import {
  AlphaRouter,
  CurrencyAmount,
  WRAPPED_NATIVE_CURRENCY,
} from 'swash-order-router';

import { SwapRoute } from 'swash-order-router/build/main/routers/router';

import { ERC20_ABI } from '../constants/erc20-abi';
import { PURCHASE_ABI } from '../constants/purchase-abi';
import {
  PURCHASE_CONTRACT_ADDRESS,
  SWASH_TOKEN_ADDRESS,
} from '../constants/purchase-config';
import { PurchaseToken, TokenInfo } from '../types';

export class Purchase {
  private purchaseContract: Contract;
  private networkID: string;
  private provider: providers.BaseProvider;

  private SWASH_TOKEN: Token;

  constructor(networkID: string, provider: providers.BaseProvider) {
    this.networkID = networkID;
    this.provider = provider;
    this.purchaseContract = new Contract(
      PURCHASE_CONTRACT_ADDRESS[networkID],
      PURCHASE_ABI,
      provider,
    );
    this.SWASH_TOKEN = new Token(
      Number(this.networkID),
      SWASH_TOKEN_ADDRESS[this.networkID],
      18,
      'SWASH',
      'SWASH',
    );
  }

  public async getInfoOf(tokenName: string): Promise<TokenInfo> {
    const tokenMap = await this.purchaseContract.tokenMap(tokenName);
    return {
      tokenName: tokenMap[0],
      tokenAddress: tokenMap[1],
      isNative: tokenMap[2],
    };
  }

  private async needToBeApproved(
    info: TokenInfo,
    account: string | null | undefined,
  ): Promise<boolean> {
    const tokenContract = new Contract(
      info.tokenAddress,
      ERC20_ABI,
      this.provider,
    );
    const allowance = await tokenContract.allowance(
      account,
      PURCHASE_CONTRACT_ADDRESS[this.networkID],
    );
    const ethAllowance = parseEther(allowance.toString());
    return ethAllowance.lte(0);
  }

  public async approve(
    info: TokenInfo,
    account: string | null | undefined,
  ): Promise<any> {
    if (!info.isNative) {
      const needToBeApproved = await this.needToBeApproved(info, account);
      if (needToBeApproved) {
        const tokenContract = new Contract(
          info.tokenAddress,
          ERC20_ABI,
          this.provider,
        );
        return await tokenContract.approve(
          PURCHASE_CONTRACT_ADDRESS[this.networkID],
          parseEther('999999999999'),
        );
      }
    }
  }

  public async getToken(
    info: TokenInfo,
    priceInDoller: number,
  ): Promise<PurchaseToken> {
    const tokenPath = await this.getRoutePath(info, priceInDoller);

    const priceList = await this.purchaseContract.convertPrice(
      parseEther(priceInDoller.toString()),
      [info.tokenName],
      [tokenPath],
    );

    const priceEl = priceList.find(
      (el) => el.tokenAddress.toLowerCase() === info.tokenAddress.toLowerCase(),
    );
    if (!priceEl) throw new Error('Price info not found.');

    return {
      ...info,
      neededTokenCount: formatEther(priceEl.price),
      routePath: tokenPath,
    };
  }

  private async getRoutePath(
    info: TokenInfo,
    priceInDoller: number,
  ): Promise<Array<string>> {
    if (
      info.tokenAddress.toLowerCase() ===
      SWASH_TOKEN_ADDRESS[this.networkID].toLowerCase()
    ) {
      return [info.tokenAddress, info.tokenAddress];
    }
    let tokenOut = null;

    if (info.isNative) {
      tokenOut = WRAPPED_NATIVE_CURRENCY[Number(this.networkID)];
    } else {
      const tokenContract = new Contract(
        info.tokenAddress,
        ERC20_ABI,
        this.provider,
      );

      const tokenSymbol = await tokenContract.symbol();
      const tokenDecimals = await tokenContract.decimals();
      const tokenName = await tokenContract.name();

      tokenOut = new Token(
        Number(this.networkID),
        info.tokenAddress,
        Number(tokenDecimals.toString()),
        tokenSymbol,
        tokenName,
      );
    }
    const alphaRouter = new AlphaRouter({
      chainId: Number(this.networkID),
      provider: this.provider,
    });

    const paths: Array<string> = [];
    const priceInSwash = await this.purchaseContract.priceInSwash(
      parseEther(priceInDoller.toString()),
    );
    const amount = CurrencyAmount.fromRawAmount(this.SWASH_TOKEN, priceInSwash);

    // debugger
    const routeResult: SwapRoute | null = await alphaRouter.route(
      amount,
      tokenOut,
      TradeType.EXACT_OUTPUT,
      undefined,
      { protocols: [Protocol.V2] },
    );

    if (routeResult != null) {
      for (const routeToken of routeResult.route[0].tokenPath) {
        paths.push(routeToken.address);
      }
    }
    return paths;
  }

  public async request(
    params: {
      requestHash: string;
      time: string;
      productType: string;
      signature: string;
    },
    token: PurchaseToken,
  ): Promise<any> {
    if (token.isNative) {
      return await this.purchaseContract.buyDataProductWithUniswapEth(
        params.requestHash,
        params.time,
        parseEther(token.neededTokenCount),
        params.productType,
        params.signature,
        token.routePath,
        { gasLimit: 5000000 },
      );
    } else {
      return await this.purchaseContract.buyDataProductWithUniswapErc20(
        params.requestHash,
        params.time,
        parseEther(token.neededTokenCount),
        params.productType,
        params.signature,
        token.tokenName,
        token.routePath,
        { gasLimit: 5000000 },
      );
    }
  }
}