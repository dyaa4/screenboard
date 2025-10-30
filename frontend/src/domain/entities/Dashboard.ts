import { BaseEntity } from './BaseEntity';

export class Dashboard extends BaseEntity {
  userId: string;
  name: string;
  constructor(userId: string, name: string) {
    super();
    this.userId = userId;
    this.name = name;
  }
}
