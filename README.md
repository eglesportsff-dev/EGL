# Free Fire Inspired Esports Tournament Platform

Production-oriented full-stack tournament management baseline with React, Spring Boot, JWT auth, OTP registration verification, PostgreSQL, role hierarchy, wallet flows, match management, and team leaderboard.

## Project Structure

```text
backend/   Spring Boot REST API
frontend/  Vite React app
docs/      SQL schema, API notes, deployment guide
postman/   Postman collection
```

## Local Setup On Windows

1. Install Java 17, Maven, Node.js 20+, PostgreSQL 15+, and VS Code or IntelliJ IDEA.
2. Create a database:

```powershell
createdb esports_tournament
```

3. Backend:

```powershell
cd backend
copy .env.example .env
mvn clean install
mvn spring-boot:run
```

4. Frontend:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`; backend runs on `http://localhost:8080`.

## Key Auth Rules

Registration uses email OTP. Login uses only email and password. JWT is sent as `Authorization: Bearer <token>`.

## Deployment

Frontend: deploy `frontend/` to Vercel with `VITE_API_URL=https://your-api-host/api`.

Backend: deploy `backend/` to Render or Railway. Set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `FRONTEND_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, and mail variables.

Database: use Neon or Supabase PostgreSQL. Run [schema.sql](docs/schema.sql) if you prefer manual schema creation, or set `JPA_DDL_AUTO=update` for managed schema during early rollout.
