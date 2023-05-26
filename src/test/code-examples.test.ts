import { fail } from 'assert';

import path from 'path';

import * as dotenv from 'dotenv';
import { Contract, providers, Wallet } from 'ethers';

import { formatEther } from 'ethers/lib/utils';

import { ERC20_ABI } from '../constants';
import { DataProviderClient } from '../main';
import { Purchase } from '../service';
import { DataRequest, DataRequestDetails } from '../types';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const createClient = async (
  privateKey: string,
  provider: providers.BaseProvider,
): Promise<DataProviderClient> => {
  const client = new DataProviderClient({
    auth: { privateKey, provider },
    options: {
      host: process.env.HOST || 'http://localhost:3001',
      servicesHost: process.env.SERVICES_HOST || 'http://localhost:3000',
    },
  });
  return client;
};

describe('Data request management', () => {
  let client: DataProviderClient;
  let wallet: Wallet;
  let tokenName = 'SWASH';
  let networkID = '5';
  let provider: providers.BaseProvider;

  const checkAvailableTokens = async (): Promise<void> => {
    //arrange
    const purchase = new Purchase(networkID, provider, wallet);
    const token = await purchase.getToken(tokenName);
    const contract = new Contract(token.token.address, ERC20_ABI, wallet);

    //act
    const balanceInWei = (await contract.balanceOf(wallet.address)).toString();
    const balance = formatEther(balanceInWei);

    //assert
    expect(Number(balance)).toBeGreaterThan(100);
  };

  const _10s = 10000;
  const _40s = 40000;

  const waitFor = async (ms: number): Promise<any> =>
    await new Promise((resolve) => setTimeout(resolve, ms));

  const expectWhile = async (
    fn: () => Promise<boolean>,
    props: { every: number; limit: number; errMessage: string },
  ): Promise<void> => {
    const res = await fn();
    if (!res) {
      if (props.limit === 0) fail(props.errMessage);
      waitFor(props.every);
      expectWhile(fn, {
        ...props,
        limit: props.limit - props.every,
      });
    }
  };
  const buildTestDataRequest = (fileName: string): DataRequestDetails => {
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

  const createTestDataRequest = async (
    fileName: string,
  ): Promise<DataRequest> => {
    return await client.dataRequest.add(buildTestDataRequest(fileName));
  };

  beforeAll(async () => {
    const privateKey = process.env.PRIVATE_KEY as string;
    const rpcUrl =
      process.env.RPC_URL ||
      'wss://goerli.infura.io/ws/v3/45a26c26f73648fc9e21496dd1bb8ad2';
    provider = new providers.WebSocketProvider(rpcUrl);
    wallet = new Wallet(privateKey, provider);
    networkID = process.env.NETWORK || '5';
    tokenName = process.env.TOKEN || 'SWASH';
    client = await createClient(privateKey, provider);
  });

  it('create data request should work correctly', async () => {
    //arrange
    const fileName = '' + new Date().getTime();

    //act
    await client.dataRequest.add(buildTestDataRequest(fileName));

    //assert
    const dataRequests = await client.dataRequest.getAll();
    expect(dataRequests.find((d) => d.fileName === fileName)).toBeTruthy();
  });

  it('delete data request should work correctly', async () => {
    //arrange
    const fileName = '' + new Date().getTime();
    await createTestDataRequest(fileName);

    //assert
    let dataRequests = await client.dataRequest.getAll();
    const dataRequest = dataRequests.find((d) => d.fileName === fileName);
    expect(dataRequest).toBeTruthy();

    //act
    await client.dataRequest.with(dataRequest?.id as string).delete();

    //assert
    dataRequests = await client.dataRequest.getAll();
    expect(dataRequests.find((d) => d.fileName === fileName)).toBeFalsy();
  });

  it('provide data should work correctly', async () => {
    //pre-cond
    await checkAvailableTokens();

    //arrange
    const fileName = '' + new Date().getTime();
    const dataRequest = await createTestDataRequest(fileName);

    //act
    await client.dataRequest
      .with(dataRequest.id as string)
      .provide({ tokenName, networkID });

    //assert
    await expectWhile(
      async () => {
        const dataReq = await client.dataRequest
          .with(dataRequest.id as string)
          .get();
        return (
          !!dataReq?.requestJob && dataReq?.requestJob.status === 'STARTED'
        );
      },
      { every: _10s, limit: _40s, errMessage: 'Failed to provide' },
    );
  }, 60000);
});
