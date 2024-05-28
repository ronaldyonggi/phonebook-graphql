// Initialize MongoDB Connection
const mongoose = require('mongoose');
const config = require('./config');

const connectToDatabase = () => {
  mongoose.set('strictQuery', false);
  console.log('connecting to', config.MONGODB_URI);

  mongoose
    .connect(config.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('error connecting to MongoDB:', err.message));

  mongoose.set('debug', true)
};

module.exports = {
  connectToDatabase,
};
