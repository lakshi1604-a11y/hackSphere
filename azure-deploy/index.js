var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  announcementsRelations: () => announcementsRelations,
  eventModeEnum: () => eventModeEnum,
  events: () => events,
  eventsRelations: () => eventsRelations,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertEventSchema: () => insertEventSchema,
  insertScoreSchema: () => insertScoreSchema,
  insertSubmissionSchema: () => insertSubmissionSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertTeamSchema: () => insertTeamSchema,
  insertTimelineSchema: () => insertTimelineSchema,
  insertUserSchema: () => insertUserSchema,
  scores: () => scores,
  scoresRelations: () => scoresRelations,
  submissions: () => submissions,
  submissionsRelations: () => submissionsRelations,
  teamMembers: () => teamMembers,
  teamMembersRelations: () => teamMembersRelations,
  teams: () => teams,
  teamsRelations: () => teamsRelations,
  timelineStatusEnum: () => timelineStatusEnum,
  timelines: () => timelines,
  timelinesRelations: () => timelinesRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, integer, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum, eventModeEnum, timelineStatusEnum, users, events, timelines, teams, teamMembers, submissions, scores, announcements, usersRelations, eventsRelations, timelinesRelations, teamsRelations, teamMembersRelations, submissionsRelations, scoresRelations, announcementsRelations, insertUserSchema, insertEventSchema, insertTimelineSchema, insertTeamSchema, insertTeamMemberSchema, insertSubmissionSchema, insertScoreSchema, insertAnnouncementSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["participant", "organizer", "judge"]);
    eventModeEnum = pgEnum("event_mode", ["online", "offline", "hybrid"]);
    timelineStatusEnum = pgEnum("timeline_status", ["pending", "active", "completed"]);
    users = pgTable("users", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email").notNull().unique(),
      name: text("name").notNull(),
      bio: text("bio"),
      avatar: text("avatar"),
      skills: json("skills").$type().default([]),
      role: userRoleEnum("role").notNull().default("participant"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    events = pgTable("events", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      theme: text("theme"),
      description: text("description"),
      mode: eventModeEnum("mode").notNull().default("online"),
      tracks: json("tracks").$type().default([]),
      rules: json("rules").$type().default([]),
      prizes: json("prizes").$type().default([]),
      sponsors: json("sponsors").$type().default([]),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      createdBy: uuid("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      isActive: boolean("is_active").default(true)
    });
    timelines = pgTable("timelines", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
      label: text("label").notNull(),
      description: text("description"),
      dueDate: timestamp("due_date").notNull(),
      status: timelineStatusEnum("status").notNull().default("pending"),
      order: integer("order").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    teams = pgTable("teams", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
      leaderId: uuid("leader_id").notNull().references(() => users.id),
      maxMembers: integer("max_members").default(4),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    teamMembers = pgTable("team_members", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
      userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      joinedAt: timestamp("joined_at").defaultNow().notNull()
    });
    submissions = pgTable("submissions", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      description: text("description").notNull(),
      githubUrl: text("github_url"),
      videoUrl: text("video_url"),
      track: text("track"),
      tags: json("tags").$type().default([]),
      teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
      eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
      submittedBy: uuid("submitted_by").notNull().references(() => users.id),
      aiScore: integer("ai_score").default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    scores = pgTable("scores", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
      judgeId: uuid("judge_id").notNull().references(() => users.id),
      innovation: integer("innovation").default(0),
      technical: integer("technical").default(0),
      design: integer("design").default(0),
      impact: integer("impact").default(0),
      totalScore: integer("total_score").default(0),
      feedback: text("feedback"),
      round: integer("round").default(1),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    announcements = pgTable("announcements", {
      id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
      eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
      message: text("message").notNull(),
      createdBy: uuid("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    usersRelations = relations(users, ({ many, one }) => ({
      createdEvents: many(events),
      teamMemberships: many(teamMembers),
      ledTeams: many(teams),
      submissions: many(submissions),
      scores: many(scores),
      announcements: many(announcements)
    }));
    eventsRelations = relations(events, ({ one, many }) => ({
      creator: one(users, {
        fields: [events.createdBy],
        references: [users.id]
      }),
      timelines: many(timelines),
      teams: many(teams),
      submissions: many(submissions),
      announcements: many(announcements)
    }));
    timelinesRelations = relations(timelines, ({ one }) => ({
      event: one(events, {
        fields: [timelines.eventId],
        references: [events.id]
      })
    }));
    teamsRelations = relations(teams, ({ one, many }) => ({
      event: one(events, {
        fields: [teams.eventId],
        references: [events.id]
      }),
      leader: one(users, {
        fields: [teams.leaderId],
        references: [users.id]
      }),
      members: many(teamMembers),
      submissions: many(submissions)
    }));
    teamMembersRelations = relations(teamMembers, ({ one }) => ({
      team: one(teams, {
        fields: [teamMembers.teamId],
        references: [teams.id]
      }),
      user: one(users, {
        fields: [teamMembers.userId],
        references: [users.id]
      })
    }));
    submissionsRelations = relations(submissions, ({ one, many }) => ({
      team: one(teams, {
        fields: [submissions.teamId],
        references: [teams.id]
      }),
      event: one(events, {
        fields: [submissions.eventId],
        references: [events.id]
      }),
      submitter: one(users, {
        fields: [submissions.submittedBy],
        references: [users.id]
      }),
      scores: many(scores)
    }));
    scoresRelations = relations(scores, ({ one }) => ({
      submission: one(submissions, {
        fields: [scores.submissionId],
        references: [submissions.id]
      }),
      judge: one(users, {
        fields: [scores.judgeId],
        references: [users.id]
      })
    }));
    announcementsRelations = relations(announcements, ({ one }) => ({
      event: one(events, {
        fields: [announcements.eventId],
        references: [events.id]
      }),
      creator: one(users, {
        fields: [announcements.createdBy],
        references: [users.id]
      })
    }));
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
    });
    insertEventSchema = createInsertSchema(events).omit({
      id: true,
      createdAt: true
    });
    insertTimelineSchema = createInsertSchema(timelines).omit({
      id: true,
      createdAt: true
    });
    insertTeamSchema = createInsertSchema(teams).omit({
      id: true,
      createdAt: true
    });
    insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
      id: true,
      joinedAt: true
    });
    insertSubmissionSchema = createInsertSchema(submissions).omit({
      id: true,
      createdAt: true,
      aiScore: true
    });
    insertScoreSchema = createInsertSchema(scores).omit({
      id: true,
      createdAt: true
    });
    insertAnnouncementSchema = createInsertSchema(announcements).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool as NodePool } from "pg";
import ws from "ws";
var isAzureDatabase, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    isAzureDatabase = process.env.DATABASE_URL.includes("postgres.database.azure.com");
    if (isAzureDatabase) {
      pool = new NodePool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
          // Azure requires SSL
        },
        max: 20,
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 2e3
      });
      db = drizzleNode(pool, { schema: schema_exports });
    } else {
      neonConfig.webSocketConstructor = ws;
      pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
      db = drizzleNeon(pool, { schema: schema_exports });
    }
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// server/storage.ts
init_schema();
init_db();
init_db();
import { eq, desc, and, sql as sql2, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const userData = {
      ...insertUser,
      skills: insertUser.skills || []
    };
    const [user] = await db.insert(users).values([userData]).returning();
    return user;
  }
  async updateUser(id, userUpdate) {
    const updateData = { ...userUpdate };
    if (updateData.skills) {
      updateData.skills = Array.isArray(updateData.skills) ? updateData.skills : [];
    }
    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return updatedUser || void 0;
  }
  // Event methods
  async getEvents() {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }
  async getEvent(id) {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || void 0;
  }
  async createEvent(event) {
    const eventData = {
      ...event,
      tracks: event.tracks || [],
      rules: event.rules || [],
      prizes: event.prizes || [],
      sponsors: event.sponsors || []
    };
    const [createdEvent] = await db.insert(events).values([eventData]).returning();
    return createdEvent;
  }
  async updateEvent(id, eventUpdate) {
    const updateData = { ...eventUpdate };
    if (updateData.tracks) {
      updateData.tracks = Array.isArray(updateData.tracks) ? updateData.tracks : [];
    }
    if (updateData.rules) {
      updateData.rules = Array.isArray(updateData.rules) ? updateData.rules : [];
    }
    if (updateData.prizes) {
      updateData.prizes = Array.isArray(updateData.prizes) ? updateData.prizes : [];
    }
    if (updateData.sponsors) {
      updateData.sponsors = Array.isArray(updateData.sponsors) ? updateData.sponsors : [];
    }
    const [updatedEvent] = await db.update(events).set(updateData).where(eq(events.id, id)).returning();
    return updatedEvent || void 0;
  }
  // Timeline methods
  async getTimelinesByEvent(eventId) {
    return await db.select().from(timelines).where(eq(timelines.eventId, eventId)).orderBy(timelines.order);
  }
  async createTimeline(timeline) {
    const [createdTimeline] = await db.insert(timelines).values(timeline).returning();
    return createdTimeline;
  }
  async updateTimelineStatus(id, status) {
    const [updatedTimeline] = await db.update(timelines).set({ status }).where(eq(timelines.id, id)).returning();
    return updatedTimeline || void 0;
  }
  // Team methods
  async getTeamsByEvent(eventId) {
    return await db.select().from(teams).where(eq(teams.eventId, eventId)).orderBy(desc(teams.createdAt));
  }
  async getTeam(id) {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || void 0;
  }
  async createTeam(team) {
    const [createdTeam] = await db.insert(teams).values(team).returning();
    await db.insert(teamMembers).values({
      teamId: createdTeam.id,
      userId: createdTeam.leaderId
    });
    return createdTeam;
  }
  async addTeamMember(teamMember) {
    const [createdMember] = await db.insert(teamMembers).values(teamMember).returning();
    return createdMember;
  }
  async removeTeamMember(teamId, userId) {
    await db.delete(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  }
  async getTeamMembers(teamId) {
    return await db.select({
      id: teamMembers.id,
      teamId: teamMembers.teamId,
      userId: teamMembers.userId,
      joinedAt: teamMembers.joinedAt,
      user: users
    }).from(teamMembers).innerJoin(users, eq(teamMembers.userId, users.id)).where(eq(teamMembers.teamId, teamId));
  }
  async getUserTeams(userId) {
    return await db.select({
      id: teamMembers.id,
      teamId: teamMembers.teamId,
      userId: teamMembers.userId,
      joinedAt: teamMembers.joinedAt,
      team: teams
    }).from(teamMembers).innerJoin(teams, eq(teamMembers.teamId, teams.id)).where(eq(teamMembers.userId, userId));
  }
  // Submission methods
  async getSubmissionsByEvent(eventId) {
    return await db.select({
      id: submissions.id,
      title: submissions.title,
      description: submissions.description,
      githubUrl: submissions.githubUrl,
      videoUrl: submissions.videoUrl,
      track: submissions.track,
      tags: submissions.tags,
      teamId: submissions.teamId,
      eventId: submissions.eventId,
      submittedBy: submissions.submittedBy,
      aiScore: submissions.aiScore,
      createdAt: submissions.createdAt,
      team: teams,
      submitter: users
    }).from(submissions).leftJoin(teams, eq(submissions.teamId, teams.id)).innerJoin(users, eq(submissions.submittedBy, users.id)).where(eq(submissions.eventId, eventId)).orderBy(desc(submissions.createdAt));
  }
  async getSubmission(id) {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || void 0;
  }
  async createSubmission(submission) {
    const aiScore = this.calculateAIScore(submission);
    const submissionData = {
      ...submission,
      tags: submission.tags || [],
      aiScore
    };
    const [createdSubmission] = await db.insert(submissions).values([submissionData]).returning();
    return createdSubmission;
  }
  async updateSubmissionAIScore(id, aiScore) {
    await db.update(submissions).set({ aiScore }).where(eq(submissions.id, id));
  }
  // Score methods
  async getScoresBySubmission(submissionId) {
    return await db.select({
      id: scores.id,
      submissionId: scores.submissionId,
      judgeId: scores.judgeId,
      innovation: scores.innovation,
      technical: scores.technical,
      design: scores.design,
      impact: scores.impact,
      totalScore: scores.totalScore,
      feedback: scores.feedback,
      round: scores.round,
      createdAt: scores.createdAt,
      judge: users
    }).from(scores).innerJoin(users, eq(scores.judgeId, users.id)).where(eq(scores.submissionId, submissionId));
  }
  async createScore(score) {
    const totalScore = (score.innovation || 0) + (score.technical || 0) + (score.design || 0) + (score.impact || 0);
    const [createdScore] = await db.insert(scores).values({
      ...score,
      totalScore
    }).returning();
    return createdScore;
  }
  async getLeaderboard(eventId) {
    const result = await db.select({
      teamId: teams.id,
      teamName: teams.name,
      averageScore: sql2`AVG(${scores.totalScore})::float`.as("average_score")
    }).from(submissions).innerJoin(teams, eq(submissions.teamId, teams.id)).leftJoin(scores, eq(submissions.id, scores.submissionId)).where(eq(submissions.eventId, eventId)).groupBy(teams.id, teams.name).orderBy(desc(sql2`AVG(${scores.totalScore})`));
    return result.map((r) => ({
      teamId: r.teamId,
      teamName: r.teamName,
      averageScore: r.averageScore || 0
    }));
  }
  // Announcement methods
  async getAnnouncementsByEvent(eventId) {
    return await db.select({
      id: announcements.id,
      eventId: announcements.eventId,
      message: announcements.message,
      createdBy: announcements.createdBy,
      createdAt: announcements.createdAt,
      creator: users
    }).from(announcements).innerJoin(users, eq(announcements.createdBy, users.id)).where(eq(announcements.eventId, eventId)).orderBy(desc(announcements.createdAt));
  }
  async createAnnouncement(announcement) {
    const [createdAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return createdAnnouncement;
  }
  // Analytics methods
  async getEventAnalytics(eventId) {
    const [participantCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "participant"));
    const [teamCount] = await db.select({ count: count() }).from(teams).where(eq(teams.eventId, eventId));
    const [submissionCount] = await db.select({ count: count() }).from(submissions).where(eq(submissions.eventId, eventId));
    const [completedTimelines] = await db.select({ count: count() }).from(timelines).where(and(eq(timelines.eventId, eventId), eq(timelines.status, "completed")));
    const [totalTimelines] = await db.select({ count: count() }).from(timelines).where(eq(timelines.eventId, eventId));
    const completion = totalTimelines.count > 0 ? Math.round(completedTimelines.count / totalTimelines.count * 100) : 0;
    return {
      participants: participantCount.count,
      teams: teamCount.count,
      submissions: submissionCount.count,
      completion
    };
  }
  async getOrganizerEvents(organizerId) {
    return await db.select().from(events).where(eq(events.createdBy, organizerId));
  }
  async deleteEvent(eventId) {
    const result = await db.delete(events).where(eq(events.id, eventId));
    return (result.rowCount || 0) > 0;
  }
  async updateEventStatus(eventId, isActive) {
    const [updatedEvent] = await db.update(events).set({ isActive }).where(eq(events.id, eventId)).returning();
    return updatedEvent || void 0;
  }
  // Helper method to calculate AI score
  calculateAIScore(submission) {
    const rubricKeywords = {
      innovation: ["novel", "gamified", "3d", "metaverse", "unique", "ai"],
      functionality: ["upload", "submission", "team", "score", "judge", "realtime"],
      scalability: ["azure", "mongodb", "sql", "serverless", "cloud", "scale"],
      uiux: ["tailwind", "framer", "neon", "dark", "animation", "map"]
    };
    const text2 = `${submission.title} ${submission.description} ${submission.tags?.join(" ") || ""}`.toLowerCase();
    const buckets = Object.values(rubricKeywords).flat();
    let hits = 0;
    buckets.forEach((keyword) => {
      if (text2.includes(keyword)) hits += 1;
    });
    const base = Math.round(hits / buckets.length * 100);
    const boost = (submission.githubUrl ? 5 : 0) + (submission.videoUrl ? 5 : 0);
    return Math.min(100, base + boost);
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import { z } from "zod";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
var registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6),
  role: z.enum(["participant", "organizer", "judge"]).default("participant"),
  bio: z.string().optional(),
  skills: z.array(z.string()).default([])
});
var loginSchema = z.object({
  username: z.string(),
  password: z.string()
});
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "hacksphere-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  app2.post("/api/login", async (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      passport.authenticate("local", (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        req.login(user, (err2) => {
          if (err2) return next(err2);
          res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
init_schema();
import { z as z2 } from "zod";
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/events", async (req, res) => {
    try {
      const events2 = await storage.getEvents();
      res.json(events2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  app2.post("/api/events", requireRole(["organizer"]), async (req, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: req.user?.id
      });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  app2.get("/api/events/:eventId/timeline", async (req, res) => {
    try {
      const timelines2 = await storage.getTimelinesByEvent(req.params.eventId);
      res.json(timelines2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });
  app2.post("/api/events/:eventId/timeline", requireRole(["organizer"]), async (req, res) => {
    try {
      const timelineData = insertTimelineSchema.parse({
        ...req.body,
        eventId: req.params.eventId
      });
      const timeline = await storage.createTimeline(timelineData);
      res.status(201).json(timeline);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timeline" });
    }
  });
  app2.patch("/api/timeline/:id/status", requireRole(["organizer"]), async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "active", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const timeline = await storage.updateTimelineStatus(req.params.id, status);
      if (!timeline) {
        return res.status(404).json({ message: "Timeline not found" });
      }
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to update timeline" });
    }
  });
  app2.get("/api/events/:eventId/teams", async (req, res) => {
    try {
      const teams2 = await storage.getTeamsByEvent(req.params.eventId);
      res.json(teams2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });
  app2.post("/api/events/:eventId/teams", requireAuth, async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        leaderId: req.user?.id
      });
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });
  app2.get("/api/teams/:teamId/members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.teamId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });
  app2.post("/api/teams/:teamId/members", requireAuth, async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse({
        teamId: req.params.teamId,
        userId: req.body.userId || req.user?.id
      });
      const member = await storage.addTeamMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add team member" });
    }
  });
  app2.get("/api/users/:userId/teams", requireAuth, async (req, res) => {
    try {
      const teams2 = await storage.getUserTeams(req.params.userId);
      res.json(teams2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user teams" });
    }
  });
  app2.get("/api/events/:eventId/submissions", async (req, res) => {
    try {
      const submissions2 = await storage.getSubmissionsByEvent(req.params.eventId);
      res.json(submissions2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  app2.post("/api/events/:eventId/submissions", requireAuth, async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        submittedBy: req.user?.id
      });
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create submission" });
    }
  });
  app2.get("/api/submissions/:submissionId/scores", async (req, res) => {
    try {
      const scores2 = await storage.getScoresBySubmission(req.params.submissionId);
      res.json(scores2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });
  app2.post("/api/submissions/:submissionId/scores", requireRole(["judge"]), async (req, res) => {
    try {
      const scoreData = insertScoreSchema.parse({
        ...req.body,
        submissionId: req.params.submissionId,
        judgeId: req.user?.id
      });
      const score = await storage.createScore(scoreData);
      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create score" });
    }
  });
  app2.get("/api/events/:eventId/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(req.params.eventId);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/events/:eventId/announcements", async (req, res) => {
    try {
      const announcements2 = await storage.getAnnouncementsByEvent(req.params.eventId);
      res.json(announcements2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });
  app2.post("/api/events/:eventId/announcements", requireRole(["organizer"]), async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        createdBy: req.user?.id
      });
      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });
  app2.get("/api/events/:eventId/analytics", requireRole(["organizer"]), async (req, res) => {
    try {
      const analytics = await storage.getEventAnalytics(req.params.eventId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/organizers/:organizerId/events", requireRole(["organizer"]), async (req, res) => {
    try {
      const events2 = await storage.getOrganizerEvents(req.params.organizerId);
      res.json(events2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizer events" });
    }
  });
  app2.delete("/api/events/:eventId", requireRole(["organizer"]), async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.eventId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  app2.patch("/api/events/:eventId/status", requireRole(["organizer"]), async (req, res) => {
    try {
      const { isActive } = req.body;
      const event = await storage.updateEventStatus(req.params.eventId, isActive);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event status" });
    }
  });
  app2.get("/api/events/:eventId/available-users", requireAuth, async (req, res) => {
    try {
      const users2 = await storage.getEvents();
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available users" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/mongodb.ts
import mongoose from "mongoose";
var connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL || process.env.DATABASE_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL or DATABASE_URL must be set for MongoDB connection");
    }
    const options = {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 3e4,
      serverSelectionTimeoutMS: 5e3,
      socketTimeoutMS: 45e3
    };
    const connection = await mongoose.connect(mongoUrl, options);
    console.log(`\u2705 MongoDB connected successfully to: ${connection.connection.host}`);
    mongoose.connection.on("error", (error) => {
      console.error("\u274C MongoDB connection error:", error);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("\u26A0\uFE0F MongoDB disconnected");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("\u{1F504} MongoDB reconnected");
    });
    return connection;
  } catch (error) {
    console.error("\u274C MongoDB connection failed:", error);
    throw error;
  }
};

// shared/mongodb-schema.ts
import mongoose2, { Schema } from "mongoose";
import { z as z3 } from "zod";
var UserRole = ["participant", "organizer", "judge"];
var EventMode = ["online", "offline", "hybrid"];
var TimelineStatus = ["pending", "active", "completed"];
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bio: { type: String },
  avatar: { type: String },
  skills: { type: [String], default: [] },
  role: { type: String, enum: UserRole, default: "participant" },
  createdAt: { type: Date, default: Date.now }
});
var eventSchema = new Schema({
  title: { type: String, required: true },
  theme: { type: String },
  description: { type: String },
  mode: { type: String, enum: EventMode, default: "online" },
  tracks: { type: [String], default: [] },
  rules: { type: [String], default: [] },
  prizes: { type: [String], default: [] },
  sponsors: { type: [String], default: [] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});
var timelineSchema = new Schema({
  eventId: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: TimelineStatus, default: "pending" },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
var teamSchema = new Schema({
  name: { type: String, required: true },
  eventId: { type: String, required: true },
  leaderId: { type: String, required: true },
  memberIds: { type: [String], default: [] },
  maxMembers: { type: Number, default: 4 },
  createdAt: { type: Date, default: Date.now }
});
var submissionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  githubUrl: { type: String },
  videoUrl: { type: String },
  track: { type: String },
  tags: { type: [String], default: [] },
  teamId: { type: String },
  eventId: { type: String, required: true },
  submittedBy: { type: String, required: true },
  aiScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
var scoreSchema = new Schema({
  submissionId: { type: String, required: true },
  judgeId: { type: String, required: true },
  innovation: { type: Number, default: 0 },
  technical: { type: Number, default: 0 },
  design: { type: Number, default: 0 },
  impact: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  feedback: { type: String },
  round: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});
var announcementSchema = new Schema({
  eventId: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var User = mongoose2.model("User", userSchema);
var Event = mongoose2.model("Event", eventSchema);
var Timeline = mongoose2.model("Timeline", timelineSchema);
var Team = mongoose2.model("Team", teamSchema);
var Submission = mongoose2.model("Submission", submissionSchema);
var Score = mongoose2.model("Score", scoreSchema);
var Announcement = mongoose2.model("Announcement", announcementSchema);
var insertUserSchema2 = z3.object({
  username: z3.string().min(3).max(50),
  password: z3.string().min(6),
  email: z3.string().email(),
  name: z3.string().min(1).max(100),
  bio: z3.string().optional(),
  avatar: z3.string().optional(),
  skills: z3.array(z3.string()).default([]),
  role: z3.enum(["participant", "organizer", "judge"]).default("participant")
});
var insertEventSchema2 = z3.object({
  title: z3.string().min(1).max(200),
  theme: z3.string().optional(),
  description: z3.string().optional(),
  mode: z3.enum(["online", "offline", "hybrid"]).default("online"),
  tracks: z3.array(z3.string()).default([]),
  rules: z3.array(z3.string()).default([]),
  prizes: z3.array(z3.string()).default([]),
  sponsors: z3.array(z3.string()).default([]),
  startDate: z3.coerce.date(),
  endDate: z3.coerce.date(),
  createdBy: z3.string(),
  isActive: z3.boolean().default(true)
});
var insertTimelineSchema2 = z3.object({
  eventId: z3.string(),
  label: z3.string().min(1),
  description: z3.string().optional(),
  dueDate: z3.coerce.date(),
  status: z3.enum(["pending", "active", "completed"]).default("pending"),
  order: z3.number().int().min(0)
});
var insertTeamSchema2 = z3.object({
  name: z3.string().min(1).max(100),
  eventId: z3.string(),
  leaderId: z3.string(),
  maxMembers: z3.number().int().min(1).max(10).default(4)
});
var insertSubmissionSchema2 = z3.object({
  title: z3.string().min(1).max(200),
  description: z3.string().min(1),
  githubUrl: z3.string().url().optional(),
  videoUrl: z3.string().url().optional(),
  track: z3.string().optional(),
  tags: z3.array(z3.string()).default([]),
  teamId: z3.string().optional(),
  eventId: z3.string(),
  submittedBy: z3.string()
});
var insertScoreSchema2 = z3.object({
  submissionId: z3.string(),
  judgeId: z3.string(),
  innovation: z3.number().int().min(0).max(10).default(0),
  technical: z3.number().int().min(0).max(10).default(0),
  design: z3.number().int().min(0).max(10).default(0),
  impact: z3.number().int().min(0).max(10).default(0),
  totalScore: z3.number().int().min(0).max(40).default(0),
  feedback: z3.string().optional(),
  round: z3.number().int().min(1).default(1)
});
var insertAnnouncementSchema2 = z3.object({
  eventId: z3.string(),
  message: z3.string().min(1),
  createdBy: z3.string()
});

// server/mongodb-storage.ts
var MongoStorage = class {
  // User operations
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }
  async getUserById(id) {
    return await User.findById(id);
  }
  async getUserByUsername(username) {
    return await User.findOne({ username });
  }
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }
  async getAllUsers() {
    return await User.find({});
  }
  // Event operations
  async createEvent(eventData) {
    const event = new Event(eventData);
    return await event.save();
  }
  async getEventById(id) {
    return await Event.findById(id);
  }
  async getAllEvents() {
    return await Event.find({ isActive: true }).sort({ createdAt: -1 });
  }
  async getEventsByCreator(createdBy) {
    return await Event.find({ createdBy }).sort({ createdAt: -1 });
  }
  // Timeline operations
  async createTimeline(timelineData) {
    const timeline = new Timeline(timelineData);
    return await timeline.save();
  }
  async getTimelinesByEvent(eventId) {
    return await Timeline.find({ eventId }).sort({ order: 1 });
  }
  async updateTimelineStatus(id, status) {
    return await Timeline.findByIdAndUpdate(id, { status }, { new: true });
  }
  // Team operations
  async createTeam(teamData) {
    const team = new Team({
      ...teamData,
      memberIds: [teamData.leaderId]
      // Add leader as first member
    });
    return await team.save();
  }
  async getTeamById(id) {
    return await Team.findById(id);
  }
  async getTeamsByEvent(eventId) {
    return await Team.find({ eventId }).sort({ createdAt: -1 });
  }
  async addTeamMember(teamId, userId) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $addToSet: { memberIds: userId } },
      { new: true }
    );
  }
  async removeTeamMember(teamId, userId) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $pull: { memberIds: userId } },
      { new: true }
    );
  }
  async getUserTeamInEvent(userId, eventId) {
    return await Team.findOne({
      eventId,
      memberIds: userId
    });
  }
  // Submission operations
  async createSubmission(submissionData) {
    const submission = new Submission(submissionData);
    return await submission.save();
  }
  async getSubmissionById(id) {
    return await Submission.findById(id);
  }
  async getSubmissionsByEvent(eventId) {
    return await Submission.find({ eventId }).sort({ createdAt: -1 });
  }
  async getSubmissionsByTeam(teamId) {
    return await Submission.find({ teamId }).sort({ createdAt: -1 });
  }
  async updateSubmissionAIScore(id, aiScore) {
    return await Submission.findByIdAndUpdate(id, { aiScore }, { new: true });
  }
  // Score operations
  async createScore(scoreData) {
    const score = new Score(scoreData);
    return await score.save();
  }
  async getScoresBySubmission(submissionId) {
    return await Score.find({ submissionId });
  }
  async getScoresByJudge(judgeId) {
    return await Score.find({ judgeId }).sort({ createdAt: -1 });
  }
  async getJudgeScoreForSubmission(judgeId, submissionId) {
    return await Score.findOne({ judgeId, submissionId });
  }
  // Announcement operations
  async createAnnouncement(announcementData) {
    const announcement = new Announcement(announcementData);
    return await announcement.save();
  }
  async getAnnouncementsByEvent(eventId) {
    return await Announcement.find({ eventId }).sort({ createdAt: -1 });
  }
  // Leaderboard operations
  async getEventLeaderboard(eventId) {
    return await Submission.aggregate([
      { $match: { eventId } },
      {
        $lookup: {
          from: "scores",
          localField: "_id",
          foreignField: "submissionId",
          as: "scores"
        }
      },
      {
        $addFields: {
          averageScore: { $avg: "$scores.totalScore" },
          totalScores: { $size: "$scores" }
        }
      },
      { $sort: { averageScore: -1, aiScore: -1 } }
    ]);
  }
  // Search operations
  async searchEvents(query) {
    return await Event.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { theme: { $regex: query, $options: "i" } }
      ],
      isActive: true
    });
  }
  async searchSubmissions(eventId, query) {
    return await Submission.find({
      eventId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } }
      ]
    });
  }
};

// server/unified-db.ts
var isMongoDatabase = process.env.MONGODB_URL || process.env.DATABASE_URL && (process.env.DATABASE_URL.includes("mongodb://") || process.env.DATABASE_URL.includes("mongodb+srv://") || process.env.DATABASE_URL.includes("cosmos.azure.com"));
var storage2;
var initializeDatabase = async () => {
  if (isMongoDatabase) {
    console.log("\u{1F343} Attempting MongoDB connection...");
    try {
      await connectMongoDB();
      storage2 = new MongoStorage();
      console.log("\u2705 MongoDB storage initialized");
    } catch (error) {
      console.error("\u274C MongoDB connection failed, falling back to PostgreSQL:", error.message);
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      console.log("\u2705 PostgreSQL fallback ready");
    }
  } else {
    console.log("\u{1F418} Using PostgreSQL (existing setup)");
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    console.log("\u2705 PostgreSQL storage ready");
  }
};

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("\u274C Database initialization failed:", error);
    process.exit(1);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
