import express, { type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { bookRoutes } from './routes/bookRoutes.js';

export const app = express();

app.use(express.json());
app.use('/books', bookRoutes);
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: error.issues });
    return;
  }
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
};

app.use(handleError);
