# tlda/api

The API that is used by both the CLI and UI to interact with the database.

## Structure
- blueprints: Controllers that implement HTTP handlers for requests
- db: Models (`db/models`), connection handling and ID generation
    - resolve: A recursive function designed to resolve references to
      models in unstructured data (such as JSON objects). Used primarily
      in the upcoming events feature to allow unstructured data to reference
      entries within the database. Further explanation below.
- lib: Internal functions used by the application
    - error: Error handling, including HTTP errors and business logic errors.
    - validate: A validator written to validate unstructured (mostly JSON) data
      being passed by clients. Allows for primitives (int, str, float, bool, etc),
      complex types (array, date, enums), objects and discrimated unions (called
      `variants` in this code base)
- middleware: Functions that are used to wrap HTTP handlers and implement common functions
  such as validation, authentication, etc.
- static: Files served under the API that are unlikely to change (currently only classrooms).

## Dependencies
- flask: HTTP server
- sqlalchemy: orm
- pyscopg2: psql client
- alembic: database migrations
- bcrypt: password hashing
- typing-extensions: necessary for certain features (e.g., Self) in codebase - used primarily to aid editor auto-completion

## Known Pitfalls

### Database

Some database queries are not very well optimised - namely 