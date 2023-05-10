import { AuthTokenConfig, AuthWalletConfig, AuthWeb3Config, DataLake, DataReq, dppClientOptions, SignatureOBJ } from './types';
export declare class DataProviderClient {
    private request;
    constructor(config: {
        auth: AuthTokenConfig | AuthWeb3Config | AuthWalletConfig;
        options?: dppClientOptions;
    });
    getSignature(): Promise<SignatureOBJ>;
    private sign;
    dataRequest: DataReq;
    dataLake: DataLake;
}
