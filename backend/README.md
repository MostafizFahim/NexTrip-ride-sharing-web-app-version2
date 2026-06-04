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
      matching.service.js
      redis.service.js
    sockets/
      io-store.js
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

6. Optional demo accounts and trips:

```bash
npm run prisma:seed
```

Seed logins:

```text
Admin: 01700000000 / 123456
Passenger: 01700000001 / 123456
Approved driver: 01700000002 / 123456
Pending driver: 01700000003 / 123456
```

7. Start the API:

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

Phase 3 creates trips with status `REQUESTED` and calculates a simple learning fare.

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

## Phase 4: Matching Engine

When a passenger books a trip, the backend now:

1. Looks for nearby online drivers in Redis.
2. Filters them by approved status and requested vehicle type.
3. Sends the trip to the nearest driver over Socket.IO.
4. Gives that driver 30 seconds to accept or decline.
5. Tries the next nearest driver after decline or timeout.
6. Cancels the trip with `No drivers available` after 3 failed attempts.

These values are configurable in `.env`:

```text
MATCH_RADIUS_KM=5
MATCH_MAX_ATTEMPTS=3
MATCH_REQUEST_TIMEOUT_MS=30000
```

### Driver receives request

Driver listens for:

```text
trip:request
```

Example payload:

```json
{
  "tripId": "trip_id_here",
  "passenger": {
    "id": "passenger_id",
    "name": "Rahim Passenger",
    "phone": "01700000001",
    "rating": 5
  },
  "pickup": {
    "lat": 23.7806,
    "lng": 90.4193,
    "address": "Gulshan 1"
  },
  "dropoff": {
    "lat": 23.7509,
    "lng": 90.3936,
    "address": "Dhanmondi 32"
  },
  "vehicleType": "BIKE",
  "estimatedFare": 70,
  "distanceKm": 4.16,
  "pickupDistanceKm": 1.2,
  "expiresInMs": 30000
}
```

### Driver accepts by Socket.IO

```text
trip:accept
```

```json
{
  "tripId": "trip_id_here"
}
```

### Driver declines by Socket.IO

```text
trip:decline
```

```json
{
  "tripId": "trip_id_here"
}
```

### Driver accepts by REST

This is useful for testing before the mobile app exists.

```text
POST /api/trips/:id/accept
Authorization: Bearer <driver_token>
```

### Driver declines by REST

```text
POST /api/trips/:id/decline
Authorization: Bearer <driver_token>
```

### Passenger listens for matching updates

```text
trip:matching-driver
trip:accepted
trip:no-drivers-available
trip:updated
```

## Phase 5: Live Trip

After a driver accepts, the trip moves through:

```text
ACCEPTED -> DRIVER_ARRIVED -> STARTED -> COMPLETED
```

The hardcoded OTP is still `1234` for learning.

### Driver marks arrived

```text
POST /api/trips/:id/arrived
Authorization: Bearer <driver_token>
```

Passenger listens for:

```text
trip:driver-arrived
```

### Driver starts trip with OTP

```text
POST /api/trips/:id/start
Authorization: Bearer <driver_token>
```

```json
{
  "otp": "1234"
}
```

Both passenger and driver listen for:

```text
trip:started
```

### Driver completes trip

If `actualDistanceKm` is not sent, the backend uses the original estimated distance.

```text
POST /api/trips/:id/complete
Authorization: Bearer <driver_token>
```

```json
{
  "actualDistanceKm": 4.5
}
```

Completing the trip:

- Sets status to `COMPLETED`
- Calculates `finalFare`
- Marks `paymentStatus` as `PAID`
- Adds the fare to driver `totalEarnings`

Both passenger and driver listen for:

```text
trip:completed
```

### Live driver location during trip

The driver keeps sending the existing event every 5 seconds:

```text
driver:update-location
```

```json
{
  "lat": 23.7806,
  "lng": 90.4193
}
```

When the driver has an active trip, the passenger also receives:

```text
trip:driver-location
```

```json
{
  "tripId": "trip_id_here",
  "driverId": "driver_id_here",
  "userId": "driver_user_id_here",
  "lat": 23.7806,
  "lng": 90.4193,
  "status": "STARTED",
  "updatedAt": "2026-06-03T00:00:00.000Z"
}
```

## Phase 6: Admin Panel APIs

The React web app in `/frontend` is the admin panel. These endpoints feed its dashboard, drivers, riders, trips, and live map views.

### Dashboard summary

```text
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

Returns counts for passengers, drivers, pending approvals, online drivers, trip statuses, simulated paid trips, and total revenue.

### Passenger list

```text
GET /api/admin/passengers
Authorization: Bearer <admin_token>
```

### Trip list

```text
GET /api/admin/trips
GET /api/admin/trips?status=COMPLETED
Authorization: Bearer <admin_token>
```

Each trip includes passenger and driver details for the admin table.

### Driver workflow

```text
GET /api/admin/drivers
GET /api/admin/drivers?status=PENDING
PUT /api/admin/drivers/:id/approve
PUT /api/admin/drivers/:id/reject
PUT /api/admin/drivers/:id/suspend
Authorization: Bearer <admin_token>
```

### Live driver map

```text
GET /api/admin/live-drivers
Authorization: Bearer <admin_token>
```

The frontend uses Leaflet/OpenStreetMap, so no paid map API key is required.
