import { BaseEntity } from "./BaseEntity";

export class User extends BaseEntity {
    auth0Id: string;
    name: string;
    email: string;
    picture?: string;
  
    constructor(auth0Id: string, name: string, email: string, picture?: string) {
      super(); // Aufruf des Konstruktors von BaseEntity
      this.auth0Id = auth0Id;
      this.name = name;
      this.email = email;
      this.picture = picture; // Optionales Feld
    }
  }
  