import {
  AuthTokenConfig,
  AuthWalletConfig,
  AuthWeb3Config,
  DataProductDto,
  DataRequestDto,
  dppClientOptions,
  PurchaseConfig,
  SignatureOBJ,
} from './types';
import { Purchase, Request, URI, WalletRequest, Web3Request } from './service';

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

  public saveDataRequest(dataRequestDto: DataRequestDto): Promise<DataRequestDto> {
    return this.request.POST(URI.DATA_REQUEST + '/add', dataRequestDto);
  }

  public async executeDataRequest(dataRequestDto: DataRequestDto,purchaseConfig: PurchaseConfig) {
    try {
      const provider = this.request.getProvider();
      const signer = this.request.getSigner();
      const account = await this.request.getAccount();
      const purchase = new Purchase(
        purchaseConfig.networkID,
        provider,
        signer,
      );
      const tokenInfo = await purchase.getInfoOf(purchaseConfig.tokenName);
      await purchase.approve(tokenInfo, account);
      const purchaseParam = {
        requestHash: dataRequestDto.requestHash,
        time: ''+dataRequestDto.requestDate,
        productType: dataRequestDto.productType,
        signature: dataRequestDto.signature,
      };
    const price:number=await this.getPrice(dataRequestDto);
      const token=await purchase
        .getToken(tokenInfo, price)
      const tx = await purchase.request(purchaseParam, token);
      if (tx) await tx.wait();
      else throw Error('Failed to purchase');
    } catch (err) {
      console.log(err);
      throw Error('Failed to purchase');
    }
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

  public getPrice(dataRequestDto: DataRequestDto): Promise<number> {
    return this.request.POST(URI.DATA_REQUEST + 'calculate/price', dataRequestDto);
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
