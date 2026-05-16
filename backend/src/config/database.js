import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop stale email index if it exists
    try {
      await conn.connection.collection('users').dropIndex('email_1');
      console.log('Dropped stale email index');
    } catch (err) {
      // Index doesn't exist, ignore
    }
    
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;