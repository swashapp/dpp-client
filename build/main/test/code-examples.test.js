"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const constants_1 = require("../constants");
const main_1 = require("../main");
const service_1 = require("../service");
dotenv.config({ path: path_1.default.resolve(process.cwd(), '.env.test') });
const createClient = async (privateKey, provider) => {
    const client = new main_1.DataProviderClient({
        auth: { privateKey, provider },
        options: {
            host: process.env.HOST || 'http://localhost:3001',
            servicesHost: process.env.SERVICES_HOST || 'http://localhost:3000',
        },
    });
    return client;
};
describe('Data request management', () => {
    let client;
    let wallet;
    let tokenName = 'SWASH';
    let networkID = '5';
    let provider;
    const checkAvailableTokens = async () => {
        const purchase = new service_1.Purchase(networkID, provider, wallet);
        const token = await purchase.getToken(tokenName);
        const contract = new ethers_1.Contract(token.tokenAddress, constants_1.ERC20_ABI, wallet);
        const balanceInWei = (await contract.balanceOf(wallet.address)).toString();
        const balance = (0, utils_1.formatEther)(balanceInWei);
        expect(Number(balance)).toBeGreaterThan(100);
    };
    const _10s = 10000;
    const _40s = 40000;
    const waitFor = async (ms) => await new Promise((resolve) => setTimeout(resolve, ms));
    const expectWhile = async (fn, props) => {
        const res = await fn();
        if (!res) {
            if (props.limit === 0)
                (0, assert_1.fail)(props.errMessage);
            waitFor(props.every);
            expectWhile(fn, {
                ...props,
                limit: props.limit - props.every,
            });
        }
    };
    const buildTestDataRequest = (fileName) => {
        return {
            params: {
                fromDate: 1642414746814,
                toDate: 1673518689839,
                dataType: 'VISITATION',
                repeatType: 'ONCE',
                selectedDpFields: [
                    'browser_name',
                    'platform',
                    'os_name',
                    'os_version',
                    'Country',
                    'Gender',
                ],
                filterCondition: {
                    combinator: 'and',
                    rules: [
                        {
                            id: 'r-0.9092211207828882',
                            field: 'country',
                            operator: 'in',
                            valueSource: 'value',
                            value: 'Australia,Turkey',
                        },
                    ],
                    id: 'g-0.4676271133369242',
                    not: false,
                },
            },
            fileName,
            requestDate: 1667390981356,
        };
    };
    const createTestDataRequest = async (fileName) => {
        return await client.dataRequest.add(buildTestDataRequest(fileName));
    };
    beforeAll(async () => {
        const privateKey = process.env.PRIVATE_KEY;
        const rpcUrl = process.env.RPC_URL ||
            'wss://goerli.infura.io/ws/v3/45a26c26f73648fc9e21496dd1bb8ad2';
        provider = new ethers_1.providers.WebSocketProvider(rpcUrl);
        wallet = new ethers_1.Wallet(privateKey, provider);
        networkID = process.env.NETWORK || '5';
        tokenName = process.env.TOKEN || 'SWASH';
        client = await createClient(privateKey, provider);
    });
    it('create data request should work correctly', async () => {
        const fileName = '' + new Date().getTime();
        await client.dataRequest.add(buildTestDataRequest(fileName));
        const dataRequests = await client.dataRequest.getAll();
        expect(dataRequests.find((d) => d.fileName === fileName)).toBeTruthy();
    });
    it('delete data request should work correctly', async () => {
        const fileName = '' + new Date().getTime();
        await createTestDataRequest(fileName);
        let dataRequests = await client.dataRequest.getAll();
        const dataRequest = dataRequests.find((d) => d.fileName === fileName);
        expect(dataRequest).toBeTruthy();
        await client.dataRequest.with(dataRequest?.id).delete();
        dataRequests = await client.dataRequest.getAll();
        expect(dataRequests.find((d) => d.fileName === fileName)).toBeFalsy();
    });
    it('provide data should work correctly', async () => {
        await checkAvailableTokens();
        const fileName = '' + new Date().getTime();
        const dataRequest = await createTestDataRequest(fileName);
        await client.dataRequest
            .with(dataRequest.id)
            .provide({ tokenName, networkID });
        await expectWhile(async () => {
            const dataReq = await client.dataRequest
                .with(dataRequest.id)
                .get();
            return (!!dataReq?.requestJob && dataReq?.requestJob.status === 'STARTED');
        }, { every: _10s, limit: _40s, errMessage: 'Failed to provide' });
    }, 60000);
});
//# sourceMappingURL=code-examples.test.js.map