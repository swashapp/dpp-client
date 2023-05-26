import { BigNumber, providers, Signer } from 'ethers';
import { SignedDataRequest, TokenInfo } from '../types';
export declare class Purchase {
    private purchaseContract;
    readonly networkID: string;
    private readonly provider;
    private readonly signer;
    private readonly SWASH_TOKEN;
    constructor(networkID: string, provider: providers.BaseProvider, signer: Signer);
    private getTokenOut;
    getToken(tokenName: string): Promise<TokenInfo>;
    private needToBeApproved;
    approve(tokenInfo: TokenInfo, account: string | null | undefined): Promise<any>;
    getRoutePath(tokenInfo: TokenInfo, priceInDollar: number): Promise<Array<string>>;
    estimateGas(params: SignedDataRequest, tokenInfo: TokenInfo, routePath: string[]): Promise<any>;
    request(params: SignedDataRequest, tokenInfo: TokenInfo, routePath: string[], gasLimit: BigNumber): Promise<any>;
}
