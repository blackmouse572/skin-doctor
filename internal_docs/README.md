SKIN DOCTOR is an AI-powered application designed to assist users in identifying and understanding various skin conditions. By leveraging advanced machine learning algorithms, SKIN DOCTOR provides users with insights into their skin health based on images they upload.

# Introduction

Welcome to the SKIN DOCTOR internal documentation. This document provides an overview of the application's features, architecture, and usage guidelines for developers and team members involved in its development and maintenance.

# Features

- **Image Analysis**: Users can upload images of their skin, and the application analyzes them to identify potential skin conditions.
- **Condition Database**: A comprehensive database of skin conditions, including symptoms, causes, and treatment options.
- **User Profiles**: Users can create profiles to track their skin health over time.
- **AI Recommendations**: Based on the analysis, the application provides personalized recommendations for skin care

# Architecture

The repository is used monolithic architecture, consisting of the following main components:

- **Apps**: Contains the core application logic, including models, views, and controllers.
  - **Server**: Backend services that handle application logic and data processing.
  - **Web**: Frontend components that manage user interfaces and interactions.
  - **MastraServer**: Specialized server for handling machine learning model inference and related tasks.
- **Tools**: Utility scripts and tools that support development and maintenance tasks.
  - **Eslint**: Linting tools to ensure code quality and consistency.
  - **Prettier**: Code formatting tools to maintain a uniform code style.
  - **Tailwind**: CSS framework for styling the application.
  - **Typescript**: Type definitions and configurations for the application.
- **Packages**: Third-party libraries and dependencies used by the application.
  - **Api**: Contracts and interfaces for API communication.
  - **Auth**: Authentication and authorization modules.
  - **DB**: Database models and migration scripts.
  - **UI**: Reusable UI components and design system.

## About

### Stack overview

Below is an overview of all the components in the stack:

```text
apps
  ├─ web
  |   ├─ react (vite)
  |   ├─ tanstack (router, query, form)
  |   └─ tailwindcss
  ├─ server
  |   └─ hono (wrapper for api & auth)
packages
  ├─ api
  |   └─ orpc with valibot
  ├─ auth
  |   └─ better-auth
  ├─ db
  |   └─ drizzle-orm (postgres database)
  ├─ ui
  |   ├─ tailwindcss
  |   └─ shadcn & radix ui
tools
  ├─ eslint
  ├─ prettier
  ├─ tailwind
  └─ typescript
```
