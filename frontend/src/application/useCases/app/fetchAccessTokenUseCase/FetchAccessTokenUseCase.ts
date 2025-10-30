// src/application/useCases/fetchAccessToken/FetchAccessTokenUseCase.ts
import { inject, singleton } from 'tsyringe';
import { FetchAccessTokenInputPort } from './ports/input';
import type { FetchAccessTokenOutputPort } from './ports/outputs';
import { FETCH_ACCESS_TOKEN_OUTPUT_PORT } from '@common/constants';

@singleton()
export default class FetchAccessTokenUseCase
  implements FetchAccessTokenInputPort
{
  constructor(
    @inject(FETCH_ACCESS_TOKEN_OUTPUT_PORT)
    private readonly fetchAccessTokenOutputPort: FetchAccessTokenOutputPort,
  ) {}

  async getAccessToken(): Promise<string | null> {
    return await this.fetchAccessTokenOutputPort.fetchAccessToken();
  }
}
