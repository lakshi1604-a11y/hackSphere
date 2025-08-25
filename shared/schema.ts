import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  integer,
  boolean,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "participant",
  "organizer",
  "judge",
]);
export const eventModeEnum = pgEnum("event_mode", [
  "online",
  "offline",
  "hybrid",
]);
export const timelineStatusEnum = pgEnum("timeline_status", [
  "pending",
  "active",
  "completed",
]);

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  skills: json("skills").$type<string[]>().default([]),
  role: userRoleEnum("role").notNull().default("participant"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  theme: text("theme"),
  description: text("description"),
  mode: eventModeEnum("mode").notNull().default("online"),
  tracks: json("tracks").$type<string[]>().default([]),
  rules: json("rules").$type<string[]>().default([]),
  prizes: json("prizes").$type<string[]>().default([]),
  sponsors: json("sponsors").$type<string[]>().default([]),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Timeline milestones
export const timelines = pgTable("timelines", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  status: timelineStatusEnum("status").notNull().default("pending"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Teams table
export const teams = pgTable("teams", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  leaderId: uuid("leader_id")
    .notNull()
    .references(() => users.id),
  maxMembers: integer("max_members").default(4),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team members junction table
export const teamMembers = pgTable("team_members", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  githubUrl: text("github_url"),
  videoUrl: text("video_url"),
  track: text("track"),
  tags: json("tags").$type<string[]>().default([]),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  submittedBy: uuid("submitted_by")
    .notNull()
    .references(() => users.id),
  aiScore: integer("ai_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Judge scores
export const scores = pgTable("scores", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  judgeId: uuid("judge_id")
    .notNull()
    .references(() => users.id),
  innovation: integer("innovation").default(0),
  technical: integer("technical").default(0),
  design: integer("design").default(0),
  impact: integer("impact").default(0),
  totalScore: integer("total_score").default(0),
  feedback: text("feedback"),
  round: integer("round").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  createdEvents: many(events),
  teamMemberships: many(teamMembers),
  ledTeams: many(teams),
  submissions: many(submissions),
  scores: many(scores),
  announcements: many(announcements),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  timelines: many(timelines),
  teams: many(teams),
  submissions: many(submissions),
  announcements: many(announcements),
}));

export const timelinesRelations = relations(timelines, ({ one }) => ({
  event: one(events, {
    fields: [timelines.eventId],
    references: [events.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, {
    fields: [teams.eventId],
    references: [events.id],
  }),
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id],
  }),
  members: many(teamMembers),
  submissions: many(submissions),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  event: one(events, {
    fields: [submissions.eventId],
    references: [events.id],
  }),
  submitter: one(users, {
    fields: [submissions.submittedBy],
    references: [users.id],
  }),
  scores: many(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  submission: one(submissions, {
    fields: [scores.submissionId],
    references: [submissions.id],
  }),
  judge: one(users, {
    fields: [scores.judgeId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  event: one(events, {
    fields: [announcements.eventId],
    references: [events.id],
  }),
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertTimelineSchema = createInsertSchema(timelines).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  aiScore: true,
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Timeline = typeof timelines.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
