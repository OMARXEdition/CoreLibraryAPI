import type { Request, Response } from 'express';
import { bookService } from '../services/bookService.js';
import { createBookSchema, updateBookSchema } from '../validation/bookSchemas.js';

function bookId(req: Request): number {
  const id = Number(req.params.id);
  return Number.isSafeInteger(id) && id > 0 ? id : NaN;
}

export function listBooks(_req: Request, res: Response): void {
  res.json(bookService.list());
}

export function getBook(req: Request, res: Response): void {
  const book = bookService.get(bookId(req));
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.json(book);
}

export function createBook(req: Request, res: Response): void {
  const input = createBookSchema.parse(req.body);
  const book = bookService.create(input);
  res.status(201).location(`/books/${book.id}`).json(book);
}

export function updateBook(req: Request, res: Response): void {
  const input = updateBookSchema.parse(req.body);
  const book = bookService.update(bookId(req), input);
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.json(book);
}

export function deleteBook(req: Request, res: Response): void {
  if (!bookService.delete(bookId(req))) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.status(204).send();
}
