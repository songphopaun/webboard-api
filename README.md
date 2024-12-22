Nest.js Backend Application

This is a Nest.js application for managing posts, comments, and users. It provides RESTful APIs for CRUD operations.

Features

- JWT-based authentication.
- API endpoints for managing posts, comments, and users.

Start project run scripts
docker compose up --build: This command initializes and builds the services defined in the docker-compose.yml file. It starts by setting up the PostgreSQL database and then uses the instructions in the Dockerfile to build and run the backend service.

Project Structure
webboard-api/
├── src/
│ ├── comment/ # Handles comment-related functionality (controller, service, entity, module, tests)
│ ├── guard/ # Guards like JwtAuthGuard for route protection
│ ├── interface/ # Contains shared interfaces (e.g., response.interface.ts)
│ ├── post/ # Manages post-related operations (controller, service, entity, module, tests)
│ ├── seeder/ # Seeder module for populating the database with initial data
│ ├── users/ # Handles user-related operations (controller, service, entity, auth-related functionality)
│ ├── app.controller.ts # Main controller for global routes
│ ├── app.module.ts # Main application module
│ ├── app.service.ts # Main application service
│ ├── main.ts # Application entry point
│ └── response.util.ts # Utility functions for standard API responses
├── test/ # Contains test files for API endpoints and functionality
├── .env # Environment variables
├── Dockerfile # Docker configuration for containerizing the app
├── docker-compose.yml # Docker Compose for running the app with dependencies
├── package.json # Dependencies and scripts
├── tsconfig.json # TypeScript configuration
└── README.md # Documentation

ENV
PORT=4000
NODE_ENV=dev
DATABASE_URL=postgres://postgres:password@db:5432/webboard
ACCESS_TOKEN_SECRET=d2pvXK2nV0KjWg
REFRESH_TOKEN_SECRET=j5Ye&Fd_y5nHXaQA
