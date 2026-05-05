import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI as string;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the process using that port or set a different PORT in .env.`);
        return;
      }

      console.error('Server startup error:', error);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
