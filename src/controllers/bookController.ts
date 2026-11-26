import type { Request, Response } from 'express';
import { bookService } from '../services/bookService.js';
import { createBookSchema, updateBookSchema } from '../validation/bookSchemas.js';

function bookId(req: Request): number {
  const id = Number(req.params.id);
  return Number.isSafeInteger(id) && id > 0 ? id : NaN;
}

export async function listBooks(_req: Request, res: Response): Promise<void> {
  res.json(await bookService.list());
}

export async function getBook(req: Request, res: Response): Promise<void> {
  const book = await bookService.get(bookId(req));
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.json(book);
}

export async function createBook(req: Request, res: Response): Promise<void> {
  const input = createBookSchema.parse(req.body);
  const book = await bookService.create(input);
  res.status(201).location(`/books/${book.id}`).json(book);
}

export async function updateBook(req: Request, res: Response): Promise<void> {
  const input = updateBookSchema.parse(req.body);
  const book = await bookService.update(bookId(req), input);
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.json(book);
}

export async function deleteBook(req: Request, res: Response): Promise<void> {
  if (!await bookService.delete(bookId(req))) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.status(204).send();
}
