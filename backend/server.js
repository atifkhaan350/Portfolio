const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'University Data API is running!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));

// Serve frontend build in production
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
    }
    const fs = require('fs');
    if (fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
        return res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
    return res.status(200).send('Frontend not built yet. Run: cd frontend && npm run build');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 University Data Server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/health\n`);
});
