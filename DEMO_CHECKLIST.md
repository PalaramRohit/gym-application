# Demo Checklist

Use this checklist to demonstrate the Gym Membership Management application in a lab/demo session.

## Prerequisites

- [ ] MongoDB Atlas connection string configured in `.env`
- [ ] Dependencies installed: `npm install`
- [ ] Database seeded: `npm run seed`
- [ ] Server running: `npm start` (or `npm run dev`)
- [ ] Frontend accessible (open `public/index.html` in browser or use Live Server)

## Demo Flow

### 1. Landing Page & Authentication

- [ ] **Show Landing Page**
  - Navigate to `public/index.html`
  - Show hero section, features, and plans preview
  - Click "Sign Up" button

- [ ] **Register New Member**
  - Fill registration form (name, email, password, phone, DOB)
  - Submit and verify successful registration
  - Should redirect to member dashboard

- [ ] **Login as Admin**
  - Navigate to login page
  - Login with: `admin@demo.test` / `Admin@123`
  - Verify redirect to admin dashboard

### 2. Admin Dashboard

- [ ] **Overview Section**
  - Show KPI cards: Total Members, Active Subscriptions, Today's Check-ins, Monthly Revenue
  - Show attendance trend chart (line chart)
  - Show membership growth chart (bar chart)

- [ ] **Manage Plans**
  - Navigate to "Plans" section
  - Show existing plans (Basic, Standard, Premium)
  - Click "Create Plan" button
  - Create a new plan with:
    - Name: "Ultra Plan"
    - Duration: 180 days
    - Price: $199.99
    - Perks: ["All features", "VIP access", "Nutrition coaching"]
  - Verify plan appears in list
  - Show edit/delete buttons (delete functionality)

- [ ] **Manage Trainers**
  - Navigate to "Trainers" section
  - Show list of trainers with specialties
  - Show trainer profiles (bio, experience, specialty)

- [ ] **View Members**
  - Navigate to "Members" section
  - Show member list with search functionality
  - Search for a member by name or email
  - Show member details

- [ ] **Export Reports**
  - Navigate to "Reports" section
  - Click "Export CSV" for attendance report
  - Verify CSV file downloads
  - Click "Export CSV" for members report
  - Verify CSV file downloads

- [ ] **View Attendance**
  - Navigate to "Attendance" section
  - Show attendance records table
  - Filter by date range
  - Show member, trainer, time, and method columns

### 3. Trainer Dashboard

- [ ] **Login as Trainer**
  - Logout from admin
  - Login with: `trainer1@demo.test` / `Trainer@123`
  - Verify redirect to trainer dashboard

- [ ] **Overview**
  - Show KPI cards: Assigned Members, Today's Check-ins, Active Workout Plans

- [ ] **My Members**
  - Navigate to "My Members" section
  - Show roster of assigned members
  - Show last check-in date for each member
  - Click "Create Plan" button for a member

- [ ] **Create Workout Plan**
  - Click "Create New Plan" or "Create Plan" for a member
  - Fill form:
    - Select member
    - Enter plan title: "Strength Training Program"
    - Add sessions:
      - Monday: Chest Press, 3 sets, 10 reps
      - Wednesday: Squats, 4 sets, 12 reps
      - Friday: Deadlifts, 3 sets, 8 reps
  - Submit and verify plan creation
  - Show plan in list

- [ ] **View Attendance**
  - Navigate to "Attendance" section
  - Show attendance logs for assigned members
  - Filter by member and date range

### 4. Member Dashboard

- [ ] **Login as Member**
  - Logout from trainer
  - Login with: `member1@demo.test` / `Member@123`
  - Verify redirect to member dashboard

- [ ] **Overview**
  - Show KPI cards:
    - Current Plan (should show active subscription)
    - Days Remaining (calculate from end date)
    - This Month Check-ins
    - Assigned Trainer

- [ ] **Check In**
  - Navigate to "Check In" section
  - Show check-in card with three options
  - **Option 1: Check-in with Camera**
    - Click "Check-in with Camera"
    - Allow camera access
    - Capture photo
    - Verify check-in recorded
  - **Option 2: Upload Photo**
    - Click "Upload Photo"
    - Select image file
    - Verify upload and check-in
  - **Option 3: Manual Check-in**
    - Click "Manual Check-in"
    - Verify check-in recorded without photo

- [ ] **View Workout Plan**
  - Navigate to "Workout Plan" section
  - Show assigned workout plan (if exists)
  - Show sessions organized by day of week
  - Show exercise details (sets, reps, notes)

- [ ] **Attendance History**
  - Navigate to "Attendance" section
  - Show attendance history table
  - Show weekly check-ins chart (line chart)
  - Verify check-ins from today appear
  - Click on photo to view full-size image

- [ ] **Profile**
  - Navigate to "Profile" section
  - Show current profile information
  - Update name, phone, DOB, emergency contact
  - Save changes
  - Verify update success

### 5. API Testing (Optional)

- [ ] **Using Postman or curl**
  - Show login endpoint: `POST /api/auth/login`
  - Show get current user: `GET /api/auth/me`
  - Show create attendance: `POST /api/attendance/checkin`
  - Show get plans: `GET /api/plans`
  - Show create plan (admin): `POST /api/plans`
  - Show export CSV: `GET /api/reports/attendance.csv`

### 6. Security & Features

- [ ] **Token Expiry**
  - Wait for token to expire (or manually remove from localStorage)
  - Try to access protected route
  - Verify redirect to login

- [ ] **Role-based Access**
  - As member, try to access admin routes (should fail)
  - As trainer, verify can only see assigned members

- [ ] **Input Validation**
  - Try to register with invalid email
  - Try to login with wrong password
  - Verify error messages display

- [ ] **Responsive Design**
  - Resize browser window
  - Verify mobile/tablet layout works
  - Test sidebar collapse on mobile

## Quick Demo Script (5 minutes)

1. **Start**: Show landing page → Register new member → Show member dashboard
2. **Admin**: Login as admin → Show KPIs and charts → Create new plan → Export CSV
3. **Trainer**: Login as trainer → Create workout plan for member
4. **Member**: Login as member → Check-in with camera → View attendance chart
5. **Wrap-up**: Show logout and token handling

## Troubleshooting

- **Server not starting**: Check MongoDB connection string in `.env`
- **Login fails**: Verify seed script ran successfully
- **Charts not showing**: Check Chart.js CDN is loaded
- **File upload fails**: Check uploads directory exists and has write permissions
- **CORS errors**: Verify CORS_ORIGIN in `.env` matches frontend URL

## Notes

- All demo accounts are created by the seed script
- Attendance records are randomly generated for the last 30 days
- Revenue numbers are mocked for demonstration
- File uploads work with or without Cloudinary (falls back to local storage)

