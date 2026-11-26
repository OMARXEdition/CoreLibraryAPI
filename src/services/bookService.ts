import type { Book } from '../models/Book.js';
import type { CreateBookInput, UpdateBookInput } from '../validation/bookSchemas.js';

class BookService {
  private readonly books = new Map<number, Book>();
  private nextId = 1;

  list(): Book[] {
    return [...this.books.values()];
  }

  get(id: number): Book | undefined {
    return this.books.get(id);
  }

  create(input: CreateBookInput): Book {
    const book: Book = { id: this.nextId++, ...input };
    this.books.set(book.id, book);
    return book;
  }

  update(id: number, input: UpdateBookInput): Book | undefined {
    const current = this.books.get(id);
    if (!current) return undefined;
    const book = { ...current, ...input };
    this.books.set(id, book);
    return book;
  }

  delete(id: number): boolean {
    return this.books.delete(id);
  }

  clear(): void {
    this.books.clear();
    this.nextId = 1;
  }
}

export const bookService = new BookService();
