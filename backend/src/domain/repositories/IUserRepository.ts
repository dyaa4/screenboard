import { IUserDocument } from "../../domain/types";
export interface IUserRepository {
  create(user: IUserDocument): Promise<IUserDocument>;
  findById(id: string): Promise<IUserDocument | null>;
  findAll(): Promise<IUserDocument[]>;
}
