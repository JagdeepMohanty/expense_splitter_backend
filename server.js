const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));