# generic-ws

A generic REST API server built with NestJS and Fastify, supporting dynamic CRUD operations for any model and table using reflection and metadata.

## Features

- Dynamic CRUD endpoints for any model/table
- PostgreSQL integration via `pg`
- Automatic property mapping using decorators
- Pagination support for read operations
- Configurable via `.env` file

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database

### Installation

```sh
npm install
```

### Configuration

Copy the `.env.example` file to `.env` and update the database connection settings:

```sh
cp .env.example .env
```

### Running the Server

```sh
npm run start:dev
```

The server will start on the configured port (default: 3000).

## API Usage

All endpoints are prefixed with `/api`.

### Generic CRUD Endpoint

**POST** `/api/gen?action={action}&className={ClassName}&tableName={tableName}`

#### Actions

- `create`: Insert a new record
- `read`: Query records (supports pagination)
- `update`: Update records
- `delete`: Delete records

#### Request Body

```json
{
  "data": { /* properties for create/read/delete */ },
  "objectToUpdate": { /* filter for update */ },
  "objectToUpdateWith": { /* new values for update */ },
  "afterWhere": "optional SQL after WHERE"
}
```

#### Example: Create

```sh
curl -X POST "http://localhost:3000/api/gen?action=create&className=Person&tableName=person" \
  -H "Content-Type: application/json" \
  -d '{"data": {"firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "1234567890"}}'
```

#### Example: Read with Pagination

```sh
curl -X POST "http://localhost:3000/api/gen?action=read&className=Person&tableName=person&page=1&limit=10" \
  -H "Content-Type: application/json" \
  -d '{"data": {}}'
```

#### Example: Update

```sh
curl -X POST "http://localhost:3000/api/gen?action=update&className=Person&tableName=person" \
  -H "Content-Type: application/json" \
  -d '{"objectToUpdate": {"id": "PERS1"}, "objectToUpdateWith": {"email": "new@email.com"}}'
```

#### Example: Delete

```sh
curl -X POST "http://localhost:3000/api/gen?action=delete&className=Person&tableName=person" \
  -H "Content-Type: application/json" \
  -d '{"data": {"id": "PERS1"}}'
```

### Metadata Endpoint

**GET** `/api/meta?className={ClassName}&tableName={tableName}`

Returns the fields and types for the specified class and table.

#### Example

```sh
curl "http://localhost:3000/api/meta?className=Person&tableName=person"
```

## Project Structure

- `src/model/`: Model classes (e.g., `Person`)
- `src/controller/`: API controllers
- `src/util/`: Utility classes (reflection, database, etc.)
- `src/annotation/`: Decorators for properties and sequences

## Extending

To add a new model:
1. Create a class in `src/model/` extending `GenModel`.
2. Decorate properties with `@Property()` and sequences with `@Sequence`.
3. Use the class name and table name in API requests.

---

**Note:** This project is intended for rapid prototyping and internal tools. Use with caution in production
