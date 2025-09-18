# CashTracker — Backend API (Node.js, Express 5, TypeScript, Sequelize)

CashTracker is a RESTful backend for managing personal finances. It focuses on clean architecture, robust validation, secure authentication, and a well-tested codebase. Core capabilities include:

This project is built to showcase backend engineering skills and decisions for potential employers. It is not intended as a turnkey product or a shared template.

---

## Key Features

- **Budget Management:** Create, update, list, and delete budgets.
- **Expense Tracking:** Record, categorize, filter, and delete expenses.
- **Secure Authentication:** JWT-based user authentication and route protection.
- **Input Validation:** Strong input validation and error handling for predictable API responses.
- **Testing:** Comprehensive unit and integration tests with Jest and Supertest.

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

## Architecture & Code Structure

- **TypeScript-first:** Strong typing and autocompletion support.
- **Layered Structure:** Clear separation between routing, controllers, services, and models for maintainability.
- **Stateless Auth:** Uses JWT for scalable, sessionless authentication.
- **Validation-first:** All inputs are validated through express-validator for consistent error responses.
- **Security:** Rate limiting, password hashing, and environment-based configuration.
- **Logging:** HTTP request logging using morgan.
- **Testing:** Supertest for HTTP flow testing, Jest for logic/unit testing, with test data reset before each run.

### Typical Project Structure

```
cashtracker_backend/
│
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── utils/
│   └── data/
│
├── tests/
├── dist/
├── .env
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

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

## Project Status

This repository is a personal portfolio project to demonstrate backend engineering skills and best practices. It is not a production-ready template.

---

```

```
