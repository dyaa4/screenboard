import { IUserDocument } from '../../domain/types';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class UserService {
  constructor(private userRepository: IUserRepository) { }

  async createUser(userData: IUserDocument): Promise<IUserDocument> {
    return this.userRepository.create(userData);
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<IUserDocument[]> {
    return this.userRepository.findAll();
  }
}
