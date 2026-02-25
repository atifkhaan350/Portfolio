# Student Portal - University Management System

A complete student portal application built with React, Node.js, Express, and MongoDB. This system allows students to view their CGPA, attendance, and fee payment status, while admins can manage student data and create accounts.

## Features

### Student Features
- ✅ Register and login with email and password
- ✅ View personal dashboard with CGPA, attendance, and fee status
- ✅ View detailed attendance records per subject
- ✅ Track fee payment status and amount due
- ✅ View academic information (semester, department, etc.)

### Admin Features
- ✅ Create new students with auto-generated Student ID and password
- ✅ View all students and their information
- ✅ Update student data (CGPA, semester, attendance, fees)
- ✅ Generate and manage student credentials
- ✅ Create attendance records for subjects
- ✅ Track and update fee payments

### Super Admin Features
- ✅ All admin features
- ✅ Create additional admin accounts
- ✅ Deactivate admin accounts
- ✅ View all fee records across the system

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens
- **CORS** - Cross-origin requests

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Scoped styling

## Project Structure

```
Student Portal/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── studentController.js
│   │   ├── attendanceController.js
│   │   └── feeController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Attendance.js
│   │   └── Fee.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── feeRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   ├── config.js
    │   │   ├── apiClient.js
    │   │   └── endpoints.js
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── StudentDashboard.js
    │   │   ├── AdminDashboard.js
    │   │   ├── CreateStudent.js
    │   │   ├── CreateAdmin.js
    │   │   └── [CSS modules]
    │   ├── pages/
    │   │   ├── Home.js
    │   │   └── Home.module.css
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── .gitignore
    └── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd "Student Portal/backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit the `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student_portal
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

   - For MongoDB Atlas, replace `MONGODB_URI` with:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student_portal
     ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd "Student Portal/frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API configuration** (if needed)
   
   Edit `src/api/config.js` and update `API_URL` if your backend is on a different URL:
   ```javascript
   const API_URL = 'http://localhost:5000/api';
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires token)

### Students
- `POST /api/students` - Create student (Admin only)
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/:studentId` - Get student details
- `PUT /api/students/:studentId` - Update student (Admin only)
- `DELETE /api/students/:studentId` - Delete student (Admin only)

### Admin
- `POST /api/admins` - Create admin (Super Admin only)
- `GET /api/admins` - Get all admins (Super Admin only)
- `PATCH /api/admins/:adminId/deactivate` - Deactivate admin (Super Admin only)

### Attendance
- `POST /api/attendance` - Create attendance (Admin only)
- `GET /api/attendance/:studentId` - Get student attendance
- `PUT /api/attendance/:attendanceId` - Update attendance (Admin only)

### Fees
- `GET /api/fees` - Get all fees (Admin only)
- `GET /api/fees/:studentId` - Get student fees
- `PUT /api/fees/:feeId/payment` - Update fee payment (Admin only)

## Authentication

The system uses JWT (JSON Web Tokens) for authentication.

### How to Login

1. **Student Login:**
   - Register with email and password on the registration page
   - Or login if you already have an account (created by admin)

2. **Admin Login:**
   - Only Super Admin can create admin accounts
   - Admin created will have auto-generated password
   - Login with the provided email and password

3. **Super Admin:**
   - Manually create first super admin in the database:
     ```javascript
     db.users.insertOne({
       email: "superadmin@university.edu",
       password: bcrypt.hashSync("admin123", 10),
       role: "superadmin",
       isActive: true,
       createdAt: new Date()
     })
     ```

## Database Models

### User
- email (unique, required)
- password (hashed)
- role (superadmin, admin, student)
- createdBy (reference to creator)
- isActive (boolean)

### Student
- user (reference to User)
- studentId (unique, auto-generated)
- firstName, lastName
- department
- semester
- cgpa
- dateOfBirth, phone, address
- enrollmentDate

### Attendance
- student (reference to Student)
- subject
- totalClasses
- classesAttended
- attendancePercentage (auto-calculated)
- semester

### Fee
- student (reference to Student)
- semester
- totalFee
- paidAmount
- remainingAmount (auto-calculated)
- paymentStatus (pending, partial, completed)
- dueDate, lastPaymentDate

## Usage Examples

### Creating a Student (Admin)

1. Login as Admin
2. Go to Admin Dashboard
3. Click "Create Student" tab
4. Fill in the form with student details
5. System will auto-generate:
   - Student ID (e.g., STU202400001)
   - Password (random 16-character string)
6. Share credentials securely with the student

### Student Operations

1. Register with email and password
2. Login with credentials
3. View dashboard showing:
   - CGPA
   - Attendance percentage
   - Fee payment status
   - Semester information

### Admin Operations

1. View all students
2. Update student information (CGPA, semester, etc.)
3. Create attendance records
4. Track fee payments
5. Generate new student accounts

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Role-based authorization (RBAC)
- ✅ Protected routes and API endpoints
- ✅ Input validation
- ✅ CORS enabled

## Best Practices for Learning

1. **Clean Code Structure:**
   - Separated concerns: models, controllers, routes, middleware
   - Clear file names and organization
   - Comments where necessary

2. **Easy to Extend:**
   - Add new features by creating new controller files
   - Follow the existing pattern for new routes
   - Reuse middleware for authentication

3. **Beginner-Friendly:**
   - No complex patterns or over-architecturing
   - Straightforward CRUD operations
   - Clear error messages
   - Simple UI with CSS modules

## Common Issues & Solutions

### MongoDB Connection Error
- **Issue:** `Error connecting to MongoDB`
- **Solution:** 
  - Ensure MongoDB is running locally: `mongod`
  - Or check MongoDB Atlas connection string
  - Verify database name in connection string

### Port Already in Use
- **Issue:** `EADDRINUSE: address already in use :::5000`
- **Solution:** Change PORT in `.env` or kill the process using the port

### CORS Error
- **Issue:** `Access to XMLHttpRequest blocked by CORS policy`
- **Solution:** Backend already has CORS enabled, ensure correct API_URL in frontend

### Token Expired
- **Issue:** `Invalid or expired token`
- **Solution:** Clear localStorage and login again

## Environment Variables

### Backend (.env)
```
PORT=5000                                          # Server port
MONGODB_URI=mongodb://localhost:27017/student_portal  # Database URI
JWT_SECRET=your_secret_key                        # JWT signing key
NODE_ENV=development                              # Environment
```

## Future Enhancements

- Add email notifications for fee due dates
- Implement payment gateway integration
- Add grade management system
- Create reports and analytics dashboard
- Implement course registration system
- Add messaging system between admin and students

## License

This project is open source and available for educational purposes.

## Support

For questions or issues, please refer to the code comments or create a new issue in the repository.

---

**Happy Learning!** 🎓
