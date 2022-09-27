import { Request, URI } from './request-service';
import { AuthConfig, DataProductDto, DataRequestDto } from './types';

export class DataProviderClient {
  private request: Request;

  constructor(config: AuthConfig) {
    this.request = new Request(config);
  }

  public sign(): Promise<{ wallet: string; signature: string }> {
    return this.request.sign();
  }

  public sendRequest(dataRequestDto: DataRequestDto): Promise<DataRequestDto> {
    return this.request.POST(URI.DATA_REQUEST + '/add', dataRequestDto);
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
