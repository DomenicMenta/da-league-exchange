import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  handle: text('handle').notNull(),
  bio: text('bio').notNull().default(''),
  avatarData: text('avatar_data'),
  sleeperUsername: text('sleeper_username'),
  role: text('role').notNull().default('manager'),
  createdAt: integer('created_at').notNull(),
}, (t) => [uniqueIndex('users_handle_uq').on(t.handle)]);

export const leagues = sqliteTable('leagues', {
  id: text('id').primaryKey(), ownerUserId: text('owner_user_id').notNull(),
  sleeperLeagueId: text('sleeper_league_id'), name: text('name').notNull(), season: integer('season').notNull(),
  format: text('format').notNull(), teamCount: integer('team_count').notNull(), scoring: text('scoring').notNull(),
  entryFeeCents: integer('entry_fee_cents').notNull(), usualEntryFeeCents: integer('usual_entry_fee_cents'),
  duesStatus: text('dues_status').notNull().default('unknown'),
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

export const listingViews = sqliteTable('listing_views', {
  id:text('id').primaryKey(), openingId:text('opening_id').notNull(), viewerUserId:text('viewer_user_id'), viewedAt:integer('viewed_at').notNull(),
},(t)=>[index('idx_listing_views_opening').on(t.openingId)]);

export const profileViews = sqliteTable('profile_views', {
  id:text('id').primaryKey(), profileUserId:text('profile_user_id').notNull(), viewerUserId:text('viewer_user_id'), viewedAt:integer('viewed_at').notNull(),
},(t)=>[index('idx_profile_views_profile').on(t.profileUserId)]);

export const listingMessages = sqliteTable('listing_messages', {
  id:text('id').primaryKey(), openingId:text('opening_id').notNull(), userId:text('user_id').notNull(), displayName:text('display_name').notNull(), body:text('body').notNull(), createdAt:integer('created_at').notNull(),
},(t)=>[index('idx_listing_messages_opening_created').on(t.openingId,t.createdAt)]);

export const authSessions = sqliteTable('auth_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull(),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
}, (t) => [index('idx_auth_sessions_user').on(t.userId), index('idx_auth_sessions_expiry').on(t.expiresAt)]);
