# API Examples

This document provides curl examples and Postman collection information for the Gym Membership Management API.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "dob": "1990-01-01"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.test",
    "password": "Admin@123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@demo.test",
      "role": "admin"
    }
  }
}
```

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Users (Admin Only)

#### Get All Users
```bash
curl -X GET "http://localhost:5000/api/users?role=member&page=1&limit=10&search=john" \
  -H "Authorization: Bearer <token>"
```

#### Get User by ID
```bash
curl -X GET http://localhost:5000/api/users/<userId> \
  -H "Authorization: Bearer <token>"
```

#### Update User
```bash
curl -X PUT http://localhost:5000/api/users/<userId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "+1234567890"
  }'
```

### Trainers

#### Get All Trainers
```bash
curl -X GET http://localhost:5000/api/trainers
```

#### Create Trainer (Admin)
```bash
curl -X POST http://localhost:5000/api/trainers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<userId>",
    "bio": "Experienced trainer",
    "specialty": "Strength Training",
    "experienceYears": 5
  }'
```

### Plans

#### Get All Plans
```bash
curl -X GET http://localhost:5000/api/plans
```

#### Create Plan (Admin)
```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Plan",
    "durationInDays": 365,
    "price": 399.99,
    "perks": ["Access to gym", "Personal trainer", "Spa access"],
    "maxSessionsPerWeek": null
  }'
```

### Subscriptions

#### Create Subscription
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "<memberId>",
    "planId": "<planId>",
    "startDate": "2024-01-01"
  }'
```

#### Get Member Subscriptions
```bash
curl -X GET http://localhost:5000/api/subscriptions/member/<memberId> \
  -H "Authorization: Bearer <token>"
```

### Workout Plans

#### Create Workout Plan (Trainer)
```bash
curl -X POST http://localhost:5000/api/workout-plans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "<memberId>",
    "title": "Beginner Workout Plan",
    "sessions": [
      {
        "dayOfWeek": "Monday",
        "exercise": "Chest Press",
        "reps": "10",
        "sets": "3",
        "notes": "Focus on form"
      }
    ]
  }'
```

#### Get Member Workout Plan
```bash
curl -X GET http://localhost:5000/api/workout-plans/member/<memberId> \
  -H "Authorization: Bearer <token>"
```

### Attendance

#### Check In
```bash
curl -X POST http://localhost:5000/api/attendance/checkin \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "web",
    "photoUrl": "https://example.com/photo.jpg",
    "notes": "Morning workout"
  }'
```

#### Get Attendance Records
```bash
curl -X GET "http://localhost:5000/api/attendance?memberId=<memberId>&from=2024-01-01&to=2024-01-31&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

#### Get Today's Check-ins
```bash
curl -X GET http://localhost:5000/api/attendance/today \
  -H "Authorization: Bearer <token>"
```

### File Upload

#### Upload Profile Photo
```bash
curl -X POST http://localhost:5000/api/upload/profile-photo \
  -H "Authorization: Bearer <token>" \
  -F "photo=@/path/to/image.jpg"
```

#### Upload Check-in Photo
```bash
curl -X POST http://localhost:5000/api/upload/checkin-photo \
  -H "Authorization: Bearer <token>" \
  -F "photo=@/path/to/image.jpg"
```

### Reports (Admin)

#### Export Attendance CSV
```bash
curl -X GET "http://localhost:5000/api/reports/attendance.csv?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer <token>" \
  -o attendance.csv
```

#### Export Members CSV
```bash
curl -X GET http://localhost:5000/api/reports/members.csv \
  -H "Authorization: Bearer <token>" \
  -o members.csv
```

## Postman Collection

To import into Postman:

1. Create a new collection named "Gym Membership API"
2. Set collection variable: `base_url` = `http://localhost:5000/api`
3. Set collection variable: `token` = (will be set after login)
4. Add a pre-request script to set Authorization header:
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.collectionVariables.get('token')
   });
   ```
5. After login, set the token variable:
   ```javascript
   pm.collectionVariables.set('token', pm.response.json().data.token);
   ```

## Demo Accounts

After running `npm run seed`:

- **Admin**: `admin@demo.test` / `Admin@123`
- **Trainer 1**: `trainer1@demo.test` / `Trainer@123`
- **Trainer 2**: `trainer2@demo.test` / `Trainer@123`
- **Trainer 3**: `trainer3@demo.test` / `Trainer@123`
- **Member 1**: `member1@demo.test` / `Member@123`
- **Member 2-10**: `member2@demo.test` through `member10@demo.test` / `Member@123`

