# NexTrip Ride Sharing

Learning project for a ride-sharing app like Uber/Pathao.

## Structure

```text
backend/   Express, Socket.IO, Prisma, PostgreSQL, Redis
frontend/  React web app, planned as the admin panel
mobile/    Expo passenger and driver app
```

The backend is local-first and intentionally simple for learning. The current web UI keeps the existing NexTrip visual theme.

## Local Development

Full local setup, low-space options, demo accounts, and manual test flow:

[docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md)

Postman collection:

[docs/NexTrip.postman_collection.json](docs/NexTrip.postman_collection.json)

Low-space local setup:

Use a free hosted PostgreSQL database for `DATABASE_URL`, then set `REDIS_MODE=memory` in `backend/.env`. This avoids installing PostgreSQL, Redis, or Docker on your C drive while you are learning.

Docker local services are also available if you want them later:

```bash
docker compose up -d
```

Backend:

```bash
cd backend
npm install
npm run prisma:migrate
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm start
```

Mobile:

```bash
cd mobile
npm install
npm start
```
