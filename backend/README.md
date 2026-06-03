# NexTrip Backend

Learning backend for a ride-sharing app like Uber/Pathao.

This backend is intentionally simple and local-first:

- Express REST API
- Socket.IO for realtime driver/trip events
- Prisma ORM
- PostgreSQL
- Redis only for online driver location
- JWT access token only
- Hardcoded OTP: `1234`
- Simulated payments only

## Project Structure

```text
backend/
  prisma/
    schema.prisma
  src/
    controllers/
      admin.controller.js
      auth.controller.js
      driver.controller.js
      trip.controller.js
    lib/
      prisma.js
    middleware/
      auth.js
      error.js
    routes/
      admin.routes.js
      auth.routes.js
      bookings.routes.js
      driver.routes.js
      index.js
      messages.routes.js
      rides.routes.js
      trip.routes.js
      users.routes.js
    services/
      fare.service.js
      redis.service.js
    sockets/
      index.js
    app.js
    server.js
  .env.example
  package.json
```

## Local Setup

1. Install PostgreSQL and Redis locally.
2. Create a PostgreSQL database named `nextrip`.
3. Copy `.env.example` to `.env`.
4. Install packages:

```bash
npm install
```

5. Create tables:

```bash
npm run prisma:migrate
```

6. Start the API:

```bash
npm run dev
```

Health check:

```text
GET http://localhost:5000/health
```

## Phase 1: Auth Endpoints

### Register

```text
POST /api/auth/register
```

Passenger:

```json
{
  "name": "Rahim Passenger",
  "phone": "01700000001",
  "password": "123456",
  "role": "PASSENGER",
  "otp": "1234"
}
```

Driver:

```json
{
  "name": "Karim Driver",
  "phone": "01700000002",
  "password": "123456",
  "role": "DRIVER",
  "otp": "1234"
}
```

Admin for learning:

```json
{
  "name": "Admin",
  "phone": "01700000003",
  "password": "123456",
  "role": "ADMIN",
  "otp": "1234",
  "adminCode": "admin123"
}
```

### Login

```text
POST /api/auth/login
```

```json
{
  "phone": "01700000001",
  "password": "123456"
}
```

### Current User

```text
GET /api/auth/me
Authorization: Bearer <token>
```

## Phase 2: Driver Setup and Admin Approval

### Driver setup

```text
POST /api/driver/setup
Authorization: Bearer <driver_token>
```

```json
{
  "vehicleType": "BIKE",
  "plateNumber": "DHAKA-METRO-HA-1234"
}
```

### Driver profile

```text
GET /api/driver/profile
Authorization: Bearer <driver_token>
```

### Go online

Driver must be approved by admin first.

```text
POST /api/driver/toggle-online
Authorization: Bearer <driver_token>
```

```json
{
  "isOnline": true,
  "lat": 23.7806,
  "lng": 90.4193
}
```

### Go offline

```text
POST /api/driver/toggle-online
Authorization: Bearer <driver_token>
```

```json
{
  "isOnline": false
}
```

### Driver earnings

```text
GET /api/driver/earnings
Authorization: Bearer <driver_token>
```

### Admin list drivers

```text
GET /api/admin/drivers
GET /api/admin/drivers?status=PENDING
Authorization: Bearer <admin_token>
```

### Admin approve/suspend/reject driver

```text
PUT /api/admin/drivers/:id/approve
PUT /api/admin/drivers/:id/suspend
PUT /api/admin/drivers/:id/reject
Authorization: Bearer <admin_token>
```

### Admin live drivers from Redis

```text
GET /api/admin/live-drivers
Authorization: Bearer <admin_token>
```

## Socket.IO Events Started

Use auth token in the Socket.IO client:

```js
const socket = io("http://localhost:5000", {
  auth: { token },
});
```

Driver live location:

```text
driver:update-location
```

```json
{
  "lat": 23.7806,
  "lng": 90.4193
}
```

Trip room join:

```text
join-trip-room
```

```json
{
  "tripId": "trip_id_here"
}
```

## Phase 3: Passenger Booking

Phase 3 creates trips with status `REQUESTED`. Driver matching is intentionally left for Phase 4.

### Estimate fare

```text
POST /api/trips/estimate
Authorization: Bearer <passenger_token>
```

```json
{
  "pickupLat": 23.7806,
  "pickupLng": 90.4193,
  "dropoffLat": 23.7509,
  "dropoffLng": 90.3936,
  "vehicleType": "BIKE"
}
```

Example response:

```json
{
  "estimate": {
    "distanceKm": 4.16,
    "estimatedFare": 70,
    "currency": "BDT",
    "vehicleType": "BIKE"
  }
}
```

### Book trip

```text
POST /api/trips/book
Authorization: Bearer <passenger_token>
```

```json
{
  "pickupLat": 23.7806,
  "pickupLng": 90.4193,
  "pickupAddress": "Gulshan 1",
  "dropoffLat": 23.7509,
  "dropoffLng": 90.3936,
  "dropoffAddress": "Dhanmondi 32",
  "vehicleType": "BIKE",
  "paymentMethod": "CASH"
}
```

### My trips

Passenger sees their own requested trips. Driver sees assigned trips after Phase 4 matching assigns a driver.

```text
GET /api/trips/my
Authorization: Bearer <token>
```

### Trip detail

```text
GET /api/trips/:id
Authorization: Bearer <token>
```
