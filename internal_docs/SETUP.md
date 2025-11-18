# Setup

```bash
# Create a repository using the rt-stack template (replace YOUR_PROJECT)
git clone _todo

# Enter the directory or open in your IDE (replace YOUR_PROJECT)
cd YOUR_PROJECT

# Install all dependencies for apps and packages
pnpm install

# Copy .env.example to .env for all applications and the @repo/db package
pnpm env:copy-example

# Start a local postgres instance in the background (e.g. using docker)
docker compose up db --detach

# Push the drizzle schema to your database
pnpm db:push
```

You can then start all applications with

```bash
pnpm dev
```

By default the following URLs will be accessible:

- Web (frontend): http://localhost:8085
- Server (backend): http://localhost:3035
  - API - OpenAPI reference: http://localhost:3035/api
  - Auth - OpenAPI reference: http://localhost:3035/api/auth/reference

The [OpenAPI](https://www.openapis.org) reference uses [Scalar](https://github.com/scalar/scalar) to display all available endpoints.

# Using an External Database

When using an external postgres database (e.g. from [supabase](https://supabase.com)), you can skip the step that spins up a local postgres instance with docker.

Instead, you will need to modify the following environment variables:

1. `SERVER_POSTGRES_URL` in the file `apps/server/.env`

   - used at runtime by the backend server in `pnpm dev`

1. `DB_POSTGRES_URL` in the file `packages/db/.env`
   - used in database schema migrations with `pnpm db:push`
