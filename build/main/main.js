"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProviderClient = void 0;
const service_1 = require("./service");
class DataProviderClient {
    constructor(config) {
        this.dataRequest = {
            getAll: () => this.request.GET(service_1.URI.DATA_REQUEST + '/list'),
            add: async (req) => {
                const userAccountAddress = await this.request.getAccount();
                return this.request.POST(service_1.URI.DATA_REQUEST, {
                    ...req,
                    userAccountAddress,
                });
            },
            with: (id) => {
                const sdk = this;
                return {
                    provide: async (purchaseConfig) => {
                        const provider = sdk.request.getProvider();
                        const signer = sdk.request.getSigner();
                        const account = await sdk.request.getAccount();
                        const purchase = new service_1.Purchase(purchaseConfig.networkID, provider, signer);
                        const token = await purchase.getToken(purchaseConfig.tokenName);
                        await purchase.approve(token, account);
                        const signedDataRequestDto = await sdk.sign(id);
                        try {
                            const routePath = await purchase.getRoutePath(token, signedDataRequestDto.price);
                            const gasLimit = await purchase.estimateGas(signedDataRequestDto, token, routePath);
                            const tx = await purchase.request(signedDataRequestDto, token, routePath, gasLimit);
                            if (tx) {
                                console.log(tx);
                                await this.request.PUT(service_1.URI.DATA_REQUEST, {
                                    id: signedDataRequestDto.dataRequestId,
                                    networkId: purchase.networkID,
                                    txId: tx.hash,
                                });
                                await tx.wait(1);
                            }
                            else {
                                throw Error('Failed to purchase');
                            }
                        }
                        catch (err) {
                            console.log(err);
                            const reason = err.reason || err.error?.message;
                            throw Error(reason || 'Failed to purchase');
                        }
                    },
                    delete: () => {
                        return sdk.request.DELETE(service_1.URI.DATA_REQUEST, { id });
                    },
                    get: () => {
                        return sdk.request.GET(service_1.URI.DATA_REQUEST, { id });
                    },
                    downloadSample: async () => {
                        const res = await sdk.request.DOWNLOAD(`${service_1.URI.DATA_REQUEST}/sample-data`, {
                            id,
                        });
                        return await res.blob();
                    },
                    getPrice: () => {
                        return sdk.request.GET(service_1.URI.DATA_REQUEST + '/price', {
                            id,
                        });
                    },
                };
            },
        };
        this.dataLake = {
            getSchema: (name) => {
                return this.request.GET(service_1.URI.DATA_LAKE + '/schema', {
                    name,
                });
            },
            getAcceptedValues: (columnName) => {
                return this.request.GET(service_1.URI.DATA_LAKE + '/accepted-values', {
                    name: columnName,
                });
            },
        };
        const auth = config.auth;
        const options = config.options;
        if (auth.web3)
            this.request = new service_1.Web3Request(auth, options);
        else if (auth.privateKey)
            this.request = new service_1.WalletRequest(auth, options);
    }
    getSignature() {
        return this.request.getSignatureObj();
    }
    sign(id) {
        return this.request.POST(service_1.URI.DATA_REQUEST + '/sign', { id });
    }
}
exports.DataProviderClient = DataProviderClient;
//# sourceMappingURL=main.js.map