const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      const mongoServer = await MongoMemoryServer.create();
      MONGO_URI = mongoServer.getUri();
      console.log('Using in-memory MongoDB instance');
    }
    
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB();

app.get('/', (req, res) => {
  res.send('Club Organizer API is running');
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clubRoutes = require('./routes/clubs');
const eventRoutes = require('./routes/events');
const memberRoutes = require('./routes/members');
const budgetRoutes = require('./routes/budgets');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
