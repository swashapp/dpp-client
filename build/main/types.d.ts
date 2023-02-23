import { providers } from 'ethers';
import Web3 from 'web3';
export interface AuthSessionConfig {
    token?: string;
    onExpired?: () => void;
}
export interface SignatureOBJ {
    address: string;
    signature: string;
    nonce: number;
}
export interface TokenInfo {
    tokenName: string;
    tokenAddress: string;
    isNative: boolean;
    isSwash: boolean;
}
export interface AuthWalletConfig {
    privateKey: string;
    provider: providers.BaseProvider;
    session?: AuthSessionConfig;
}
export interface AuthWeb3Config {
    web3: Web3;
    session?: AuthSessionConfig;
}
export interface AuthTokenConfig {
    token: string;
    onExpired: () => void;
}
export interface dppClientOptions {
    host?: string;
    servicesHost?: string;
}
export declare class DataLakeField {
    id: string;
    name: string;
    title: string;
    description: string;
    sample: string;
}
export interface DataLakeSchema {
    id: string;
    name: string;
    description: string;
    dataDictionaries: DataLakeField[];
}
export interface RequestJob {
    id: string;
    status: string;
    result_path: string;
    repeat_style: string;
    last_execution_time: Date;
    meta_data: string;
    run_count: number;
}
export interface DataRequest {
    id?: string;
    params: any;
    userAccountAddress: string;
    fileName: string;
    requestDate: number;
    status?: string;
    requestHash?: string;
    productType?: string;
    requestJob?: RequestJob;
}
export declare class DataRequestCalculateDto {
    id: string;
}
export interface DataRequestDetails {
    params: any;
    fileName: string;
    requestDate: number;
}
export type AuthConfig = {
    serverURL?: string;
    session?: {
        token: string;
        onExpired: () => void;
    };
    provider: {
        web3: Web3;
    };
};
export interface PurchaseConfig {
    tokenName: string;
    networkID: string;
}
export interface PurchaseParams {
    requestHash: string;
    signature: string;
    time: string;
    productType: string;
    price: number;
    signer: string;
}
export declare class SignedDataRequest {
    dataRequestId: string;
    requestHash: string;
    signature: string;
    time: string;
    productType: string;
    signer: string;
    price: number;
}
export interface DataReqFN {
    provide: (purchaseConfig: PurchaseConfig) => Promise<void>;
    delete: () => Promise<DataRequest>;
    get: () => Promise<DataRequest>;
    getPrice: () => Promise<{
        title: string;
        price: number;
    }[]>;
}
export interface DataReq {
    getAll: () => Promise<DataRequest[]>;
    add: (req: DataRequestDetails) => Promise<DataRequest>;
    with: (id: string) => DataReqFN;
}
export interface DataLake {
    getSchema: (name: string) => Promise<DataLakeSchema>;
    getAcceptedValues: (fieldName: string) => Promise<string[]>;
}
