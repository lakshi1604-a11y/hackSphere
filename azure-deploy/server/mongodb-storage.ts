import { 
  User, Event, Timeline, Team, Submission, Score, Announcement,
  IUser, IEvent, ITimeline, ITeam, ISubmission, IScore, IAnnouncement,
  InsertUser, InsertEvent, InsertTimeline, InsertTeam, 
  InsertSubmission, InsertScore, InsertAnnouncement
} from '@shared/mongodb-schema';

export class MongoStorage {
  // User operations
  async createUser(userData: InsertUser) {
    const user = new User(userData);
    return await user.save();
  }

  async getUserById(id: string) {
    return await User.findById(id);
  }

  async getUserByUsername(username: string) {
    return await User.findOne({ username });
  }

  async getUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async getAllUsers() {
    return await User.find({});
  }

  // Event operations
  async createEvent(eventData: InsertEvent) {
    const event = new Event(eventData);
    return await event.save();
  }

  async getEventById(id: string) {
    return await Event.findById(id);
  }

  async getAllEvents() {
    return await Event.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async getEventsByCreator(createdBy: string) {
    return await Event.find({ createdBy }).sort({ createdAt: -1 });
  }

  // Timeline operations
  async createTimeline(timelineData: InsertTimeline) {
    const timeline = new Timeline(timelineData);
    return await timeline.save();
  }

  async getTimelinesByEvent(eventId: string) {
    return await Timeline.find({ eventId }).sort({ order: 1 });
  }

  async updateTimelineStatus(id: string, status: 'pending' | 'active' | 'completed') {
    return await Timeline.findByIdAndUpdate(id, { status }, { new: true });
  }

  // Team operations
  async createTeam(teamData: InsertTeam) {
    const team = new Team({
      ...teamData,
      memberIds: [teamData.leaderId] // Add leader as first member
    });
    return await team.save();
  }

  async getTeamById(id: string) {
    return await Team.findById(id);
  }

  async getTeamsByEvent(eventId: string) {
    return await Team.find({ eventId }).sort({ createdAt: -1 });
  }

  async addTeamMember(teamId: string, userId: string) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $addToSet: { memberIds: userId } },
      { new: true }
    );
  }

  async removeTeamMember(teamId: string, userId: string) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $pull: { memberIds: userId } },
      { new: true }
    );
  }

  async getUserTeamInEvent(userId: string, eventId: string) {
    return await Team.findOne({
      eventId,
      memberIds: userId
    });
  }

  // Submission operations
  async createSubmission(submissionData: InsertSubmission) {
    const submission = new Submission(submissionData);
    return await submission.save();
  }

  async getSubmissionById(id: string) {
    return await Submission.findById(id);
  }

  async getSubmissionsByEvent(eventId: string) {
    return await Submission.find({ eventId }).sort({ createdAt: -1 });
  }

  async getSubmissionsByTeam(teamId: string) {
    return await Submission.find({ teamId }).sort({ createdAt: -1 });
  }

  async updateSubmissionAIScore(id: string, aiScore: number) {
    return await Submission.findByIdAndUpdate(id, { aiScore }, { new: true });
  }

  // Score operations
  async createScore(scoreData: InsertScore) {
    const score = new Score(scoreData);
    return await score.save();
  }

  async getScoresBySubmission(submissionId: string) {
    return await Score.find({ submissionId });
  }

  async getScoresByJudge(judgeId: string) {
    return await Score.find({ judgeId }).sort({ createdAt: -1 });
  }

  async getJudgeScoreForSubmission(judgeId: string, submissionId: string) {
    return await Score.findOne({ judgeId, submissionId });
  }

  // Announcement operations
  async createAnnouncement(announcementData: InsertAnnouncement) {
    const announcement = new Announcement(announcementData);
    return await announcement.save();
  }

  async getAnnouncementsByEvent(eventId: string) {
    return await Announcement.find({ eventId }).sort({ createdAt: -1 });
  }

  // Leaderboard operations
  async getEventLeaderboard(eventId: string) {
    return await Submission.aggregate([
      { $match: { eventId } },
      {
        $lookup: {
          from: 'scores',
          localField: '_id',
          foreignField: 'submissionId',
          as: 'scores'
        }
      },
      {
        $addFields: {
          averageScore: { $avg: '$scores.totalScore' },
          totalScores: { $size: '$scores' }
        }
      },
      { $sort: { averageScore: -1, aiScore: -1 } }
    ]);
  }

  // Search operations
  async searchEvents(query: string) {
    return await Event.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { theme: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    });
  }

  async searchSubmissions(eventId: string, query: string) {
    return await Submission.find({
      eventId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    });
  }
}