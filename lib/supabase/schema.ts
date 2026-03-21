// Drizzle schema — forum tables for Phase 4
// Keep in sync with supabase/migrations/ — do NOT hand-edit column names here.
import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  smallint,
  timestamp,
} from 'drizzle-orm/pg-core'

export const forumCategories = pgTable('forum_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  sanityCategoryId: text('sanity_category_id').unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const forumThreads = pgTable('forum_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  bodyPreview: text('body_preview'),
  articleSanityId: text('article_sanity_id').unique(),
  categoryId: uuid('category_id').references(() => forumCategories.id),
  authorId: uuid('author_id'),  // FK to auth.users — in auth schema, not Drizzle schema
  isArticleThread: boolean('is_article_thread').notNull().default(true),
  voteCount: integer('vote_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  isRemoved: boolean('is_removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const forumPosts = pgTable('forum_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => forumThreads.id, { onDelete: 'cascade' }),
  parentPostId: uuid('parent_post_id'),  // self-reference — FK defined in migration
  authorId: uuid('author_id'),           // FK to auth.users — in auth schema
  body: text('body').notNull(),
  voteCount: integer('vote_count').notNull().default(0),
  depth: smallint('depth').notNull().default(0),
  isRemoved: boolean('is_removed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const forumVotes = pgTable('forum_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  targetId: uuid('target_id').notNull(),
  targetType: text('target_type').notNull(),  // 'thread' | 'post'
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const forumBookmarks = pgTable('forum_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => forumThreads.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
