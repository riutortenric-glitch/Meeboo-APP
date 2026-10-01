import { date, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Phase 0: users only. Remaining tables (profiles, plans, set_logs, …) per plan.md §3 land with their features.
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user id
  email: text('email'),
  dob: date('dob'),
  locale: text('locale').notNull().default('en'),
  units: text('units', { enum: ['metric', 'imperial'] }).notNull().default('metric'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
