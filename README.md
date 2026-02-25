# University Management System

A comprehensive MERN stack application for managing university data, including student profiles, attendance, grades (CGPA), and fee payments.

## Features

- **Admin Panel**: Manage students, teachers, and admins. Monitor system statistics and fee distributions.
- **Teacher Dashboard**: Mark attendance, update student CGPAs, and record fee payments.
- **Student Portal**: View attendance records, academic performance (CGPA), and fee payment history.
- **Authentication**: Role-based access control with JWT.
- **Responsive UI**: Modern, dark-themed interface built with React and Vanilla CSS.

## Tech Stack

- **Frontend**: React.js, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, BcryptJS

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies for backend:
   ```bash
   cd backend
   npm install
   ```
3. Install dependencies for frontend:
   ```bash
   cd frontend
   npm install
   ```

### Configuration

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

## License

This project is licensed under the MIT License.
