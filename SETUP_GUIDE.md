# Student Portal - Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local installation: [Download](https://docs.mongodb.com/manual/installation/)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
3. **NPM** (comes with Node.js) or **Yarn**
4. **Git** (optional but recommended)

## Step 1: Download/Extract the Project

Extract the Student Portal folder to your desired location.

## Step 2: Setting Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended for Beginners)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project
4. Create a cluster (Free tier is sufficient)
5. Create a database user (username and password)
6. Add your IP address to the IP whitelist
7. Click "Connect" and copy the connection string
8. Replace `<username>`, `<password>`, and `<database>` in the connection string

### Option B: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
   - **Windows:** `mongod`
   - **Mac:** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory
```bash
cd "Student Portal/backend"
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install:
- express (web framework)
- mongoose (database ODM)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- dotenv (environment variables)
- cors (cross-origin requests)

### 3.3 Configure Environment Variables

Edit the `.env` file in the backend folder:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_portal
JWT_SECRET=MySecureSecret123!@#
NODE_ENV=development
```

**For MongoDB Atlas:** Replace `MONGODB_URI` with:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student_portal?retryWrites=true&w=majority
```

### 3.4 Start the Backend Server

```bash
npm start
```

You should see:
```
Server running on port 5000
Environment: development
MongoDB Connected: localhost
```

## Step 4: Frontend Setup

### 4.1 Open a New Terminal

Keep the backend running and open a new terminal in the same location.

### 4.2 Navigate to Frontend Directory
```bash
cd "Student Portal/frontend"
```

### 4.3 Install Dependencies
```bash
npm install
```

This will install:
- react (UI library)
- react-router-dom (routing)
- axios (HTTP client)
- react-scripts (build tools)

### 4.4 Start the Development Server

```bash
npm start
```

The browser should automatically open to `http://localhost:3000`

If not, manually open: http://localhost:3000

## Step 5: Testing the Application

### 5.1 Create a Super Admin

To fully test the system, you need to create a super admin in MongoDB:

#### Using MongoDB Compass (GUI - Easier)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your MongoDB instance
3. Create a new database: `student_portal`
4. Create a collection: `users`
5. Insert a new document:

```json
{
  "email": "superadmin@university.edu",
  "password": "$2a$10$4z8v...encrypted_password",
  "role": "superadmin",
  "isActive": true,
  "createdAt": { "$date": "2024-02-21" },
  "updatedAt": { "$date": "2024-02-21" }
}
```

> **Note:** For the password, use an online bcryptjs tool to hash "admin123"

#### Using MongoDB Shell

```bash
mongosh

# Switch to database
use student_portal

# Insert super admin
db.users.insertOne({
  email: "superadmin@university.edu",
  password: "placeholder_bcrypt_hash",
  role: "superadmin",
  isActive: true
})
```

### 5.2 Test Workflows

#### As a Student:

1. Click **Register**
2. Enter email and password
3. You'll be logged in automatically
4. You can see your dashboard

#### As an Admin:

1. Create admin account from super admin panel
2. Login with provided credentials
3. Create students
4. Update student information
5. Manage fees and attendance

#### As a Super Admin:

1. Login with super admin account
2. Create other admin accounts
3. View all system data
4. Deactivate admins

## Project Structure Explained

### Backend Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection setup
├── controllers/
│   ├── authController.js    # Login, register logic
│   ├── adminController.js   # Admin management
│   ├── studentController.js # Student CRUD operations
│   ├── attendanceController.js
│   └── feeController.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── authorize.js         # Role-based access control
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User schema (base for admin/student)
│   ├── Student.js           # Student schema
│   ├── Attendance.js        # Attendance schema
│   └── Fee.js               # Fee schema
├── routes/
│   ├── authRoutes.js        # /api/auth endpoints
│   ├── adminRoutes.js       # /api/admins endpoints
│   ├── studentRoutes.js     # /api/students endpoints
│   ├── attendanceRoutes.js  # /api/attendance endpoints
│   └── feeRoutes.js         # /api/fees endpoints
├── .env                     # Environment variables (CREATE THIS)
├── .gitignore               # Ignore files in git
├── package.json             # Dependencies list
└── server.js                # Main server file
```

### Frontend Structure

```
frontend/
├── public/
│   └── index.html           # HTML entry point
├── src/
│   ├── api/
│   │   ├── config.js        # API configuration & token management
│   │   ├── apiClient.js     # Axios instance setup
│   │   └── endpoints.js     # All API endpoints
│   ├── components/
│   │   ├── Login.js         # Login form
│   │   ├── Register.js      # Registration form
│   │   ├── StudentDashboard.js
│   │   ├── AdminDashboard.js
│   │   ├── StudentDetails.js
│   │   ├── CreateStudent.js
│   │   ├── CreateAdmin.js
│   │   └── [CSS modules]    # Styling for components
│   ├── pages/
│   │   ├── Home.js          # Landing page
│   │   └── Home.module.css  # Home styling
│   ├── App.js               # Main app & routing
│   ├── App.css              # Global styles
│   ├── index.js             # React entry point
│   └── .gitignore
└── package.json             # Dependencies list
```

## Key Concepts Explained

### 1. Authentication Flow

```
User Registers/Logins
    ↓
Backend validates email & password
    ↓
Backend creates JWT token
    ↓
Token sent to frontend
    ↓
Frontend stores token in localStorage
    ↓
Frontend sends token with every API request
    ↓
Backend verifies token for protected routes
```

### 2. Authorization (Role-Based Access Control)

```
User has role: student, admin, or superadmin
    ↓
Routes check user's role
    ↓
If role matches required role → Allow access
    ↓
Otherwise → Deny with 403 error
```

### 3. CRUD Operations

- **C (Create):** POST request to create new record
- **R (Read):** GET request to fetch records
- **U (Update):** PUT request to modify record
- **D (Delete):** DELETE request to remove record

### 4. API Response Format

Successful response:
```json
{
  "message": "Operation successful",
  "data": { "id": "123", "name": "John" }
}
```

Error response:
```json
{
  "message": "Error description",
  "error": "Details if development mode"
}
```

## Common Tasks

### How to: Create a Student (as Admin)

1. Login as admin
2. Dashboard → Create Student tab
3. Fill form with student details
4. System auto-generates:
   - Student ID (STU202400001)
   - Password (random)
5. Share credentials with student

### How to: Update Student CGPA

1. Student Details → Profile tab (as admin)
2. Edit CGPA field
3. Save changes

### How to: Record Attendance

1. Go to Attendance tab
2. Create new attendance record
3. Enter subject, total classes, attended classes
4. System auto-calculates percentage

### How to: Update Fee Payment

1. Go to Fees tab
2. Click on a pending fee
3. Enter payment amount
4. System updates remaining amount and status

## Troubleshooting

### Backend won't start

**Error:** `Cannot find module 'express'`
- **Solution:** Run `npm install` in backend folder

**Error:** `Error connecting to MongoDB`
- **Solution:** 
  - Check MongoDB is running
  - Verify MONGODB_URI in .env
  - For Atlas: ensure IP whitelist includes your IP

**Error:** `Port 5000 already in use`
- **Solution:** Change PORT in .env to 5001, 5002, etc., or kill process using port 5000

### Frontend won't start

**Error:** `Cannot find module 'react'`
- **Solution:** Run `npm install` in frontend folder

**Error:** `API calls failing (CORS error)`
- **Solution:** 
  - Ensure backend is running on http://localhost:5000
  - Check API_URL in `frontend/src/api/config.js`

**Error:** `Blank page / Can't login`
- **Solution:** 
  - Open browser DevTools (F12)
  - Check Console for errors
  - Clear localStorage: `localStorage.clear()`
  - Refresh page

### Authentication Issues

**Problem:** Can't login after creating account
- Check if account was created in MongoDB
- Verify password is correct
- Try creating new account

**Problem:** Token expired
- Clear browser cache/localStorage
- Login again

## Next Steps to Learn

1. **Expand the Dashboard:**
   - Add charts and analytics
   - Show student progress graphs

2. **Add More Features:**
   - Email notifications
   - Payment gateway integration
   - Course management
   - Grade management

3. **Improve Security:**
   - Add 2FA (Two-Factor Authentication)
   - Rate limiting
   - Input validation

4. **Database Improvements:**
   - Add database indexing
   - Implement data caching

5. **Frontend Enhancements:**
   - Add dark mode
   - Responsive design improvements
   - Better error handling

## Useful Commands

### Backend
```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload (if nodemon is installed)
npm run dev
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### MongoDB (Local)
```bash
# Start MongoDB
mongod

# Open MongoDB shell
mongosh

# List databases
show databases

# Switch to student_portal database
use student_portal

# View collections
show collections

# View all users
db.users.find()
```

## Resources for Further Learning

- **Express.js:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **React:** https://react.dev/
- **JWT:** https://jwt.io/
- **REST API:** https://restfulapi.net/

## Tips for Beginners

1. **Read the comments** in code files - they explain what each section does
2. **Test each feature** manually before moving to next
3. **Check browser console** (F12) for error messages
4. **Check terminal output** for backend errors
5. **Use Postman** to test APIs directly
6. **Start small** - understand login before learning fees

## Support

If you get stuck:

1. Check the error message carefully
2. Search the error on Google
3. Check the README file
4. Review code comments
5. Try restarting both servers

## Final Notes

- This is a learning project - security settings should be updated for production
- Change JWT_SECRET to a strong random string
- Add proper input validation
- Implement rate limiting for production
- Use HTTPS in production

Happy Learning! 🎓
