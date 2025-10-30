import { IUserRepository } from '../../domain/repositories/IUserRepository';
import UserModel from '../database/UserModel';
import { IUserDocument } from '../../domain/types';

export class UserRepository implements IUserRepository {
  create(user: IUserDocument): Promise<IUserDocument> {
    return UserModel.create(user);
  }
  async findById(id: string) {
    return UserModel.findById(id).exec();
  }

  async findAll() {
    return UserModel.find().exec();
  }

  // Füge hier weitere Methoden hinzu, falls nötig
}
