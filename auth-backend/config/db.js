const mongoose = require('mongoose')

const connectDB = async () => {
  const DB_URI = process.env.DB_URI;
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(DB_URI, { useNewUrlParser: true });
    console.log('DB has been connected...');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;