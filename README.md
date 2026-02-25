# Muhammad Atif Portfolio - MERN Stack

A full-stack portfolio website built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

```
mern-portfolio/
├── backend/          # Node.js + Express API
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── .env.example  # Environment variables template
│   ├── package.json  # Backend dependencies
│   ├── README.md     # Backend documentation
│   └── server.js     # Entry point
│
└── frontend/         # React + Vite + TypeScript
    ├── public/       # Static assets
    ├── src/          # React source code
    │   ├── components/  # React components
    │   ├── sections/    # Page sections
    │   ├── config.ts    # Site configuration
    │   └── ...
    ├── package.json  # Frontend dependencies
    └── ...
```

## Features

### Frontend
- Modern React with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- GSAP animations
- Responsive design
- Swiss Dada design aesthetic

### Backend
- RESTful API with Express
- MongoDB database with Mongoose
- JWT authentication
- Input validation
- Contact form handling
- Project management API
- Skills management API

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Navigate
```bash
cd mern-portfolio
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend server
npm run dev
```
Backend will run on http://localhost:5000

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Start frontend development server
npm run dev
```
Frontend will run on http://localhost:5173

### 4. Seed Initial Data (Optional)
```bash
# In backend folder, seed skills data
curl -X POST http://localhost:5000/api/skills/seed
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

## Deployment

### Backend (e.g., Render, Railway, Heroku)
1. Set environment variables
2. Connect to MongoDB Atlas
3. Deploy with `npm start`

### Frontend (e.g., Vercel, Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set API URL environment variable

## Author

**Muhammad Atif**
- MERN Stack Developer
- Student at NUML University, Islamabad, Pakistan
- Email: atifkhaan350@gmail.com

## License

MIT License
