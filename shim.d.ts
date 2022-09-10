import { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
  export interface ProtocolMap {
    api_call: ProtocolWithReturn<ApiCall, ApiResponse>;
  }
}

interface ApiCall<DataType = any> {
  type: string;
  data?: DataType;
  callID: number | string;
}

interface ApiResponse<DataType = any> extends ApiCall<DataType> {
  error?: boolean;
}