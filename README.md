# Core Library API

A REST API for books built with Express 5, TypeScript, Zod, Prisma, and PostgreSQL. Books persist across server restarts.

## Run

Requires Node.js 20.19 or newer and PostgreSQL. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection URL. Keep `.env` private.

```sh
npm ci
npm run db:migrate
npm run dev
```

The server listens at `http://localhost:3000` by default. Set `PORT` to use a different port.

`npm run db:migrate` applies the committed Prisma migrations. For a new schema change, edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name <change>` against a development database and commit the resulting migration. Prisma Client generation runs before development, tests, and builds; `npm run db:generate` is also available directly.

## Book model

```json
{
  "id": 1,
  "title": "Dune",
  "author": "Frank Herbert",
  "genre": "Science Fiction",
  "available": true
}
```

The API assigns the numeric `id`. `title`, `author`, and `genre` must be nonempty strings; `available` must be a boolean. POST requires all four fields. PATCH accepts one or more of them. Unknown fields are rejected.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| GET | `/books` | `200` with all books |
| GET | `/books/:id` | `200` with one book, or `404` |
| POST | `/books` | `201` with the new book and a `Location` header |
| PATCH | `/books/:id` | `200` with the updated book, or `404` |
| DELETE | `/books/:id` | `204` with no body, or `404` |

For example, POST `/books` with `Content-Type: application/json`:

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "genre": "Science Fiction",
  "available": true
}
```

Invalid POST or PATCH data returns `400` with `{ "error": "Validation failed", "details": [...] }`. Malformed JSON returns `400` with `{ "error": "Invalid JSON" }`. Unknown routes and books return `404`. Unexpected server errors return `500` without exposing internal details.

## Postman

Import [postman/Library API.postman_collection.json](postman/Library%20API.postman_collection.json) into Postman. Start the API with `npm run dev`, set the collection variable `baseUrl` if needed, and run the collection in order. The create request saves its returned `id` for the get, patch, and delete requests. The collection includes response checks and a validation error request.

## Automated checks

Set `TEST_DATABASE_URL` to a **dedicated, disposable PostgreSQL database** before running the tests. The tests truncate its `Book` table and reset its ID sequence. Never point this variable at a database containing data you need to keep. Apply the migrations to that database first; for example, in PowerShell:

```powershell
$env:DATABASE_URL = $env:TEST_DATABASE_URL
npm run db:migrate
npm test
npm run build
```

The test process uses `TEST_DATABASE_URL` for all API requests and for an independent database read. It fails before changing data if that variable is missing.

The HTTP tests exercise every CRUD endpoint, validation errors, unknown IDs, malformed JSON, a direct PostgreSQL read, and a server restart.

## Project structure

- `src/routes`: URL and HTTP method mapping
- `src/controllers`: request parsing and responses
- `src/services`: Prisma book operations
- `src/db.ts`: PostgreSQL connection and Prisma Client
- `prisma`: schema and committed migration
- `src/models`: Book type
- `src/validation`: Zod request schemas

## AI use

OpenAI Codex assisted with the original project structure, implementation, tests, Postman collection, and README. For the PostgreSQL change, Codex defined the Prisma schema and migration, replaced in-memory CRUD, extended integration tests, and updated this documentation. The new persistence test was observed failing while storage was still in memory, then passing after Prisma was wired in. Verification used a one-hour disposable Prisma Postgres database: the migration applied, all HTTP tests passed, and the TypeScript build succeeded. The test database expires unless claimed; these checks need to be repeated against the deployment database before release.
