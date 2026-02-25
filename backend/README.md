# Portfolio Backend API

This is the backend API for Muhammad Atif's Portfolio website, built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: JWT-based authentication system
- **Projects API**: CRUD operations for portfolio projects
- **Contact API**: Handle contact form submissions
- **Skills API**: Manage and display technical skills
- **Security**: Helmet, CORS, and input validation

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Installation

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_secret_key_here
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/featured/list` - Get featured projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages
- `GET /api/contact/:id` - Get message by ID
- `PUT /api/contact/:id/read` - Mark message as read
- `DELETE /api/contact/:id` - Delete message

### Skills
- `GET /api/skills` - Get all skills (grouped by category)
- `GET /api/skills/category/:category` - Get skills by category
- `POST /api/skills` - Add new skill
- `POST /api/skills/seed` - Seed initial skills data
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Health Check
- `GET /api/health` - Check API status

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── .env.example     # Environment variables example
├── package.json     # Dependencies
├── README.md        # This file
└── server.js        # Entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/portfolio |
| JWT_SECRET | Secret key for JWT | required |
| JWT_EXPIRE | JWT expiration time | 7d |
| NODE_ENV | Environment mode | development |

## Author

**Muhammad Atif**
- Email: atifkhaan350@gmail.com
- Location: NUML University, Islamabad, Pakistan
