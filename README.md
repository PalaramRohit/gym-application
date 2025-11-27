# Gym Membership Management System

A full-stack web application for managing gym memberships, trainers, workout plans, and attendance tracking.

## Features

- **Role-based Access Control**: Admin, Trainer, and Member roles
- **Authentication**: JWT-based authentication with password hashing
- **Member Features**: Profile management, subscription tracking, workout plans, attendance check-in with photo
- **Trainer Features**: Member roster, workout plan creation, attendance monitoring
- **Admin Features**: Full CRUD operations, revenue tracking, CSV exports, analytics dashboard
- **Modern UI**: Responsive design with charts and micro-interactions

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT + bcrypt
- **File Upload**: Cloudinary (optional) or local storage
- **Charts**: Chart.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account (optional, for cloud image storage)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB connection string and JWT secret:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. **Seed the database** (creates demo data)
   ```bash
   npm run seed
   ```
   This creates:
   - Admin user: `admin@demo.test` / `Admin@123`
   - 3 trainers
   - 10 members
   - 3 membership plans
   - Sample subscriptions and attendance records

5. **Start the server**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Open the frontend**
   - Open `public/index.html` in your browser
   - Or use a local server (e.g., Live Server extension in VS Code)
   - The API runs on `http://localhost:5000`

## Project Structure

```
/
├── README.md
├── .env.example
├── package.json
├── server/
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary config (optional)
│   │   └── jwt.js             # JWT config
│   ├── models/
│   │   ├── User.js
│   │   ├── Trainer.js
│   │   ├── Plan.js
│   │   ├── Subscription.js
│   │   ├── WorkoutPlan.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── trainers.js
│   │   ├── plans.js
│   │   ├── subscriptions.js
│   │   ├── workout-plans.js
│   │   ├── attendance.js
│   │   ├── upload.js
│   │   └── reports.js
│   ├── controllers/
│   │   └── (controller functions)
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── roleCheck.js       # Role-based access control
│   │   ├── errorHandler.js    # Error handling
│   │   └── upload.js          # File upload handling
│   ├── seed/
│   │   └── seed.js            # Database seeding script
│   └── utils/
│       ├── csvExport.js       # CSV generation
│       └── helpers.js         # Utility functions
└── public/
    ├── index.html             # Landing page
    ├── css/
    │   ├── style.css          # Main styles
    │   └── dashboard.css      # Dashboard styles
    ├── js/
    │   ├── auth.js            # Authentication logic
    │   ├── api.js              # API client
    │   ├── dashboard.js       # Dashboard logic
    │   └── charts.js          # Chart initialization
    ├── pages/
    │   ├── login.html
    │   ├── register.html
    │   ├── member-dashboard.html
    │   ├── trainer-dashboard.html
    │   └── admin-dashboard.html
    └── images/
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new member
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - List users (admin only, supports query params)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Trainers
- `POST /api/trainers` - Create trainer (admin only)
- `GET /api/trainers` - List trainers
- `GET /api/trainers/:id` - Get trainer by ID
- `PUT /api/trainers/:id` - Update trainer

### Plans
- `GET /api/plans` - List membership plans
- `POST /api/plans` - Create plan (admin only)
- `PUT /api/plans/:id` - Update plan (admin only)
- `DELETE /api/plans/:id` - Delete plan (admin only)

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/member/:memberId` - Get member subscriptions

### Workout Plans
- `POST /api/workout-plans` - Create workout plan (trainer)
- `GET /api/workout-plans/member/:memberId` - Get member's workout plan
- `PUT /api/workout-plans/:id` - Update workout plan (trainer)

### Attendance
- `POST /api/attendance/checkin` - Record check-in
- `GET /api/attendance` - Get attendance records (with filters)
- `GET /api/attendance/today` - Get today's check-ins

### Upload
- `POST /api/upload/profile-photo` - Upload profile photo
- `POST /api/upload/checkin-photo` - Upload check-in photo

### Reports
- `GET /api/reports/attendance.csv` - Export attendance CSV
- `GET /api/reports/members.csv` - Export members CSV

## Demo Accounts

After running the seed script:

- **Admin**: `admin@demo.test` / `Admin@123`
- **Trainer**: `trainer1@demo.test` / `Trainer@123`
- **Member**: `member1@demo.test` / `Member@123`

## Demo Checklist

1. ✅ Start server: `npm start`
2. ✅ Run seed: `npm run seed`
3. ✅ Login as admin → View dashboard KPIs and charts
4. ✅ Create new plan and trainer
5. ✅ Export members CSV
6. ✅ Login as trainer → Create workout plan for member
7. ✅ View member roster and attendance
8. ✅ Login as member → View assigned plan
9. ✅ Check-in with camera/photo
10. ✅ View attendance history and chart

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers
- Rate limiting on auth endpoints
- File upload size and type restrictions

## Development

- Use `npm run dev` for development with nodemon
- API runs on `http://localhost:5000`
- Frontend can be served with Live Server or any static file server

## Deployment

### Backend (Render/Heroku)
1. Set environment variables in platform dashboard
2. Deploy from Git repository
3. Ensure MongoDB Atlas allows your platform's IP

### Frontend (Netlify/Vercel)
1. Build/upload `public/` folder
2. Configure CORS origin in backend `.env`
3. Update API base URL in frontend `js/api.js`

## License

ISC

