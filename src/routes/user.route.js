import express from 'express';
import { login, signup, logout, forgotPassword, resetPassword, verifyOTP, getCurrentUser } from '../controllers/user.controller.js';
import authenticate from '../middleware/authenticate.js';

const userRouter = express.Router();

// Authentication routes
userRouter.post('/signup', signup);
userRouter.post('/signin', login);
userRouter.post('/logout', logout);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-otp', verifyOTP);
userRouter.post('/reset-password', resetPassword);

// protected routes
userRouter.get('/current', authenticate, getCurrentUser);

export default userRouter;