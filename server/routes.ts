import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertEventSchema, insertTimelineSchema, insertTeamSchema, 
  insertSubmissionSchema, insertScoreSchema, insertAnnouncementSchema,
  insertTeamMemberSchema
} from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
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

  app.post("/api/events", requireRole(["organizer"]), async (req, res) => {
    try {
      // Convert ISO date strings to Date objects for validation
      const eventData = insertEventSchema.parse({
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        createdBy: req.user?.id,
      });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Timeline routes
  app.get("/api/events/:eventId/timeline", async (req, res) => {
    try {
      const timelines = await storage.getTimelinesByEvent(req.params.eventId);
      res.json(timelines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.post("/api/events/:eventId/timeline", requireRole(["organizer"]), async (req, res) => {
    try {
      // Convert ISO date strings to Date objects for validation
      const timelineData = insertTimelineSchema.parse({
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        eventId: req.params.eventId,
      });
      const timeline = await storage.createTimeline(timelineData);
      res.status(201).json(timeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timeline" });
    }
  });

  app.patch("/api/timeline/:id/status", requireRole(["organizer"]), async (req, res) => {
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

  // Team routes
  app.get("/api/events/:eventId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsByEvent(req.params.eventId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post("/api/events/:eventId/teams", requireAuth, async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        leaderId: req.user?.id,
      });
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.get("/api/teams/:teamId/members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.teamId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/teams/:teamId/members", requireAuth, async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse({
        teamId: req.params.teamId,
        userId: req.body.userId || req.user?.id,
      });
      const member = await storage.addTeamMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  app.get("/api/users/:userId/teams", requireAuth, async (req, res) => {
    try {
      const teams = await storage.getUserTeams(req.params.userId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user teams" });
    }
  });

  // Submission routes
  app.get("/api/events/:eventId/submissions", async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByEvent(req.params.eventId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/events/:eventId/submissions", requireAuth, async (req, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        submittedBy: req.user?.id,
      });
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Scoring routes
  app.get("/api/submissions/:submissionId/scores", async (req, res) => {
    try {
      const scores = await storage.getScoresBySubmission(req.params.submissionId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.post("/api/submissions/:submissionId/scores", requireRole(["judge"]), async (req, res) => {
    try {
      const scoreData = insertScoreSchema.parse({
        ...req.body,
        submissionId: req.params.submissionId,
        judgeId: req.user?.id,
      });
      const score = await storage.createScore(scoreData);
      res.status(201).json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create score" });
    }
  });

  app.get("/api/events/:eventId/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(req.params.eventId);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Announcement routes
  app.get("/api/events/:eventId/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncementsByEvent(req.params.eventId);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/events/:eventId/announcements", requireRole(["organizer"]), async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        createdBy: req.user?.id,
      });
      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Analytics endpoints for organizers
  app.get("/api/events/:eventId/analytics", requireRole(["organizer"]), async (req, res) => {
    try {
      const analytics = await storage.getEventAnalytics(req.params.eventId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/organizers/:organizerId/events", requireRole(["organizer"]), async (req, res) => {
    try {
      const events = await storage.getOrganizerEvents(req.params.organizerId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizer events" });
    }
  });

  app.delete("/api/events/:eventId", requireRole(["organizer"]), async (req, res) => {
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

  app.patch("/api/events/:eventId/status", requireRole(["organizer"]), async (req, res) => {
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

  // Get available users for team matching (exclude current user and already teamed users)
  app.get("/api/events/:eventId/available-users", requireAuth, async (req, res) => {
    try {
      const { eventId } = req.params;
      const currentUserId = req.user.id;
      
      const availableUsers = await storage.getAvailableUsers(eventId, currentUserId);
      res.json(availableUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
