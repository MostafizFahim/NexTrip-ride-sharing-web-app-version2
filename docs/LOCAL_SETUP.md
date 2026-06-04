# NexTrip Local Setup

This project is designed to run locally without paid services.

## Required local services

- PostgreSQL
- Redis
- Node.js
- Expo Go on your phone, or Android emulator

## PostgreSQL

Create a database named `nextrip`, then update `backend/.env`:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nextrip
```

Run:

```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Redis on Windows

Recommended free local option: Docker Desktop.

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

Without Redis, the backend can still start and `/health` works, but live driver location and matching will not work.

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

1. Start PostgreSQL and Redis.
2. Start backend.
3. Start frontend admin.
4. Start mobile app.
5. Login driver and go online.
6. Login passenger and book a ride.
7. Driver accepts.
8. Driver marks arrived.
9. Driver starts trip with OTP `1234`.
10. Driver completes trip.
11. Passenger rates the trip.
12. Admin dashboard should show trips, drivers, and revenue.
