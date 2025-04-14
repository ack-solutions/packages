# @ackplus/nest-crud

A powerful NestJS package that provides CRUD (Create, Read, Update, Delete) operations functionality out of the box. This package helps in quickly implementing CRUD endpoints in your NestJS applications with minimal boilerplate code.

## Features

- Automatic CRUD endpoint generation
- Built-in request validation
- Query parameter support
- Pagination support
- Sorting capabilities
- Filtering options
- Search functionality

## Installation

```bash
npm install @ackplus/nest-crud
# or
yarn add @ackplus/nest-crud
```

## Quick Start

1. Import the module in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { NestCrudModule } from '@ackplus/nest-crud';

@Module({
  imports: [NestCrudModule],
})
export class AppModule {}
```

2. Create a CRUD controller:

```typescript
import { Controller } from '@nestjs/common';
import { NestCrudController } from '@ackplus/nest-crud';

@Controller('users')
export class UsersController extends NestCrudController {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }
}
```

## API Documentation

### Endpoints

- `GET /resource` - Get all resources (with pagination)
- `GET /resource/:id` - Get a single resource
- `POST /resource` - Create a new resource
- `PUT /resource/:id` - Update a resource
- `DELETE /resource/:id` - Delete a resource

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field
- `order` - Sort order (asc/desc)
- `search` - Search term
- `filter` - Filter criteria

## Examples

### Basic Usage

```typescript
@Controller('products')
export class ProductsController extends NestCrudController {
  constructor(private readonly productsService: ProductsService) {
    super(productsService);
  }
}
```

### Custom Query

```typescript
@Controller('products')
export class ProductsController extends NestCrudController {
  @Get('custom')
  async customQuery(@Query() query: any) {
    return this.service.findWithCustomQuery(query);
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms of the MIT license.
