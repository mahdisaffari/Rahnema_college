# Rahnema College — Auth Backend

REST API for **user registration** and **login** built with Node.js, Express, Prisma, and PostgreSQL.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API](#api)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## Requirements

- **Node.js** (v18 or higher)
- **PostgreSQL**
- **npm** or **yarn**

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/mahdisaffari/Rahnema_college.git
cd Rahnema_college
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root and fill in the values described in [Environment Variables](#environment-variables).

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection URL | — |
| `SHADOW_DATABASE_URL` | Shadow database URL for Prisma Migrate | — |
| `JWT_SECRET` | Secret key for signing JWT tokens | `dev_secret_change_me` |
| `JWT_EXPIRES` | Token expiry (e.g. `15m`) | `15m` |

**Example `.env`:**

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/rahnema_db"
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/rahnema_shadow"
JWT_SECRET="your-secure-random-secret"
JWT_EXPIRES="15m"
```

---

## Running the Server

```bash
npm start
```

The server will be available at `http://localhost:3000` (or the `PORT` value from your `.env`).

---

## API

### Register

```http
POST /register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "your-password"
}
```

### Login

```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

The response includes a `token` (JWT). Send this token in the `Authorization` header for protected routes.

### Current user

```http
GET /me
Authorization: Bearer <token>
```

Requires a valid JWT in the `Authorization` header.

---

## Project Structure

```
├── prisma/
│   └── schema.prisma    # Database models
├── src/
│   ├── auth/            # Auth logic
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── validators/
│   ├── config/          # Config (env)
│   ├── routes/          # Route definitions
│   ├── types/           # TypeScript types
│   ├── utils/           # Helpers
│   └── index.ts         # Entry point
├── .env                 # Environment variables (create locally, do not commit)
├── package.json
└── README.md
```

---

## Tech Stack

- **Express** — Web framework
- **TypeScript** — Type safety
- **Prisma** — ORM and migrations
- **PostgreSQL** — Database
- **JWT** — Authentication tokens
- **Zod** — Input validation
- **bcryptjs** — Password hashing

---

## License

ISC
