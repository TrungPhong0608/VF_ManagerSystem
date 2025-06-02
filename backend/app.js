const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const statsRoutes = require('./routes/statsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});