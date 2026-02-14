# Rahnema College — Social Media Backend

Backend API for a **social media platform** (Instagram-like) built as a team project at **[Rahnema College Bootcamp](https://github.com/mahdisaffari/Rahnema_college)**. It provides authentication, posts, comments, likes, bookmarks, follow/followers, close friends, blocking, mentions, hashtags, and more.

**Repository:** [https://github.com/mahdisaffari/Rahnema_college](https://github.com/mahdisaffari/Rahnema_college)

---

## Table of Contents

- [Overview](#overview)
- [Branches](#branches)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Overview

This is a REST API backend for a full social media application. It supports:

- **Users**: registration, login, profiles (avatar, bio, private account), email verification, password reset
- **Posts**: create and edit posts with multiple images, captions, hashtags, mentions; close-friends-only posts
- **Engagement**: likes, bookmarks, comments (with nested replies), comment likes
- **Social graph**: follow / unfollow, follow requests, followers and followings lists, close friends
- **Safety**: block / unblock users, blocked list
- **Discovery**: homepage feed, search by username, search posts by hashtag
- **Notifications**: (data model supports mentions, likes, follow requests, comments, etc.)

The **`master`** branch contains a refactored auth-focused version. The **`dev`** branch (and related feature branches) contain the full social media implementation with all modules above.

---

## Branches

| Branch | Description |
|--------|-------------|
| `master` | Refactored auth (register, login, /me). Simpler schema. |
| `dev` | Full social media backend with posts, comments, follow, block, search, etc. |
| `s5`, `s6` | Sprint / feature branches. |
| `dev-local-s5` | Local development variant for sprint 5. |
| `feat/config-cicd` | CI/CD and config (e.g. Docker, pipeline). |
| `s2/deployment` | Deployment-related changes. |
| `ApiBlockList` | API block list feature. |

For the **full API and features**, use the **`dev`** branch.

---

## Features

- **Auth**: Register, login, logout, email verification, refresh token, forgot/reset password
- **Profile**: Get/update profile, avatar upload, toggle private account, profile posts, close friends list
- **Users**: Get user by username, add/remove close friends
- **Posts**: Create post (with up to 5 images), get post, edit post, get user posts, close-friends-only option
- **Engagement**: Like post, bookmark post, create comment, reply to comment, like comment, get comments and replies
- **Follow**: Follow user, remove follower, get my followers/followings, get user’s followers/followings
- **Block**: Block/unblock user, get blocked users list
- **Lists**: Get bookmarked posts, get posts where the user is mentioned
- **Feed**: Homepage feed
- **Search**: Search users by username, search posts by hashtag

---

## Requirements

- **Node.js** (v18 or higher)
- **PostgreSQL**
- **npm** or **yarn**

Optional (for full `dev` branch): Docker, object storage (e.g. Cloudinary or MinIO) for images.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/mahdisaffari/Rahnema_college.git
cd Rahnema_college
```

For the full social media backend, switch to the `dev` branch:

```bash
git checkout dev
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the project root (see [Environment Variables](#environment-variables)).

### 4. Database

```bash
npx prisma generate
npx prisma db push
```

On `dev`, if migrations exist:

```bash
npx prisma migrate deploy
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection URL | — |
| `SHADOW_DATABASE_URL` | Shadow DB for Prisma Migrate | — |
| `JWT_SECRET` | Secret for JWT signing | `dev_secret_change_me` |
| `JWT_EXPIRES` | Token expiry (e.g. `15m`) | `15m` |

On `dev` you may also need variables for email, file upload (e.g. Cloudinary, MinIO), etc., depending on the code.

**Example `.env` (minimal):**

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

Server runs at `http://localhost:3000` (or your `PORT`).

---

## API Overview

Protected routes require: `Authorization: Bearer <token>`.

### Auth (all branches)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register (username, email, password) |
| POST | `/login` | Login |
| GET | `/me` | Current user (auth required) |

### Additional routes on `dev`

- **Profile**: `GET/PUT /profile`, `PUT /profile/toggle-private`, `GET /profile/posts`, `GET /user/close-friends`
- **User**: `GET /users/:username`
- **Close friends**: `POST/DELETE /user/close-friends/:username`
- **Posts**: `POST /posts`, `GET/PUT /posts/:id`, `GET /users/:username/posts`, bookmark, like, comments and replies
- **Follow**: `POST /users/:username/follow`, `DELETE /users/:username/follower`, `GET /users/me/followers`, `GET /users/me/followings`, `GET /users/:username/followers`, `GET /users/:username/followings`
- **Block**: `POST/DELETE /users/:username/block`, `GET /user/blocked-users`
- **Lists**: `GET /bookmarks`, `GET /mentions`
- **Feed**: `GET /homepage`
- **Search**: `GET /search/users`, `GET /search/posts`

See `api.http` in the repo and the route definitions in `src/routes/routes.ts` on `dev` for exact request bodies and query params.

---

## Project Structure

**`master` (simplified):**

```
├── prisma/schema.prisma
├── src/
│   ├── auth/          # controllers, middleware, services, validators
│   ├── config/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── api.http
├── package.json
└── README.md
```

**`dev` (full app):**

- `src/modules/auth/` — auth (register, login, verify, refresh, password reset)
- `src/modules/post/` — post, editPost, like, bookmark, comment
- `src/modules/user/` — profile, follow, block, close friends, homepage, search, bookmarked/mentioned posts
- `src/config/` — env, multer, cloudinary, minio
- `prisma/migrations/` — database migrations
- Optional: `Dockerfile`, `docker-compose.yml`, `.gitlab-ci.yml`

---

## Tech Stack

- **Express** — Web framework
- **TypeScript** — Type safety
- **Prisma** — ORM and migrations
- **PostgreSQL** — Database
- **JWT** — Authentication
- **Zod** — Validation
- **bcryptjs** — Password hashing
- **Multer** — File upload (on `dev`)
- **Cloudinary / MinIO** — Image storage (on `dev`, optional)
- **Docker** — Containerization (on some branches)

---

## License

ISC
