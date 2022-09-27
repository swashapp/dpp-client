import Web3 from 'web3';

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
  id: string;
  params: any;
  userAccountAddress: string;
  fileName: string;
  savingDirectory?: string;
  userAwsId: string;
  requestDate: number;
  status: string;
  requestJob: RequestJobDto;
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

