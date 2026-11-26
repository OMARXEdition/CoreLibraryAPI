# Core Library API

A REST API for books built with Express 5, TypeScript, and Zod. Data is held in memory and resets when the process restarts.

## Run

Requires Node.js 18 or newer.

```sh
npm ci
npm run dev
```

The server listens at `http://localhost:3000` by default. Set `PORT` to use a different port.

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

```sh
npm test
npm run build
```

The HTTP tests exercise the same CRUD and error behavior as the Postman collection using a temporary local server.

## Project structure

- `src/routes`: URL and HTTP method mapping
- `src/controllers`: request parsing and responses
- `src/services`: in-memory book storage
- `src/models`: Book type
- `src/validation`: Zod request schemas

## AI use

OpenAI Codex assisted with project structure, implementation, tests, the Postman collection, and this README. The generated code was checked with the automated HTTP tests and TypeScript build. The Postman collection is supplied for manual execution.
