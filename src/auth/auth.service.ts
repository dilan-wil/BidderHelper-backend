import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(data: CreateUserDto) {
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: { ...data, password: hashed },
    });

    return this.generateToken(user.id);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id);
  }

  generateToken(userId: string) {
    return {
      access_token: this.jwt.sign({ sub: userId }),
    };
  }
}
