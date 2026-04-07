import { Injectable } from '@nestjs/common';
import { UserType } from 'src/type';

@Injectable()
export class UsersService {
  private users: UserType[] = [];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find((u: any) => u.id === id);
  }

  create(user: any) {
    const newUser = { id: Date.now(), ...user };
    this.users.push(newUser);
    return newUser;
  }

  update(id: string, data: any) {
    const index = this.users.findIndex((u: UserType) => u.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  remove(id: string) {
    this.users = this.users.filter((u: UserType) => u.id !== id);
    return { deleted: true };
  }
}
