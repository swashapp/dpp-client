import { BigNumber, providers, Signer } from 'ethers';
import { SignedDataRequest, TokenInfo } from '../types';
export declare class Purchase {
    private purchaseContract;
    readonly networkID: string;
    private readonly provider;
    private readonly signer;
    private readonly SWASH_TOKEN;
    constructor(networkID: string, provider: providers.BaseProvider, signer: Signer);
    getToken(tokenName: string): Promise<TokenInfo>;
    private needToBeApproved;
    approve(token: TokenInfo, account: string | null | undefined): Promise<any>;
    getRoutePath(token: TokenInfo, priceInDollar: number): Promise<Array<string>>;
    estimateGas(params: SignedDataRequest, token: TokenInfo, routePath: string[]): Promise<any>;
    request(params: SignedDataRequest, token: TokenInfo, routePath: string[], gasLimit: BigNumber): Promise<any>;
}
