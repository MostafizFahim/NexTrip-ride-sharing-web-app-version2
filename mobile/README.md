# NexTrip Mobile

Expo React Native app for the passenger and driver roles in one codebase.

## What is included

- Passenger and driver registration/login
- JWT stored in AsyncStorage
- Role-based navigation
- Passenger map booking screen
- Fare estimate and ride booking
- Driver vehicle setup
- Driver online/offline toggle
- Driver receives Socket.IO trip requests
- Driver accept/decline
- Driver arrived/start/complete trip flow
- Driver live location sent every 5 seconds while online
- Shared trip history screen
- Profile update screen
- Trip cancellation before start
- 1-5 rating for completed trips

## Local setup

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

If you test on an Android emulator, `localhost` may not point to your computer. Use:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:5000
```

If you test on a physical phone, use your computer LAN IP:

```text
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.x.x:5000
```

The backend must be running with PostgreSQL and Redis.
