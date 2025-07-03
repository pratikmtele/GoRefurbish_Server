import express from 'express';
import { login, signup, forgotPassword, resetPassword, verifyOTP } from '../controllers/user.controller.js';

const userRouter = express.Router();

// Authentication routes
userRouter.post('/signup', signup);
userRouter.post('/login', login);

// Password reset routes
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-otp', verifyOTP);
userRouter.post('/reset-password', resetPassword);

export default userRouter;