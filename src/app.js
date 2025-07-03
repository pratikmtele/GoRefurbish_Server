import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config();
cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

export default app;