export class BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {
    this._id = crypto.randomUUID();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
