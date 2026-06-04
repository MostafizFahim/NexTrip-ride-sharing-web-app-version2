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
