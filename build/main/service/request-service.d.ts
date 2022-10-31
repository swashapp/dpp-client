/// <reference types="node" />
import { providers, Signer } from 'ethers';
import { AuthSessionConfig, dppClientOptions, SignatureOBJ } from '../types';
export declare enum URI {
    DATA_REQUEST = "data-request",
    ACCEPTED_VALUE = "accepted-value",
    SIGNATURE = "public/signature",
    LOG = "log"
}
export declare function encodeQueryString(params: {
    [key: string]: string | boolean | number;
}): string;
export declare const MESSAGE_TO_SIGN_PREFIX = "I am signing my one-time nonce";
export declare abstract class Request {
    private options?;
    private session?;
    constructor(session?: AuthSessionConfig, options?: dppClientOptions);
    private getServerApiURL;
    private getServicesApiURL;
    protected signWith(signMessage: (nonce: number) => Promise<SignatureOBJ>): Promise<SignatureOBJ>;
    abstract getSignatureObj(): Promise<SignatureOBJ>;
    abstract getProvider(): providers.BaseProvider;
    abstract getAccount(): Promise<string>;
    abstract getSigner(): Signer;
    protected createRequest(method?: string): Promise<RequestInit>;
    protected call<Type>(url: string, req: any): Promise<Type>;
    private send;
    GET<Type>(api: string, params?: any): Promise<Type>;
    DELETE<Type>(api: string, params?: any): Promise<Type>;
    POST<Type>(api: string, body?: any): Promise<Type>;
    PUT<Type>(api: string, body?: any): Promise<Type>;
    DOWNLOAD<Type>(api: string, params?: any): Promise<any>;
    POSTFile<Type>(api: string, file: File | Buffer, fileName: string): Promise<Type>;
}
