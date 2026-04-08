// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('BidderHelper')
    .setDescription(
      `
      API for intelligent resume matching and cover letter generation using AI.
      
      ## Features
      - User authentication with JWT
      - Upload and parse resumes (PDF, DOCX, etc.)
      - Smart resume matching using vector embeddings
      - AI-powered cover letter generation
      
      ## Authentication
      Use the /auth/login or /users/signup endpoints to get a JWT token.
      Then include the token in the Authorization header: \`Bearer <token>\`
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User signup and login')
    .addTag('Resumes', 'Upload and manage resumes')
    .addTag('Recommendations', 'Find matching resumes')
    .addTag('Cover Letter', 'Generate AI cover letters')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(3000);
  console.log(`API Documentation: http://localhost:3000/api-docs`);
}
bootstrap();
