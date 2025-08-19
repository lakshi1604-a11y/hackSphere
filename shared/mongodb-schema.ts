import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// Enums for MongoDB
export const UserRole = ['participant', 'organizer', 'judge'] as const;
export const EventMode = ['online', 'offline', 'hybrid'] as const;
export const TimelineStatus = ['pending', 'active', 'completed'] as const;

export type UserRoleType = typeof UserRole[number];
export type EventModeType = typeof EventMode[number];
export type TimelineStatusType = typeof TimelineStatus[number];

// MongoDB Interfaces
export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  skills: string[];
  role: UserRoleType;
  createdAt: Date;
}

export interface IEvent extends Document {
  _id: string;
  title: string;
  theme?: string;
  description?: string;
  mode: EventModeType;
  tracks: string[];
  rules: string[];
  prizes: string[];
  sponsors: string[];
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface ITimeline extends Document {
  _id: string;
  eventId: string;
  label: string;
  description?: string;
  dueDate: Date;
  status: TimelineStatusType;
  order: number;
  createdAt: Date;
}

export interface ITeam extends Document {
  _id: string;
  name: string;
  eventId: string;
  leaderId: string;
  memberIds: string[];
  maxMembers: number;
  createdAt: Date;
}

export interface ISubmission extends Document {
  _id: string;
  title: string;
  description: string;
  githubUrl?: string;
  videoUrl?: string;
  track?: string;
  tags: string[];
  teamId?: string;
  eventId: string;
  submittedBy: string;
  aiScore: number;
  createdAt: Date;
}

export interface IScore extends Document {
  _id: string;
  submissionId: string;
  judgeId: string;
  innovation: number;
  technical: number;
  design: number;
  impact: number;
  totalScore: number;
  feedback?: string;
  round: number;
  createdAt: Date;
}

export interface IAnnouncement extends Document {
  _id: string;
  eventId: string;
  message: string;
  createdBy: string;
  createdAt: Date;
}

// MongoDB Schemas
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bio: { type: String },
  avatar: { type: String },
  skills: { type: [String], default: [] },
  role: { type: String, enum: UserRole, default: 'participant' },
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  theme: { type: String },
  description: { type: String },
  mode: { type: String, enum: EventMode, default: 'online' },
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

const timelineSchema = new Schema<ITimeline>({
  eventId: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: TimelineStatus, default: 'pending' },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  eventId: { type: String, required: true },
  leaderId: { type: String, required: true },
  memberIds: { type: [String], default: [] },
  maxMembers: { type: Number, default: 4 },
  createdAt: { type: Date, default: Date.now }
});

const submissionSchema = new Schema<ISubmission>({
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

const scoreSchema = new Schema<IScore>({
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

const announcementSchema = new Schema<IAnnouncement>({
  eventId: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// MongoDB Models
export const User = mongoose.model<IUser>('User', userSchema);
export const Event = mongoose.model<IEvent>('Event', eventSchema);
export const Timeline = mongoose.model<ITimeline>('Timeline', timelineSchema);
export const Team = mongoose.model<ITeam>('Team', teamSchema);
export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
export const Score = mongoose.model<IScore>('Score', scoreSchema);
export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);

// Validation Schemas for API
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  skills: z.array(z.string()).default([]),
  role: z.enum(['participant', 'organizer', 'judge']).default('participant')
});

export const insertEventSchema = z.object({
  title: z.string().min(1).max(200),
  theme: z.string().optional(),
  description: z.string().optional(),
  mode: z.enum(['online', 'offline', 'hybrid']).default('online'),
  tracks: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  prizes: z.array(z.string()).default([]),
  sponsors: z.array(z.string()).default([]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  createdBy: z.string(),
  isActive: z.boolean().default(true)
});

export const insertTimelineSchema = z.object({
  eventId: z.string(),
  label: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  status: z.enum(['pending', 'active', 'completed']).default('pending'),
  order: z.number().int().min(0)
});

export const insertTeamSchema = z.object({
  name: z.string().min(1).max(100),
  eventId: z.string(),
  leaderId: z.string(),
  maxMembers: z.number().int().min(1).max(10).default(4)
});

export const insertSubmissionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  githubUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  track: z.string().optional(),
  tags: z.array(z.string()).default([]),
  teamId: z.string().optional(),
  eventId: z.string(),
  submittedBy: z.string()
});

export const insertScoreSchema = z.object({
  submissionId: z.string(),
  judgeId: z.string(),
  innovation: z.number().int().min(0).max(10).default(0),
  technical: z.number().int().min(0).max(10).default(0),
  design: z.number().int().min(0).max(10).default(0),
  impact: z.number().int().min(0).max(10).default(0),
  totalScore: z.number().int().min(0).max(40).default(0),
  feedback: z.string().optional(),
  round: z.number().int().min(1).default(1)
});

export const insertAnnouncementSchema = z.object({
  eventId: z.string(),
  message: z.string().min(1),
  createdBy: z.string()
});

// Type exports for compatibility
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;