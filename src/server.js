import app from './app.js';
import ConnectDB from './db/db.js';

// Import routes
import userRouter from './routes/user.route.js';

const PORT = process.env.PORT || 5000;

// Use user routes
app.use('/api/users', userRouter);

// Start the server
app.listen(PORT, () => {
  // Connect to the database
  ConnectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});