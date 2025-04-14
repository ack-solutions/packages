# @ackplus/nest-crud-request

A frontend utility package for building and formatting requests compatible with @ackplus/nest-crud backend. This package provides a type-safe way to construct CRUD requests with proper query parameters, filters, sorting, and pagination.

## Features

- Type-safe request builder
- Query parameter construction
- Filter builder
- Sort builder
- Search builder
- Pagination builder
- Request validation
- Automatic URL parameter encoding

## Installation

```bash
npm install @ackplus/nest-crud-request
# or
yarn add @ackplus/nest-crud-request
```

## Quick Start

1. Import the request builder:

```typescript
import { CrudRequestBuilder } from '@ackplus/nest-crud-request';
```

2. Create and use the request builder:

```typescript
// Create a new request builder
const request = new CrudRequestBuilder();

// Add pagination
request.paginate(1, 10);

// Add sorting
request.sort('name', 'asc');

// Add filters
request.filter('status', 'active');

// Add search
request.search('john');

// Build the request
const queryParams = request.build();
// Result: ?page=1&limit=10&sort=name&order=asc&filter[status]=active&search=john

// Use with your HTTP client
const response = await axios.get(`/api/users${queryParams}`);
```

## API Documentation

### CrudRequestBuilder

The main class for building CRUD requests.

#### Methods

- `paginate(page: number, limit: number)` - Set pagination parameters
- `sort(field: string, order: 'asc' | 'desc')` - Add sort parameters
- `filter(field: string, value: any)` - Add filter conditions
- `search(term: string)` - Add search term
- `build()` - Build the request and return query string

### Types

- `CrudRequest` - Type definition for the request structure
- `Filter` - Type for filter conditions
- `Sort` - Type for sort conditions
- `Pagination` - Type for pagination parameters

## Examples

### Basic Usage

```typescript
const request = new CrudRequestBuilder()
  .paginate(1, 10)
  .sort('createdAt', 'desc')
  .filter('status', 'active')
  .search('john')
  .build();

// Use with fetch
const response = await fetch(`/api/users${request}`);
```

### Advanced Filtering

```typescript
const request = new CrudRequestBuilder()
  .filter('age', { $gt: 18 })
  .filter('status', { $in: ['active', 'pending'] })
  .build();

// Result: ?filter[age][$gt]=18&filter[status][$in]=active,pending
```

### Multiple Sorts

```typescript
const request = new CrudRequestBuilder()
  .sort('name', 'asc')
  .sort('age', 'desc')
  .build();

// Result: ?sort=name,age&order=asc,desc
```

### Complex Search

```typescript
const request = new CrudRequestBuilder()
  .search('john doe')
  .filter('department', 'IT')
  .paginate(1, 20)
  .build();

// Result: ?search=john%20doe&filter[department]=IT&page=1&limit=20
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms of the MIT license.
