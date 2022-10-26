import {
  AuthTokenConfig,
  AuthWalletConfig,
  AuthWeb3Config,
  DataProductDto,
  DataRequestDto,
  dppClientOptions, SignatureOBJ,
} from './types';
import { Request,  URI, WalletRequest, Web3Request } from './service';

export class DataProviderClient {
  private request: Request;

  constructor(config: {
    auth: AuthTokenConfig | AuthWeb3Config | AuthWalletConfig;
    options?: dppClientOptions;
  }) {
    const auth: any = config.auth;
    const options = config.options;
    if (auth.web3) this.request = new Web3Request(auth, options);
    else if (auth.privateKey) this.request = new WalletRequest(auth, options);
  }

  public getSignature(): Promise<SignatureOBJ> {
    return this.request.getSignatureObj();
  }

  public sendRequest(dataRequestDto: DataRequestDto): Promise<DataRequestDto> {
    return this.request.POST(URI.DATA_REQUEST + '/add', dataRequestDto);
  }

  public getAllRequests(): Promise<Array<DataRequestDto>> {
    return this.request.GET(URI.DATA_REQUEST + '/all');
  }

  public getRequestById(requestId:string): Promise<DataRequestDto> {
    return this.request.GET(URI.DATA_REQUEST + '/load',{id:requestId});
  }

  public getRequestStatus(requestId:string): Promise<DataRequestDto> {
    return this.request.GET(URI.DATA_REQUEST + '/status',{id:requestId});
  }

  public getDownloadLink(requestId:string): Promise<DataRequestDto> {
    return this.request.GET(URI.DATA_REQUEST + '/download-link',{id:requestId});
  }

  public getSelectableColumns(dataType:string):Promise<DataProductDto>{
    return this.request.GET(URI.DATA_REQUEST + '/accepted-value/load-data-product-by-name',{name:dataType});
  }

  public getAcceptedValues(columnName:string):Promise<string[]>{
    return this.request.GET(URI.DATA_REQUEST + '/accepted-value/load-by-name',{name:columnName});
  }

}
