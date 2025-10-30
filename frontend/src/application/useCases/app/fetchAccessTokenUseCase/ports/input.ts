// src/application/useCases/fetchAccessToken/ports/input/FetchAccessTokenInputPort.ts
export interface FetchAccessTokenInputPort {
  getAccessToken(): Promise<string | null>;
}
