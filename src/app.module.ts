import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ResumesModule } from './resumes/resumes.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { CoversModule } from './covers/covers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    ResumesModule,
    RecommendationsModule,
    CoversModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
