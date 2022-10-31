import { AuthTokenConfig, AuthWalletConfig, AuthWeb3Config, DataProductDto, DataRequestDto, DataSaveRequestDto, dppClientOptions, PurchaseConfig, SignatureOBJ } from './types';
export declare class DataProviderClient {
    private request;
    constructor(config: {
        auth: AuthTokenConfig | AuthWeb3Config | AuthWalletConfig;
        options?: dppClientOptions;
    });
    getSignature(): Promise<SignatureOBJ>;
    saveDataRequest(dataRequestDto: DataSaveRequestDto): Promise<DataRequestDto>;
    executeDataRequest(dataRequestDto: DataRequestDto, purchaseConfig: PurchaseConfig): Promise<void>;
    deleteRequest(requestId: string): Promise<Array<DataRequestDto>>;
    getAllRequests(): Promise<Array<DataRequestDto>>;
    getRequestById(requestId: string): Promise<DataRequestDto>;
    getRequestStatus(requestId: string): Promise<DataRequestDto>;
    getPrice(dataRequestDto: DataRequestDto): Promise<number>;
    getDownloadLink(requestId: string): Promise<DataRequestDto>;
    getSelectableColumns(dataType: string): Promise<DataProductDto>;
    getAcceptedValues(columnName: string): Promise<string[]>;
}
