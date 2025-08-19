import { 
  users, events, timelines, teams, teamMembers, submissions, scores, announcements,
  type User, type InsertUser, type Event, type InsertEvent,
  type Timeline, type InsertTimeline, type Team, type InsertTeam,
  type TeamMember, type InsertTeamMember, type Submission, type InsertSubmission,
  type Score, type InsertScore, type Announcement, type InsertAnnouncement
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;

  // Timeline methods
  getTimelinesByEvent(eventId: string): Promise<Timeline[]>;
  createTimeline(timeline: InsertTimeline): Promise<Timeline>;
  updateTimelineStatus(id: string, status: 'pending' | 'active' | 'completed'): Promise<Timeline | undefined>;

  // Team methods
  getTeamsByEvent(eventId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;
  getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]>;
  getUserTeams(userId: string): Promise<(TeamMember & { team: Team })[]>;

  // Submission methods
  getSubmissionsByEvent(eventId: string): Promise<(Submission & { team: Team | null; submitter: User })[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionAIScore(id: string, aiScore: number): Promise<void>;

  // Score methods
  getScoresBySubmission(submissionId: string): Promise<(Score & { judge: User })[]>;
  createScore(score: InsertScore): Promise<Score>;
  getLeaderboard(eventId: string): Promise<{ teamId: string; teamName: string; averageScore: number }[]>;

  // Announcement methods
  getAnnouncementsByEvent(eventId: string): Promise<(Announcement & { creator: User })[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  // Analytics methods
  getEventAnalytics(eventId: string): Promise<{
    participants: number;
    teams: number;
    submissions: number;
    completion: number;
  }>;
  getOrganizerEvents(organizerId: string): Promise<Event[]>;
  deleteEvent(eventId: string): Promise<boolean>;
  updateEventStatus(eventId: string, isActive: boolean): Promise<Event | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      ...insertUser,
      skills: insertUser.skills || []
    };
    const [user] = await db.insert(users).values([userData]).returning();
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const updateData = { ...userUpdate };
    if (updateData.skills) {
      updateData.skills = Array.isArray(updateData.skills) ? updateData.skills : [];
    }
    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return updatedUser || undefined;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
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

  async updateEvent(id: string, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
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
    return updatedEvent || undefined;
  }

  // Timeline methods
  async getTimelinesByEvent(eventId: string): Promise<Timeline[]> {
    return await db.select().from(timelines).where(eq(timelines.eventId, eventId)).orderBy(timelines.order);
  }

  async createTimeline(timeline: InsertTimeline): Promise<Timeline> {
    const [createdTimeline] = await db.insert(timelines).values(timeline).returning();
    return createdTimeline;
  }

  async updateTimelineStatus(id: string, status: 'pending' | 'active' | 'completed'): Promise<Timeline | undefined> {
    const [updatedTimeline] = await db.update(timelines).set({ status }).where(eq(timelines.id, id)).returning();
    return updatedTimeline || undefined;
  }

  // Team methods
  async getTeamsByEvent(eventId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.eventId, eventId)).orderBy(desc(teams.createdAt));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [createdTeam] = await db.insert(teams).values(team).returning();
    // Automatically add the leader as a team member
    await db.insert(teamMembers).values({
      teamId: createdTeam.id,
      userId: createdTeam.leaderId,
    });
    return createdTeam;
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [createdMember] = await db.insert(teamMembers).values(teamMember).returning();
    return createdMember;
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await db.delete(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  }

  async getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]> {
    return await db.select({
      id: teamMembers.id,
      teamId: teamMembers.teamId,
      userId: teamMembers.userId,
      joinedAt: teamMembers.joinedAt,
      user: users,
    }).from(teamMembers).innerJoin(users, eq(teamMembers.userId, users.id)).where(eq(teamMembers.teamId, teamId));
  }

  async getUserTeams(userId: string): Promise<(TeamMember & { team: Team })[]> {
    return await db.select({
      id: teamMembers.id,
      teamId: teamMembers.teamId,
      userId: teamMembers.userId,
      joinedAt: teamMembers.joinedAt,
      team: teams,
    }).from(teamMembers).innerJoin(teams, eq(teamMembers.teamId, teams.id)).where(eq(teamMembers.userId, userId));
  }

  // Submission methods
  async getSubmissionsByEvent(eventId: string): Promise<(Submission & { team: Team | null; submitter: User })[]> {
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
      submitter: users,
    }).from(submissions)
      .leftJoin(teams, eq(submissions.teamId, teams.id))
      .innerJoin(users, eq(submissions.submittedBy, users.id))
      .where(eq(submissions.eventId, eventId))
      .orderBy(desc(submissions.createdAt));
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    // Calculate AI score
    const aiScore = this.calculateAIScore(submission);
    const submissionData = {
      ...submission,
      tags: submission.tags || [],
      aiScore,
    };
    const [createdSubmission] = await db.insert(submissions).values([submissionData]).returning();
    return createdSubmission;
  }

  async updateSubmissionAIScore(id: string, aiScore: number): Promise<void> {
    await db.update(submissions).set({ aiScore }).where(eq(submissions.id, id));
  }

  // Score methods
  async getScoresBySubmission(submissionId: string): Promise<(Score & { judge: User })[]> {
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
      judge: users,
    }).from(scores).innerJoin(users, eq(scores.judgeId, users.id)).where(eq(scores.submissionId, submissionId));
  }

  async createScore(score: InsertScore): Promise<Score> {
    const totalScore = (score.innovation || 0) + (score.technical || 0) + (score.design || 0) + (score.impact || 0);
    const [createdScore] = await db.insert(scores).values({
      ...score,
      totalScore,
    }).returning();
    return createdScore;
  }

  async getLeaderboard(eventId: string): Promise<{ teamId: string; teamName: string; averageScore: number }[]> {
    const result = await db.select({
      teamId: teams.id,
      teamName: teams.name,
      averageScore: sql<number>`AVG(${scores.totalScore})::float`.as('average_score'),
    }).from(submissions)
      .innerJoin(teams, eq(submissions.teamId, teams.id))
      .leftJoin(scores, eq(submissions.id, scores.submissionId))
      .where(eq(submissions.eventId, eventId))
      .groupBy(teams.id, teams.name)
      .orderBy(desc(sql`AVG(${scores.totalScore})`));
    
    return result.map(r => ({
      teamId: r.teamId,
      teamName: r.teamName,
      averageScore: r.averageScore || 0,
    }));
  }

  // Announcement methods
  async getAnnouncementsByEvent(eventId: string): Promise<(Announcement & { creator: User })[]> {
    return await db.select({
      id: announcements.id,
      eventId: announcements.eventId,
      message: announcements.message,
      createdBy: announcements.createdBy,
      createdAt: announcements.createdAt,
      creator: users,
    }).from(announcements)
      .innerJoin(users, eq(announcements.createdBy, users.id))
      .where(eq(announcements.eventId, eventId))
      .orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [createdAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return createdAnnouncement;
  }

  // Analytics methods
  async getEventAnalytics(eventId: string): Promise<{
    participants: number;
    teams: number;
    submissions: number;
    completion: number;
  }> {
    const [participantCount] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, "participant"));

    const [teamCount] = await db.select({ count: count() })
      .from(teams)
      .where(eq(teams.eventId, eventId));

    const [submissionCount] = await db.select({ count: count() })
      .from(submissions)
      .where(eq(submissions.eventId, eventId));

    const [completedTimelines] = await db.select({ count: count() })
      .from(timelines)
      .where(and(eq(timelines.eventId, eventId), eq(timelines.status, "completed")));

    const [totalTimelines] = await db.select({ count: count() })
      .from(timelines)
      .where(eq(timelines.eventId, eventId));

    const completion = totalTimelines.count > 0 
      ? Math.round((completedTimelines.count / totalTimelines.count) * 100)
      : 0;

    return {
      participants: participantCount.count,
      teams: teamCount.count,
      submissions: submissionCount.count,
      completion
    };
  }

  async getOrganizerEvents(organizerId: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.createdBy, organizerId));
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, eventId));
    return (result.rowCount || 0) > 0;
  }

  async updateEventStatus(eventId: string, isActive: boolean): Promise<Event | undefined> {
    const [updatedEvent] = await db.update(events)
      .set({ isActive })
      .where(eq(events.id, eventId))
      .returning();
    return updatedEvent || undefined;
  }

  // Helper method to calculate AI score
  private calculateAIScore(submission: InsertSubmission): number {
    const rubricKeywords = {
      innovation: ["novel", "gamified", "3d", "metaverse", "unique", "ai"],
      functionality: ["upload", "submission", "team", "score", "judge", "realtime"],
      scalability: ["azure", "mongodb", "sql", "serverless", "cloud", "scale"],
      uiux: ["tailwind", "framer", "neon", "dark", "animation", "map"],
    };

    const text = `${submission.title} ${submission.description} ${submission.tags?.join(" ") || ""}`.toLowerCase();
    const buckets = Object.values(rubricKeywords).flat();
    let hits = 0;
    
    buckets.forEach((keyword) => {
      if (text.includes(keyword)) hits += 1;
    });
    
    const base = Math.round((hits / buckets.length) * 100);
    const boost = (submission.githubUrl ? 5 : 0) + (submission.videoUrl ? 5 : 0);
    return Math.min(100, base + boost);
  }
}

export const storage = new DatabaseStorage();
