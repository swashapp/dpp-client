import Web3 from 'web3';

export interface AuthSessionConfig {
  token?: string;
  onExpired?: () => void;
}

export interface SignatureOBJ {
  address: string;
  signature: string;
  nonce: number;
}

export interface TokenInfo {
  tokenName: string;
  tokenAddress: string;
  isNative: boolean;
  isSwash: boolean;
}

export interface AuthWalletConfig {
  privateKey: string;
  rpcUrl?: string;
  session?: AuthSessionConfig;
}

export interface AuthWeb3Config {
  web3: Web3;
  session?: AuthSessionConfig;
}

export interface AuthTokenConfig {
  token: string;
  onExpired: () => void;
}

export interface dppClientOptions {
  host?: string;
  servicesHost?: string;
}

export class DataDictionaryDto {
  id: string;
  name: string;
  title: string;
  description: string;
  sample: string;
}

export interface DataProductDto {
  id: string;
  name: string;
  description: string;
  dataDictionaries: DataDictionaryDto[];
}

export interface BaseResponseDto {
  readonly status: ResponseStatus;
  readonly data?: any;
  readonly count?: number;
}

export enum ResponseStatus {
  ERROR = 'error',
  SUCCESS = 'success',
  EXPIRED = 'expired',
}

export interface RequestJobDto {
  id: string;
  status: string;
  result_path: string;
  repeat_style: string;
  last_execution_time: Date;
  meta_data: string;
  run_count: number;
}

export interface DataRequestDto {
  id?: string;
  params: any;
  userAccountAddress: string;
  fileName: string;
  requestDate: number;
  status?: string;
  requestHash?: string;
  signature?: string;
  productType?: string;
  requestJob?: RequestJobDto;
  downloadable: boolean;
}

export interface DataSaveRequestDto {
  params: any;
  fileName: string;
  requestDate: number;
}

export type AuthConfig = {
  serverURL?: string;
  session?: {
    token: string;
    onExpired: () => void;
  };
  provider: {
    web3: Web3;
  };
};

export interface PurchaseConfig {
  tokenName: string;
  networkID: string;
}
