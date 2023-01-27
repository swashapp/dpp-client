import { providers, Signer } from 'ethers';
import { PurchaseParams, TokenInfo } from '../types';
export declare class Purchase {
    private purchaseContract;
    private readonly networkID;
    private readonly provider;
    private readonly signer;
    private readonly SWASH_TOKEN;
    constructor(networkID: string, provider: providers.BaseProvider, signer: Signer);
    getToken(tokenName: string): Promise<TokenInfo>;
    private needToBeApproved;
    approve(token: TokenInfo, account: string | null | undefined): Promise<any>;
    private getRoutePath;
    request(params: PurchaseParams, token: TokenInfo): Promise<any>;
}
