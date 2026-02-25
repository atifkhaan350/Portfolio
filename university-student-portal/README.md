# University Student Portal (React + Node + Express + MongoDB)

This is a complete beginner-friendly student portal in a **new isolated folder**.

## Features
- Student login to view:
  - CGPA
  - Attendance
  - Fee status and payment history
- Super Admin:
  - Creates other admins
- Admin and Super Admin:
  - Create, read, update, delete student data (CRUD)
  - Add fee payments
  - Reset student password
  - Auto-generate student ID and temporary password
- Role-based access middleware with JWT authentication

## Tech Stack
- Frontend: React (with `react-scripts`, no Vite)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)

## Folder Structure
- `backend/` - API, models, controllers, routes, middleware
- `frontend/` - React UI with protected routes and dashboards

## Backend Setup
1. Open terminal in `backend`
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example`
4. Start backend:
   - `npm run dev`

Backend default super admin is auto-created on first run:
- Email: `superadmin@university.edu`
- Password: `SuperAdmin@123`

## Frontend Setup
1. Open terminal in `frontend`
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example`
4. Start frontend:
   - `npm start`

Frontend runs on `http://localhost:3000` and backend on `http://localhost:5001`.

## Important Notes
- Students can only view their own dashboard data.
- Only admins/super-admins can edit student records.
- Only super admin can create admins.
- Students should change temporary passwords after first login.
