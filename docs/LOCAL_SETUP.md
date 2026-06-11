# NexTrip Local Setup

This project is designed for free local learning. If your C drive is low on space, use the low-space setup below: hosted PostgreSQL plus in-memory Redis.

## Required tools

- Node.js
- Expo Go on your phone, or Android emulator
- PostgreSQL connection string, either local or hosted/free
- Redis is optional for learning because the backend supports `REDIS_MODE=memory`

## Low-space setup: hosted PostgreSQL + memory Redis

This is the best option when you do not want PostgreSQL, Redis, or Docker installed on your C drive.

1. Create a free PostgreSQL database with a hosted provider.
2. Copy the database connection string.
3. Create `backend/.env` from `backend/.env.example`.
4. Set:

```text
DATABASE_URL=your-hosted-postgresql-connection-string
REDIS_MODE=memory
FRONTEND_ORIGIN=http://localhost:3000
```

Then run:

```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

In memory mode, online driver locations are stored in the running Node.js process. That is enough for learning the booking, matching, and live-trip flow. When the backend restarts, live driver locations reset.

## PostgreSQL

If you install PostgreSQL locally, create a database named `nextrip`, then update `backend/.env`:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nextrip
REDIS_MODE=memory
```

Run:

```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Optional local services: Docker Desktop

If you later have enough space and want both PostgreSQL and Redis locally, this project includes `docker-compose.yml`.

Install Docker Desktop:

```bash
winget install -e --id Docker.DockerDesktop --source winget --accept-package-agreements --accept-source-agreements
```

Restart your computer if Docker asks for it. Then from the project root:

```bash
docker compose up -d
```

Check services:

```bash
docker ps
```

Expected exposed ports:

```text
PostgreSQL: localhost:5432
Redis: localhost:6379
```

Then run:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend `.env` for Docker services:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nextrip
REDIS_URL=redis://localhost:6379
```

Remove `REDIS_MODE=memory` when using real Redis.

## Redis only with Docker

If you already have PostgreSQL somewhere else and only want Redis locally:

```bash
docker run --name nextrip-redis -p 6379:6379 -d redis:7
```

Check Redis:

```bash
docker ps
docker exec -it nextrip-redis redis-cli ping
```

Expected:

```text
PONG
```

If you already created the container before:

```bash
docker start nextrip-redis
```

Backend `.env` should contain:

```text
REDIS_URL=redis://localhost:6379
```

Remove `REDIS_MODE=memory` when using real Redis.

## Demo accounts

After `npm run prisma:seed`:

```text
Admin: 01700000000 / 123456
Passenger: 01700000001 / 123456
Approved driver: 01700000002 / 123456
Pending driver: 01700000003 / 123456
```

## Run frontend admin

```bash
cd frontend
npm install
npm start
```

Login with admin:

```text
01700000000 / 123456
```

## Run mobile

```bash
cd mobile
npm install
copy .env.example .env
npm start
```

For Android emulator:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:5000
```

For physical phone, use your computer LAN IP:

```text
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.x.x:5000
```

## Manual full-flow test

1. Start PostgreSQL, or use a hosted PostgreSQL connection string.
2. Use `REDIS_MODE=memory`, or start Redis if you want real Redis.
3. Start backend.
4. Start frontend admin.
5. Start mobile app.
6. Login driver and go online.
7. Login passenger and book a ride.
8. Driver accepts.
9. Driver marks arrived.
10. Driver starts trip with OTP `1234`.
11. Driver completes trip.
12. Passenger rates the trip.
13. Admin dashboard should show trips, drivers, and revenue.

## Automated smoke test

After the backend database is migrated, you can test the full backend and Socket.IO ride flow with one command:

```bash
cd backend
npm run smoke:trip-flow
```

The smoke test starts the backend on a temporary local port, creates QA admin/passenger/driver users, approves the driver, sends live driver location, books a ride, accepts it through Socket.IO, completes the trip, submits a rating, and checks the admin dashboard. It uses `REDIS_MODE=memory` by default and stores the QA users/trip in your local PostgreSQL database.
