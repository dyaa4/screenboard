import { BaseEntity } from "./BaseEntity";

export class Dashboard extends BaseEntity {
    name: string;
    userId: string;
    constructor(name: string, userId: string) {
        super();
        this.name = name;
        this.userId = userId;
    }
}