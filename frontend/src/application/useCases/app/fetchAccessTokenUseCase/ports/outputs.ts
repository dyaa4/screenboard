// src/application/useCases/fetchAccessToken/ports/output/FetchAccessTokenOutputPort.ts
export interface FetchAccessTokenOutputPort {
  fetchAccessToken(): Promise<string | null>;
}
