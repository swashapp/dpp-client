import { providers, Signer } from 'ethers';
import { TokenInfo } from '../types';
export declare class Purchase {
    private purchaseContract;
    private networkID;
    private provider;
    private signer;
    private SWASH_TOKEN;
    constructor(networkID: string, provider: providers.BaseProvider, signer: Signer);
    getToken(tokenName: string): Promise<TokenInfo>;
    private needToBeApproved;
    approve(token: TokenInfo, account: string | null | undefined): Promise<any>;
    private getRoutePath;
    request(params: {
        requestHash: string;
        time: string;
        productType: string;
        signature: string;
        price: number;
    }, token: TokenInfo): Promise<any>;
}
