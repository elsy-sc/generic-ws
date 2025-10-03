# Generic Web Service (generic-ws)

A generic web service built with NestJS and Fastify, providing dynamic CRUD operations for any model and table using reflection and metadata.

## 🚀 Features

- **Dynamic CRUD** : Generic endpoints for any PostgreSQL table/model (currently supports PostgreSQL only)
- **JWT Authentication** : Endpoint protection with access and refresh tokens
- **Pagination** : Complete pagination support for read queries
- **Automatic Mapping** : Automatic property mapping via decorators
- **Auto-incremented Sequences** : Automatic ID generation with custom prefixes
- **Route Aliases** : Proxy system to create URL shortcuts
- **Swagger/OpenAPI** : Automatic API documentation available at the configured path (default: `/api/docs`)
- **PostgreSQL Transactions** : Transaction support for complex operations

## 📋 Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v12+)
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Application Configuration
PORT=8000                                    # Port on which the application will run

# Database Configuration
DB_HOST=localhost                           # PostgreSQL database host
DB_PORT=5432                               # PostgreSQL database port
DB_NAME=your_db                            # PostgreSQL database name
DB_USER=your_user                          # PostgreSQL database username
DB_PASSWORD=your_password                  # PostgreSQL database password

# JWT Configuration
JWT_SECRET=your_jwt_secret                 # Secret key for JWT token signing (use a strong, random string)
JWT_ACCESS_TOKEN_EXPIRATION=15m           # Access token expiration time (e.g., 15m, 1h, 1d)
JWT_REFRESH_TOKEN_EXPIRATION=7d           # Refresh token expiration time (e.g., 7d, 30d)

# Proxy Configuration (optional)
UPSTREAM_URL=http://localhost:8000         # Upstream URL for proxying requests (used by route aliases)

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10                      # Number of salt rounds for password hashing (higher = more secure but slower)

# Swagger/OpenAPI Configuration
DOCS_TITLE=Generic Web Service Documentation  # Title for the Swagger documentation page
DOCS_DESCRIPTION=A NestJS-based web service providing dynamic CRUD operations  # Description for the API docs
DOCS_PATH=api/docs                         # Path where Swagger UI will be served
DOCS_VERSION=1.0                           # Version of the API documentation

# Generic Controller Configuration
GEN_CONTROLLER_PATH=api/gen                # Base path for the generic CRUD endpoints
```

### Route Aliases (optional)

Modify `src/util/routeAlias.util.ts` to create URL shortcuts:

```typescript
export const ROUTES = {
    'POST /api/gen?className=model/token.model&action=read&tableName=token': [
        "/tokens",
        "/list-tokens"  // Good: no conflict
    ],
    'POST /api/gen?className=model/user.model&action=read&tableName=users': [
        "/users",
        "/api/users/list"
    ]
};
```

**⚠️ Important**: Avoid aliases that could conflict with existing endpoints. For example, don't use `/fields` as an alias if you have `/api/gen/fields` - this can cause routing conflicts and bugs.

## 🏃 Getting Started

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server starts on `http://localhost:${PORT}` (default: `http://localhost:8000`).

## 📚 API Documentation

- **Swagger UI** : `http://localhost:${PORT}/${DOCS_PATH}` (default: `http://localhost:8000/api/docs`)
- **Main Endpoints** :
  - `${GEN_CONTROLLER_PATH}` : Generic CRUD operations (default: `/api/gen`)

## 🔧 Project Structure

```
src/
├── annotation/          # Custom decorators
│   ├── auth.annotation.ts      # JWT authentication guard
│   └── sequence.annotation.ts  # @Sequence decorator for IDs
├── controller/          # API controllers
│   └── gen.controller.ts       # Generic CRUD
├── interface/           # TypeScript interfaces
│   ├── pagination.interface.ts
│   └── request.interface.ts
├── middleware/          # Middlewares
│   └── alias.middleware.ts     # Proxy for route aliases
├── model/              # Data models
│   ├── gen.model.ts           # Generic base model
│   ├── request.model.ts       # Request model
│   └── token.model.ts         # Token model with JWT
├── util/               # Utilities
│   ├── bootstrap.util.ts      # Startup display
│   ├── constante.util.ts      # Constants
│   ├── cors.util.ts           # CORS configuration
│   ├── database.util.ts       # PostgreSQL connection
│   ├── docs.util.ts           # Swagger configuration
│   ├── gen.util.ts            # Generic utilities
│   ├── hash.util.ts           # Bcrypt hashing
│   ├── network.util.ts        # Network utilities
│   ├── reflect.util.ts        # TypeScript reflection
│   ├── response.util.ts       # Response formatting
│   ├── routeAlias.util.ts     # Alias configuration
│   ├── string.util.ts         # String manipulation
│   └── token.util.ts          # JWT management
├── app.module.ts        # Main NestJS module
└── main.ts             # Application entry point
```

## 📖 API Usage

**Note**: All endpoint paths in the examples below use the default configuration values. The actual paths depend on your environment variables:

- `${GEN_CONTROLLER_PATH}` for generic CRUD operations (default: `/api/gen`)
- `${DOCS_PATH}` for API documentation (default: `/api/docs`)

### 🔐 Authentication

All `/api/gen` endpoints require a JWT token in the header:

```bash
Authorization: Bearer <your_token>
```

**Note**: Token management is handled through the `Token` model using the generic CRUD endpoints. There is no dedicated token controller - use `/api/gen` with `className=model/token.model` and `tableName=token`.

**Example - Create a token:**

```bash
POST /api/gen?action=create&className=model/token.model&tableName=token
Authorization: Bearer <existing_token>
Content-Type: application/json

{
  "data": {
    "payload": {"userId": 123, "email": "user@example.com"},
    "refreshToken": "generated_refresh_token",
    "expirationDate": "2024-12-31T23:59:59Z"
  }
}
```

### Generic CRUD Operations

#### Create a record
```bash
POST /api/gen?action=create&className=model/users.model&tableName=users
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

#### Read with pagination
```bash
POST /api/gen?action=read&className=model/users.model&tableName=users&page=1&limit=10
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {},
  "afterWhere": "created_at > '2024-01-01'"
}
```

#### Update
```bash
PUT /api/gen?action=update&className=model/users.model&tableName=users
Authorization: Bearer <token>
Content-Type: application/json

{
  "objectToUpdate": {"id": "USR1"},
  "objectToUpdateWith": {"email": "newemail@example.com"},
  "afterWhere": "status = 'active'"
}
```

#### Delete
```bash
DELETE /api/gen?action=delete&className=model/users.model&tableName=users
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {"id": "USR1"},
  "afterWhere": "status != 'protected'"
}
```



## 🏗️ Creating a New Model

### 1. Create the model class

```typescript
// src/model/user.model.ts
import { GenModel } from './gen.model';
import { Sequence } from '../annotation/sequence.annotation';

export class User extends GenModel {
    @Sequence({ name: 'user_seq', prefix: 'USR' })
    id: string;

    firstName: string;

    lastName: string;

    email: string;

    phone?: string;

    createdAt?: Date;

    private static tableName = "users";

    constructor() {
        super(User.tableName);
    }
}
```

### 2. Create the PostgreSQL table

```sql
-- Create the sequence
CREATE SEQUENCE user_seq START 1;

-- Create the table
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Use the model

The model will be automatically usable via the generic API:

```bash
POST /api/gen?action=create&className=model/user.model&tableName=users
Authorization: Bearer <token>
```

## 🔄 Alias System

The alias system allows creating shortcuts for complex URLs:

```typescript
// In routeAlias.util.ts
export const ROUTES = {
    // The long URL will be accessible via /users
    'POST /api/gen?className=model/user.model&action=read&tableName=users': [
        "/users"
    ],
    // Multiple aliases possible - avoid conflicts!
    'PUT /api/gen?className=model/user.model&action=update&tableName=users': [
        "/users/update",
        "/modify-users"  // Safe: no endpoint collision
    ],
    // Token management examples
    'POST /api/gen?className=model/token.model&action=create&tableName=token': [
        "/create-token"
    ]
};
```

## 🚨 Error Handling

The API returns standardized responses:

```json
// Success
{
  "message": "Success",
  "data": {...},
  "statusCode": 200
}

// Error
{
  "error": "Error message",
  "message": "Detailed error",
  "data": null,
  "statusCode": 400
}
```

## 🔧 Advanced Features

### Transactions
Use `DatabaseUtil.withTransaction()` for complex operations that require atomicity:

```typescript
import { DatabaseUtil } from './util/database.util';

const result = await DatabaseUtil.getInstance().withTransaction(async (client) => {
  // Create user
  const user = new User();
  user.firstName = 'John';
  user.lastName = 'Doe';
  const createdUser = await user.create(client);

  // Create related token
  const token = new Token();
  token.userId = createdUser.id;
  token.payload = { userId: createdUser.id };
  const createdToken = await token.create(client);

  return { user: createdUser, token: createdToken };
});
```

### Custom Queries
Use `GenModel.executeReturnedQuery()` for custom SQL queries:

```typescript
import { GenModel } from './model/gen.model';

const customQuery = `
  SELECT u.*, t.token_value
  FROM users u
  LEFT JOIN tokens t ON u.id = t.user_id
  WHERE u.created_at > $1
`;

const usersWithTokens = await GenModel.executeReturnedQuery(
  customQuery,
  new User(),
  undefined, // client (optional)
  ['2024-01-01'] // query parameters
);
```

### Validation
Add custom validations in your models by overriding CRUD methods.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/elsy-sc/generic-ws.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your branch: `git push origin feature/your-feature-name`
8. Create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and naming conventions
- Update documentation as needed

### Reporting Issues

- Use the GitHub issue tracker
- Provide detailed steps to reproduce
- Include environment information (Node.js version, OS, etc.)

## 📄 License

This project is licensed under the terms specified in the `LICENSE` file. Currently set to "UNLICENSED" in `package.json`, indicating it is not open source and all rights are reserved by the author.

For commercial use or redistribution, please contact the author.

---

**Developed with ❤️ by elsy-sc**
