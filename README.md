# BE-express

BE-express is a test project designed to demonstrate a robust backend application using modern technologies and best practices. The project is built with Express.js and TypeScript, providing a solid foundation for scalable and maintainable server-side applications.

## Getting started
### Prerequisites
- Ensure that Docker and Docker Compose are installed on your system.
### Running the Application
To run the application you need to create: 
- `.env`: for local running with `npm run start`
- `.env.development`: for running application in docker in development mode with `npm run docker:dev`
- `.env.test`: to run the application in a test mode `npm run docker:test`

**NOTE**: there is a `.env.template` file which can be used to run application in docker in development mode. In spite of that some variables are unavailable, those are initialized with `null`

## Features
- **Full Dockerization:** The entire application is containerized using Docker, allowing for seamless setup and deployment. With Docker, you can run the project without worrying about environment configurations.
- **Express with TypeScript:** Combines the flexibility of Express.js with the type safety of TypeScript, enhancing code quality and developer experience.
- **Authentication:**
  - **Google OAuth:** Enables users to authenticate using their Google accounts.
  - **JWT Authentication:** Implements JSON Web Token (JWT) authentication for stateless and secure user sessions.
  - **Session Management:** Manages authentication sessions with cookies for persistent user sessions.

- **Prisma ORM:** Utilizes Prisma as the Object-Relational Mapping tool, facilitating seamless database interactions and migrations.
- **Security:**
  - **AES Encryption:** Protects sensitive data which are sent via HTTP TCP connection by encrypting it using the AES algorithm.
  - **SHA256 Hashing:** Ensures data integrity and security through the SHA256 hashing algorithm.
- **Centralized Error Handling:** Implements a centralized mechanism to handle errors consistently across the application.
- **Testing with Mocha and Chai:** Sets up testing frameworks Mocha and Chai for writing and running unit and integration tests. Tests can also be executed within Docker containers for consistency.
- **Input Validation with Joi:** Uses Joi for validating request inputs, ensuring data integrity and reliability. Additionally, leverages @goodrequest/joi-type-extract to extract TypeScript types from Joi schemas.
- **Environment Configuration:** Manages configuration using a .env file, allowing for easy environment variable management.
- **Husky**: Runs `npm run lint` and `npm run db:validate` scripts before each commit to ensure code quality and schema validity.

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
- Implement soft deletion for database raws
- Implement email service
- Implement forgot password alongside with Bearer token extraction from headers
- Implement seeders for database
- Create centralized point of access to DB
- Implement Sentry monitoring
- Implement logging via winston or familiar library
- Add storage for session keys
- Add Redis caching of endpoints

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