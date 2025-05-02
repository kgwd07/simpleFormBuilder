# SIMPLE FORM BUIDLER

## Overview

A Simple Form builer application built with Next.js, Prisma ORM, Node.js, and MongoDB, using Zustand for state management.

## Tech Stack

- **Frontend**: Next.js 15
- **Backend**: Node.js
- **Database**: MongoDB
- **ORM**: Prisma
- **State Management**: Zustand

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18.x or later)
- npm (v9.x or later) or yarn (v1.22.x or later)
- MongoDB (local instance or MongoDB Atlas account)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kgwd07/simpleFormBuilder.git
cd simpleFormBuilder
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="mongodb+srv://username:password@cluster0.mongodb.net/your-database?retryWrites=true&w=majority"
```

### 4. Set Up Prisma

Initialize and generate the Prisma client:

```bash
npx prisma generate
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).


## Working with Prisma

### Updating the Schema

1. Modify the `prisma/schema.prisma` file
2. Run `npx prisma generate` to update the Prisma client
3. Run `npx prisma db push` to update your database schema

### Using Prisma Studio

Prisma provides a visual interface to view and edit your data:

```bash
npx prisma studio
```

This will open Prisma Studio at [http://localhost:5555](http://localhost:5555).
