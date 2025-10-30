import { ObjectId } from "mongodb";

export class BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {
    this._id = new ObjectId().toHexString();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
