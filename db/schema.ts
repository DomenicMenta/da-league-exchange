import { integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  handle: text('handle').notNull(),
  bio: text('bio').notNull().default(''),
  sleeperUsername: text('sleeper_username'),
  role: text('role').notNull().default('manager'),
  createdAt: integer('created_at').notNull(),
}, (t) => [uniqueIndex('users_handle_uq').on(t.handle)]);

export const leagues = sqliteTable('leagues', {
  id: text('id').primaryKey(), ownerUserId: text('owner_user_id').notNull(),
  sleeperLeagueId: text('sleeper_league_id'), name: text('name').notNull(), season: integer('season').notNull(),
  format: text('format').notNull(), teamCount: integer('team_count').notNull(), scoring: text('scoring').notNull(),
  entryFeeCents: integer('entry_fee_cents').notNull(), duesStatus: text('dues_status').notNull().default('unknown'),
  bylawsUrl: text('bylaws_url'), bylawsText: text('bylaws_text').notNull().default(''), description: text('description').notNull().default(''),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, (t) => [uniqueIndex('leagues_sleeper_id_uq').on(t.sleeperLeagueId)]);

export const openings = sqliteTable('openings', {
  id: text('id').primaryKey(), leagueId: text('league_id').notNull(), title: text('title').notNull(), rosterId: integer('roster_id'),
  rosterSummary: text('roster_summary').notNull(), draftCapital: text('draft_capital').notNull().default(''),
  record: text('record').notNull().default(''), status: text('status').notNull().default('open'),
  requirements: text('requirements').notNull().default(''), featured: integer('featured',{mode:'boolean'}).notNull().default(false),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
});

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(), openingId: text('opening_id').notNull(), applicantUserId: text('applicant_user_id').notNull(),
  message: text('message').notNull(), experience: text('experience').notNull().default(''), status: text('status').notNull().default('submitted'),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, (t) => [uniqueIndex('applications_opening_user_uq').on(t.openingId,t.applicantUserId)]);

export const savedOpenings = sqliteTable('saved_openings', {
  userId: text('user_id').notNull(), openingId: text('opening_id').notNull(), createdAt: integer('created_at').notNull(),
}, (t) => [primaryKey({columns:[t.userId,t.openingId]})]);

export const trackedTeams = sqliteTable('tracked_teams', {
  id: text('id').primaryKey(), userId: text('user_id').notNull(), sleeperLeagueId: text('sleeper_league_id'), leagueName: text('league_name').notNull(),
  teamName: text('team_name').notNull(), format: text('format').notNull(), record: text('record').notNull().default(''), createdAt: integer('created_at').notNull(),
});
