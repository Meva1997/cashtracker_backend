# CashTracker — Backend API (Node.js, Express 5, TypeScript, Sequelize)

CashTracker is a RESTful backend for managing personal finances. It focuses on clean architecture, robust validation, secure authentication, and a well-tested codebase. Core capabilities include:

- Budget management: create, update, list, delete budgets.
- Expense tracking: record, categorize, filter, and delete expenses.
- Secure authentication: JWT-based login and route protection.
- Strong input validation and error handling for predictable API behavior.

This project is built to showcase backend engineering skills and decisions for potential employers. It is not intended as a turnkey product or a shared template.

---

## Highlights for Reviewers

- Modern stack:
  - Node.js + Express 5 (next-gen routing and middleware model)
  - TypeScript across the codebase
  - Sequelize with sequelize-typescript for ORM and model typing
  - PostgreSQL as the primary database (pg + pg-hstore)
- Security & reliability:
  - JWT authentication for stateless sessions
  - Password hashing with bcrypt
  - Input validation via express-validator
  - Rate limiting with express-rate-limit to mitigate brute-force attacks
  - Environment-based configuration with dotenv
- DevEx & operations:
  - Structured logging with morgan
  - Clear scripts for development, build, and production
- Testing:
  - Jest + Supertest for unit and integration tests
  - Coverage reporting
  - Pre-test data cleanup to ensure isolated, repeatable tests

---

## Prerequisites

- Node.js (LTS recommended) and npm
- PostgreSQL (local or remote)
- Git
- Optional: Postman/Insomnia/Thunder Client for manual API testing

---

## Scripts

Available npm scripts:

- Development: `npm run dev` (nodemon + ts-node)
- Build: `npm run build` (compile to `dist/`)
- Start: `npm start` (run compiled JS)
- Test: `npm test` (Jest)
- Coverage: `npm run test:coverage`

A pre-test script runs to clean/reset data before tests:

```
ts-node ./src/data/index.ts --clear
```

---

## Technologies

- Language: TypeScript
- Runtime & Framework: Node.js, Express 5
- ORM & Database: Sequelize (sequelize-typescript), PostgreSQL (pg, pg-hstore)
- Auth & Security: JSON Web Tokens (jsonwebtoken), bcrypt, express-rate-limit
- Validation: express-validator
- Configuration & Utilities: dotenv, morgan, colors, nodemailer
- Testing: Jest, Supertest, ts-jest, node-mocks-http
- Tooling: ts-node, nodemon, TypeScript compiler (tsc)

---

## Architecture & Design Notes

- TypeScript-first: Strong typing and editor tooling for reliability and readability.
- Layered structure: Separation of concerns (routing, controllers, services, models) to keep business logic maintainable.
- Stateless auth: JWT for scalable, sessionless authentication.
- Validation-first: All inputs pass through express-validator; consistent error responses simplify client handling.
- Operational safety:
  - Rate limiting reduces abuse vectors.
  - Centralized error handling and request logging via morgan.
- Testability: Supertest covers HTTP flows; Jest unit tests focus on logic, with isolated test data per run.

---

## Project Scope

This repository is a personal portfolio project designed to demonstrate backend engineering practices and decision-making. It is not positioned as a reusable template or production-ready package.

---

## Contributing

While external contributions are not the goal of this repository, code-quality improvements and constructive feedback are appreciated. If you open a pull request, please:

- Keep changes focused and well-documented.
- Include tests where it makes sense.
- Follow existing code style and TypeScript conventions.

---

## License

ISC License — see the LICENSE file for details.

---

```

```
