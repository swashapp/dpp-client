"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProviderClient = void 0;
const service_1 = require("./service");
class DataProviderClient {
    constructor(config) {
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
    async saveDataRequest(dataRequestDto) {
        const userAccountAddress = await this.request.getAccount();
        return this.request.POST(service_1.URI.DATA_REQUEST + '/add', {
            ...dataRequestDto,
            userAccountAddress,
        });
    }
    async executeDataRequest(dataRequestDto, purchaseConfig) {
        const provider = this.request.getProvider();
        const signer = this.request.getSigner();
        const account = await this.request.getAccount();
        const purchase = new service_1.Purchase(purchaseConfig.networkID, provider, signer);
        const token = await purchase.getToken(purchaseConfig.tokenName);
        await purchase.approve(token, account);
        const price = await this.getPrice(dataRequestDto);
        const purchaseParam = {
            requestHash: dataRequestDto.requestHash,
            time: '' + dataRequestDto.requestDate,
            productType: dataRequestDto.productType,
            signature: dataRequestDto.signature,
            price,
        };
        try {
            const tx = await purchase.request(purchaseParam, token);
            if (tx)
                await tx.wait();
            else
                throw Error('Failed to purchase');
        }
        catch (err) {
            console.log(err);
            throw Error('Failed to purchase');
        }
    }
    deleteRequest(requestId) {
        return this.request.DELETE(service_1.URI.DATA_REQUEST + '/delete', { id: requestId });
    }
    getAllRequests() {
        return this.request.GET(service_1.URI.DATA_REQUEST + '/list');
    }
    getRequestById(requestId) {
        return this.request.GET(service_1.URI.DATA_REQUEST + '/load', { id: requestId });
    }
    getRequestStatus(requestId) {
        return this.request.GET(service_1.URI.DATA_REQUEST + '/status', { id: requestId });
    }
    getPrice(dataRequestDto) {
        return this.request.POST(service_1.URI.DATA_REQUEST + '/calculate/price', dataRequestDto);
    }
    getDownloadLink(requestId) {
        return this.request.GET(service_1.URI.DATA_REQUEST + '/download-link', {
            id: requestId,
        });
    }
    getSelectableColumns(dataType) {
        return this.request.GET(service_1.URI.ACCEPTED_VALUE + '/load-data-product-by-name', {
            name: dataType,
        });
    }
    getAcceptedValues(columnName) {
        return this.request.GET(service_1.URI.ACCEPTED_VALUE + '/load-by-name', {
            name: columnName,
        });
    }
}
exports.DataProviderClient = DataProviderClient;
//# sourceMappingURL=main.js.map