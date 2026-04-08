# BidderHelper API

A powerful NestJS-based API that intelligently matches resumes to job descriptions using vector embeddings and generates personalized cover letters using AI.

## Features

- **User Authentication** - JWT-based secure authentication
- **Resume Upload** - Support for PDF, DOCX, and other document formats
- **Smart Resume Matching** - Uses vector embeddings to find semantically similar resumes
- **AI Cover Letter Generation** - Creates personalized cover letters based on top matching resumes
- **Cloud Storage** - Integrates with Cloudinary for resume storage
- **Vector Search** - PostgreSQL pgvector for efficient similarity search

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Tech Stack

| Category             | Technologies                   |
| -------------------- | ------------------------------ |
| **Framework**        | NestJS                         |
| **Database**         | PostgreSQL(Neon) with pgvector |
| **ORM**              | Prisma                         |
| **Authentication**   | JWT (jsonwebtoken)             |
| **File Storage**     | Cloudinary                     |
| **AI/ML**            | Hugging Face Transformers      |
| **Document Parsing** | officeparser                   |
| **Language**         | TypeScript                     |

## Prerequisites

- Node.js (v20.18 or higher)
- PostgreSQL(Neon) with pgvector extension
- Cloudinary account
- Hugging Face account (for embeddings)

## Installation

```bash
# Clone the repository

git clone <your-repo-url>
cd <project-directory>

# Install dependencies

npm install

# Set up environment variables

cp .env.example .env

# Generate Prisma client

npx prisma generate

# Run database migrations

npx prisma migrate dev

# Start the application

npm run start
```

## Environment Variables

```bash
Create a .env file in the root directory:

env

# Database

DATABASE_URL=

# JWT Authentication

JWT_SECRET="your-super-secret-jwt-key"

# Cloudinary

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Hugging Face

HF_TOKEN="hf_your-token-here"
```

## Database Setup

```bash
Install pgvector
sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
Prisma Schema
prisma
model User {
id String @id @default(uuid()) @db.Uuid
name String
email String @unique
password String
createdAt DateTime @default(now())
resumes Resume[]
}

model Resume {
id String @id @default(uuid()) @db.Uuid
filename String
fileUrl String
text String
embedding Unsupported("vector(384)")
userId String @db.Uuid
createdAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
}

## Run Migrations

# Create migration

npx prisma migrate dev --name init

# Apply migration

npx prisma db push

# Reset database (development only)

npx prisma migrate reset

## Running the Application

# Development mode

npm run start

# Production mode

npm run build
npm run start:prod

# Debug mode

npm run start:debug
```

## API Documentation

```bash
#Authentication Endpoints
#Sign Up
POST /users/signup
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"password": "password123"
}
Response:

json
{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
"user": {"email": ""......}
}

#Login
POST /auth/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "password123"
}
Response:

json
{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"user": {"email": "",....}
}

##Resume Endpoints

#Upload Resumes

POST /resumes/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Upload single file

files: @/path/to/resume.pdf

# Upload multiple files

files: @/path/to/resume1.pdf
files: @/path/to/resume2.docx
files: @/path/to/resume3.pdf
Supported formats: PDF, DOCX, DOC, TXT

Response:

json
{
"results": [
{ "fileUrl": "url", "embedding": "[]", "filename": "resume1.pdf".....},
{ "filename": "resume2.docx" ....}
]
}

#Get All Resumes
GET /resumes
Authorization: Bearer <token>
Response:

json
{
"resumes": [
{
"id": "uuid",
"filename": "resume.pdf",
"fileUrl": "https://cloudinary.com/...",
"createdAt": "2024-01-01T00:00:00Z"
}
]
}

##Recommendations Endpoints

#Find Matching Resumes
POST /recommendations/match
Authorization: Bearer <token>
Content-Type: application/json

# By text

{
"text": "Looking for a software engineer with Node.js and React experience"
}

# By file upload

POST /recommendations/match
Authorization: Bearer <token>
Content-Type: multipart/form-data
file: @/path/to/job-description.pdf
Response:

json
{
"jobDescription": "Looking for a software engineer...",
"matches": [
{
"id": "uuid",
"filename": "resume1.pdf",
"fileUrl": "https://...",
"text": "...",
"similarity": 0.89
},
{
"id": "uuid",
"filename": "resume2.pdf",
"similarity": 0.76
}
]
}

##Cover Letter Endpoints
#Generate Cover Letter
POST /cover-letter/generate
Authorization: Bearer <token>
Content-Type: application/json

{
"resumeText": "Software engineer with 5 years experience...",
"jobDescription": "Looking for a developer with..."
}
Response:

json
{
"coverLetter": "Dear Hiring Manager,\n\nI am writing to express my interest..."
}
```

## Testing

```bash
Complete User Flow

# 1. Sign up

TOKEN=$(curl -s -X POST http://localhost:3000/users/signup \
 -H "Content-Type: application/json" \
 -d '{"name":"John Doe","email":"john@example.com","password":"password123"}' \
 | jq -r '.token')

# 2. Upload resumes

curl -X POST http://localhost:3000/resumes/upload \
 -H "Authorization: Bearer $TOKEN" \
 -F "files=@./resume1.pdf" \
 -F "files=@./resume2.pdf"

# 3. Find matching resumes

curl -X POST http://localhost:3000/recommendations/match \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"text":"Looking for a Node.js developer"}'

# 4. Generate cover letter

curl -X POST http://localhost:3000/cover-letter/generate \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
"resumeText": "Your resume text here",
"jobDescription": "Your job description here"
}'
```

## Project Structure

```bash
src/
├── auth/ # JWT authentication
│ ├── jwt.guard.ts
│ └── auth.module.ts
├── users/ # User management
│ ├── users.controller.ts
│ ├── users.service.ts
│ └── users.module.ts
├── resumes/ # Resume upload & management
│ ├── resumes.controller.ts
│ ├── resumes.service.ts
│ └── resumes.module.ts
├── recommendations/ # Resume matching
│ ├── recommendations.controller.ts
│ ├── recommendations.service.ts
│ └── recommendations.module.ts
├── covers/ # Cover letter generation
│ ├── covers.controller.ts
│ ├── covers.service.ts
│ └── covers.module.ts
├── functions/ # Utility functions
│ ├── embedding.service.ts # Vector embeddings
│ ├── parser.service.ts # Document parsing
│ └── embedding.module.ts
├── prisma/ # Database
│ ├── prisma.service.ts
│ └── prisma.module.ts
└── cloudinary/ # File storage
└── cloudinary.storage.ts
```

## How It Works

```bash
Resume Processing Flow
Upload → File stored in Cloudinary

Parse → Text extracted using officeparse

Embed → Text converted to vector (384 dimensions)

Store → Resume data + vector stored in PostgreSQL

Matching Flow
Input → Job description (text or file)

Embed → Convert job description to vector

Search → Find top 3 resumes using cosine similarity

Return → Ranked results with similarity scores

Cover Letter Generation
Input → Resume text + Job description

Generate → AI creates personalized cover letter

Return → Professional cover letter
```

## Troubleshooting

```bash
Database Connection Issues

# Error: EAI_AGAIN

# Solution: Check internet or restart Neon database

# Error: P1001: Can't reach database

# Solution: Verify DATABASE_URL in .env

Vector Extension Issues
sql
-- If vector type doesn't exist
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension
\dx
Embedding Generation Issues

# First run downloads model (may take time)

# Model is cached after first use

# If out of memory, try smaller batch sizes

Cloudinary Issues

# Verify credentials

npx cloudinary-cli info

# Test upload directly

curl -X POST "https://api.cloudinary.com/v1_1/your-cloud/auto/upload" \
 -F "file=@test.pdf"
```
