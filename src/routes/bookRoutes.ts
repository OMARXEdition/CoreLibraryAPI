import { Router } from 'express';
import { createBook, deleteBook, getBook, listBooks, updateBook } from '../controllers/bookController.js';

export const bookRoutes = Router();

bookRoutes.get('/', listBooks);
bookRoutes.get('/:id', getBook);
bookRoutes.post('/', createBook);
bookRoutes.patch('/:id', updateBook);
bookRoutes.delete('/:id', deleteBook);
