import { Purchase, Request, URI, WalletRequest, Web3Request } from './service';
import {
  AuthTokenConfig,
  AuthWalletConfig,
  AuthWeb3Config,
  DataLake,
  DataLakeSchema,
  DataReq,
  DataReqFN,
  DataRequest,
  DataRequestDetails,
  dppClientOptions,
  PurchaseConfig,
  SignatureOBJ,
  SignedDataRequest,
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

  private sign(id: string, network: number): Promise<SignedDataRequest> {
    return this.request.POST(URI.DATA_REQUEST + '/sign', { id, network });
  }

  public dataRequest: DataReq = {
    getAll: (): Promise<DataRequest[]> =>
      this.request.GET(URI.DATA_REQUEST + '/list'),
    add: async (req: DataRequestDetails): Promise<DataRequest> => {
      const userAccountAddress = await this.request.getAccount();
      return this.request.POST(URI.DATA_REQUEST, {
        ...req,
        userAccountAddress,
      });
    },
    with: (id: string): DataReqFN => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const sdk = this;
      return {
        provide: async (purchaseConfig: PurchaseConfig): Promise<void> => {
          const provider = sdk.request.getProvider();
          const signer = sdk.request.getSigner();
          const account = await sdk.request.getAccount();
          const purchase = new Purchase(
            purchaseConfig.networkID,
            provider,
            signer,
          );
          const token = await purchase.getToken(purchaseConfig.tokenName);
          await purchase.approve(token, account);
          const signedDataRequestDto = await sdk.sign(
            id,
            Number(purchaseConfig.networkID),
          );

          try {
            const routePath = await purchase.getRoutePath(
              token,
              signedDataRequestDto.price,
            );
            const gasLimit = await purchase.estimateGas(
              signedDataRequestDto,
              token,
              routePath,
            );
            const tx = await purchase.request(
              signedDataRequestDto,
              token,
              routePath,
              gasLimit,
            );
            if (tx) {
              console.log(tx);
              await this.request.PUT(URI.DATA_REQUEST, {
                id: signedDataRequestDto.dataRequestId,
                networkId: purchaseConfig.networkID,
                txId: tx.hash,
              });
              await tx.wait(1);
            } else {
              throw Error('Failed to purchase');
            }
          } catch (err) {
            console.log(err);
            const reason = err.reason || err.error?.message;
            throw Error(reason || 'Failed to purchase');
          }
        },

        delete: (): Promise<DataRequest> => {
          return sdk.request.DELETE(URI.DATA_REQUEST, { id });
        },

        get: (): Promise<DataRequest> => {
          return sdk.request.GET(URI.DATA_REQUEST, { id });
        },
        downloadSample: async (): Promise<Blob> => {
          const res = await sdk.request.DOWNLOAD(
            `${URI.DATA_REQUEST}/sample-data`,
            {
              id,
            },
          );
          return await res.blob();
        },
        getPrice: (): Promise<{ title: string; price: number }[]> => {
          return sdk.request.GET(URI.DATA_REQUEST + '/price', {
            id,
          });
        },
      };
    },
  };

  public dataLake: DataLake = {
    getSchema: (name: string): Promise<DataLakeSchema> => {
      return this.request.GET(URI.DATA_LAKE + '/schema', {
        name,
      });
    },

    getAcceptedValues: (columnName: string): Promise<string[]> => {
      return this.request.GET(URI.DATA_LAKE + '/accepted-values', {
        name: columnName,
      });
    },
  };
}
