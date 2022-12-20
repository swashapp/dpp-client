import Blob from 'buffer';

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
  SignedDataRequestDto,
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
    id: string,
    purchaseConfig: PurchaseConfig,
  ): Promise<void> {
    const provider = this.request.getProvider();
    const signer = this.request.getSigner();
    const account = await this.request.getAccount();
    const purchase = new Purchase(purchaseConfig.networkID, provider, signer);
    const token = await purchase.getToken(purchaseConfig.tokenName);
    await purchase.approve(token, account);
    const signedDataRequestDto = await this.signDataRequest(id);

    try {
      const tx = await purchase.request(signedDataRequestDto, token);
      if (tx) await tx.wait();
      else throw Error('Failed to purchase');
    } catch (err) {
      console.log(err);
      throw Error('Failed to purchase');
    }

    this.purchased(id);
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

  public getPrice(
    requestId: string,
  ): Promise<{ title: string; price: number }[]> {
    return this.request.POST(URI.DATA_REQUEST + '/calculate/price', {
      id: requestId,
    });
  }

  private signDataRequest(requestId: string): Promise<SignedDataRequestDto> {
    return this.request.POST(URI.DATA_REQUEST + '/sign', {
      id: requestId,
    });
  }

  public async downloadData(requestId: string): Promise<Blob> {
    const res = await this.request.DOWNLOAD(URI.DATA_REQUEST + '/download', {
      id: requestId,
    });
    return await res.blob();
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

  private purchased(requestId: string): Promise<string[]> {
    return this.request.POST(URI.DATA_REQUEST + '/purchased', {
      id: requestId,
    });
  }
}
