import { prisma } from '../db.js';
import type { Book } from '../models/Book.js';
import type { CreateBookInput, UpdateBookInput } from '../validation/bookSchemas.js';

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0 && id <= 2147483647;
}

function isMissingRecord(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025';
}

class BookService {
  async list(): Promise<Book[]> {
    return prisma.book.findMany({ orderBy: { id: 'asc' } });
  }

  async get(id: number): Promise<Book | null> {
    return validId(id) ? prisma.book.findUnique({ where: { id } }) : null;
  }

  async create(input: CreateBookInput): Promise<Book> {
    return prisma.book.create({ data: input });
  }

  async update(id: number, input: UpdateBookInput): Promise<Book | null> {
    if (!validId(id)) return null;
    try {
      return await prisma.book.update({ where: { id }, data: input });
    } catch (error) {
      if (isMissingRecord(error)) return null;
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    if (!validId(id)) return false;
    try {
      await prisma.book.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isMissingRecord(error)) return false;
      throw error;
    }
  }
}

export const bookService = new BookService();
