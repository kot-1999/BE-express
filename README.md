# BE-express

BE-express is a project designed to demonstrate a robust backend application using modern technologies and best practices. The project is built with Express.js and TypeScript, providing a solid foundation for scalable and maintainable server-side applications.

## Getting started
### Prerequisites
- Ensure that Docker and Docker Compose are installed on your system.
### Running the Application

Make sure your current npm version is `10.8.2` and node version is `22.8.0`
To run the application you need to create: 

- `.env`: for local running with `npm run start`
- `.env.dev`: for running application in docker in development mode with `npm run docker:dev` or `docker compose --env-file .env.development --profile dev up`
- `.env.test`: to run the application in a test mode `npm run docker:test` or `docker compose --env-file .env.test --profile test up`

**NOTE**: there is a `.env.template` file which can be used to run application in docker in development mode. In spite of that some variables are unavailable, those are initialized with `null`

Use the following npm scripts to start the application in various environments (or use docker commands directly):

- `npm run docker:dev`: Starts the application in Docker using the `dev` profile with the `.env.dev` environment file.
- `npm run docker:test`: Starts the application in Docker using the `test` profile with the `.env.test` environment file.
- `npm run local:docker:dev`: Starts the application in Docker using the `localDev` profile with the `.env.local.dev` environment file. To run the backend execute `npm run local:dev`.
- `npm run local:docker:test`: Starts the application in Docker using the `localTest` profile with the `.env.local.test` environment file. To run the backend execute `npm run local:test`.

Ensure the corresponding environment files are properly configured before running these commands.

### Docker Compose Profiles

This project utilizes Docker Compose profiles to manage different service configurations based on the environment. Profiles allow for selective activation of services, enabling a tailored setup for development, testing, and local development scenarios.

- `dev`: Activates services required for development and runs backend app.
- `test`: Activates services required for testing and run tests.
- `localDev`: Activates services for local development.
- `localTest`: Activates services for local testing.

### Accessing the API
Access swagger API documentation on `{host}/api/docs`

Or run script `npm run apidoc` which will create API documentation in `./dist/apiDoc`

## Features
- **Full Dockerization:** The entire application is containerized using Docker, allowing for seamless setup and deployment. With Docker, you can run the project without worrying about environment configurations.
- **Express with TypeScript:** Combines the flexibility of Express.js with the type safety of TypeScript, enhancing code quality and developer experience.
- **Authentication:**
  - **Google OAuth:** Enables users to authenticate using their Google accounts.
  - **JWT Authentication:** Implements JSON Web Token (JWT) authentication for stateless and secure user sessions.
  - **Session Management:** Manages authentication sessions with cookies for persistent user sessions. Ass session key storage is used Redis
  - **Forgot Password Workflow**: Secure forgot-password mechanism with token-based authentication and email verification.
- **Prisma ORM:** Utilizes Prisma as the Object-Relational Mapping tool, facilitating seamless database interactions and migrations.
- **Security:**
  - **AES Encryption:** Protects sensitive data which are sent via HTTP TCP connection by encrypting it using the AES algorithm.
  - **SHA256 Hashing:** Ensures data integrity and security through the SHA256 hashing algorithm.
  - **Rate Limiting with Redis**: Limits the number of incoming requests. Use Redis as storage
  - **Content Security Policy (CSP) with Helmet**:  A strict Content Security Policy is set using helmet to prevent malicious content from being loaded (Prevents XSS attacks for example). Allows only trusted sources for scripts, styles, fonts, and images.
- **Centralized Error Handling:** Implements a centralized mechanism to handle errors consistently across the application.
- **Testing with Mocha and Chai:** Sets up testing frameworks Mocha and Chai for writing and running unit and integration tests. Tests can also be executed within Docker containers for consistency.
- **Input Validation with Joi:** Uses Joi for validating request inputs, ensuring data integrity and reliability. Additionally, leverages @goodrequest/joi-type-extract to extract TypeScript types from Joi schemas.
- **Environment Configuration:** Manages configuration using a .env file, allowing for easy environment variable management.
- **Husky**: Runs `npm run lint` and `npm run db:validate` scripts before each commit to ensure code quality and schema validity.
- **Soft Deletion**: Implements logical deletion for database records using a deletedAt column, ensuring data integrity while maintaining recoverability.
- **Email Service**: Built-in email functionality for sending transactional emails, including support for password recovery.
- **RESTful API Design:**: Clean and intuitive API endpoints.
- **Logging**: The application uses Winston with DailyRotateFile for logging. Logs are stored based on severity levels (`info`, `warn`, `error`, `debug`) and are rotated daily.
  - Logs are stored in the `logs/{env}/{level}/%DATE%.log` directory.
  - Console logging is configurable per log level using isLoggedToConsole.
- **Sentry**: Application uses Sentry for:
  - Performance Monitoring: Tracks API request performance and latency.
  - Request Tracing: Provides insights into slow endpoints and bottlenecks.
  - Error Tracking: Automatically captures and reports unhandled exceptions and errors.
  - SentryErrorTransport: Supports manual error reporting with contextual information depending on `winston` settings.
- **GitHub Actions:**  Are used for  continuous integration. The CI pipeline automatically runs tests when changes are pushed or pull requests are created.
## Scripts

- `prestart`: Generates the Prisma client before starting the app.
- `start`: Runs the app in development mode with nodemon for live reloading.
- `test`: Runs tests using Mocha with TypeScript and environment variables.
- `docker:dev`: Starts the app in a Docker container for development as well with nodemon for live reloading using the .env.development file.
- `docker:test`: Runs tests inside a Docker container using the .env.test file.
- `docker:prod`: Starts the app in production mode using the .env.production file.
- `db:pull`: Updates the Prisma schema to match the database schema.
- `db:push`: Updates the database to match the Prisma schema.
- `db:seed`: Reserved for database seeding (currently empty).
- `db:validate`: Validates the Prisma schema for errors.
- `lint`: Runs ESLint to analyze code for potential issues.
- `lint:fix`: Runs ESLint and fixes auto-fixable issues.

## TODO list

- Implement tests for google OAuth
- Implement seeders for database
- Create centralized point of access to DB
- Add middleware for caching of endpoints
- Update BE structure specification. Start using Function Overloads
- Update user controller
- Add authorization for b2b
- Provide an example of V2 endpoint
- Implement other security policies which could be required in a modern application
- Implement effective files/pictures processing

### Completed TODOs

- Add storage for session keys
- Implement soft deletion for database raws
- Implement email service
- Implement forgot password alongside with Bearer token extraction from headers
- Implement XSS attack protection
- Implement logging via winston or familiar library
- Implement Sentry monitoring
- Create GitHub actions
- Divide docker-compose file into several ones
- Send errors to sentry through winston.
- Make sentry not to start in some cases

## License
This project is licensed under the Apache-2.0 License.

The Apache-2.0 License is a permissive open-source software license that allows users to freely use, modify, and distribute the licensed software under the following conditions:

### Key Features:
1. **Permissive Use:** Users can use the software for any purpose, including commercial use.
2. **Modification:** Users can modify the source code and create derivative works.
3. **Redistribution:** Allows redistribution of the original or modified software under the same license.
4. **Attribution:** Requires that the original author(s) and license terms are acknowledged in redistributed versions.
5. **No Warranty:** The software is provided "as-is," with no warranties or liability for the authors.
6. **Patent Protection:** Includes an express grant of patent rights from contributors to protect users from patent lawsuits.
