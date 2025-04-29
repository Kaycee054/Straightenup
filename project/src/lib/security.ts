import { z } from 'zod';

// Password strength validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation schema with stricter rules
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email address is too long')
  .refine((email) => !email.includes(' '), 'Email cannot contain spaces')
  .refine((email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email), 'Invalid email format')
  .refine((email) => email === email.toLowerCase(), 'Email must be lowercase')
  .transform(email => email.toLowerCase().trim());

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_ATTEMPTS = 5;

interface RateLimitEntry {
  attempts: number;
  timestamp: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    rateLimitMap.set(identifier, { attempts: 1, timestamp: now });
    return true;
  }

  if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { attempts: 1, timestamp: now });
    return true;
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return false;
  }

  entry.attempts += 1;
  rateLimitMap.set(identifier, entry);
  return true;
};

export const validatePassword = (password: string): string[] => {
  try {
    passwordSchema.parse(password);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Invalid password'];
  }
};

export const validateEmail = (email: string): string[] => {
  try {
    emailSchema.parse(email);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Invalid email address'];
  }
};

// Helper function to normalize email
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};