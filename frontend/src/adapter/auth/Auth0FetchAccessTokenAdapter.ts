// src/infrastructure/auth/Auth0FetchAccessTokenAdapter.ts

import { FetchAccessTokenOutputPort } from '../../application/useCases/app/fetchAccessTokenUseCase/ports/outputs';
import { singleton } from 'tsyringe';

@singleton()
export default class Auth0FetchAccessTokenAdapter
  implements FetchAccessTokenOutputPort
{
  private getAccessTokenFunction: () => Promise<string | null>;

  constructor(getAccessTokenFunction: () => Promise<string | null>) {
    this.getAccessTokenFunction = getAccessTokenFunction;
  }

  async fetchAccessToken(): Promise<string | null> {
    try {
      return await this.getAccessTokenFunction();
    } catch (error) {
      console.error('Fehler beim Abrufen des Access Tokens:', error);
      return null;
    }
  }
}
