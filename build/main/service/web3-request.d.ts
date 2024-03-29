import { providers, Signer } from 'ethers';
import { AuthWeb3Config, dppClientOptions, SignatureOBJ } from '../types';
import { Request } from './request-service';
export declare class Web3Request extends Request {
    private config;
    private provider;
    constructor(config: AuthWeb3Config, options: dppClientOptions);
    getSignatureObj(): Promise<SignatureOBJ>;
    getProvider(): providers.BaseProvider;
    getSigner(): Signer;
    getAccount(): Promise<string>;
}
