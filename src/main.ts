import { Purchase, Request, URI, WalletRequest, Web3Request } from './service';
import {
  AuthTokenConfig,
  AuthWalletConfig,
  AuthWeb3Config,
  DataProductDto,
  DataRequestDto,
  DataSaveRequestDto,
  dppClientOptions,
  PurchaseConfig,
  SignatureOBJ,
} from './types';

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

  public async saveDataRequest(
    dataRequestDto: DataSaveRequestDto,
  ): Promise<DataRequestDto> {
    const userAccountAddress = await this.request.getAccount();
    return this.request.POST(URI.DATA_REQUEST + '/add', {
      ...dataRequestDto,
      userAccountAddress,
    });
  }

  public async executeDataRequest(
    dataRequestDto: DataRequestDto,
    purchaseConfig: PurchaseConfig,
  ): Promise<void> {
    const provider = this.request.getProvider();
    const signer = this.request.getSigner();
    const account = await this.request.getAccount();
    const purchase = new Purchase(purchaseConfig.networkID, provider, signer);
    const token = await purchase.getToken(purchaseConfig.tokenName);
    await purchase.approve(token, account);
    const price: number = await this.getPrice(dataRequestDto);
    const purchaseParam = {
      requestHash: dataRequestDto.requestHash,
      time: '' + dataRequestDto.requestDate,
      productType: dataRequestDto.productType,
      signature: dataRequestDto.signature,
      price,
    };
    try {
      const tx = await purchase.request(purchaseParam, token);
      if (tx) await tx.wait();
      else throw Error('Failed to purchase');
    } catch (err) {
      console.log(err);
      throw Error('Failed to purchase');
    }
  }

  public deleteRequest(requestId: string): Promise<Array<DataRequestDto>> {
    return this.request.DELETE(URI.DATA_REQUEST + '/delete', { id: requestId });
  }

  public getAllRequests(): Promise<Array<DataRequestDto>> {
    return this.request.GET(URI.DATA_REQUEST + '/list');
  }

  public getRequestById(requestId: string): Promise<DataRequestDto> {
    return this.request.GET(URI.DATA_REQUEST + '/load', { id: requestId });
  }

  public getRequestStatus(requestId: string): Promise<DataRequestDto> {
    return this.request.GET(URI.DATA_REQUEST + '/status', { id: requestId });
  }

  public getPrice(dataRequestDto: DataRequestDto): Promise<number> {
    return this.request.POST(
      URI.DATA_REQUEST + '/calculate/price',
      dataRequestDto,
    );
  }

  public getDownloadLink(requestId: string): Promise<DataRequestDto> {
    return this.request.GET(URI.DATA_REQUEST + '/download-link', {
      id: requestId,
    });
  }

  public getSelectableColumns(dataType: string): Promise<DataProductDto> {
    return this.request.GET(URI.ACCEPTED_VALUE + '/load-data-product-by-name', {
      name: dataType,
    });
  }

  public getAcceptedValues(columnName: string): Promise<string[]> {
    return this.request.GET(URI.ACCEPTED_VALUE + '/load-by-name', {
      name: columnName,
    });
  }
}
