import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Submission, Team, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Plus, Github, Play, Heart, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface SubmissionsFeedProps {
  eventId: string;
}

type SubmissionWithDetails = Submission & { team: Team | null; submitter: User };

export default function SubmissionsFeed({ eventId }: SubmissionsFeedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    title: "",
    description: "",
    githubUrl: "",
    videoUrl: "",
    track: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const { data: submissions = [], isLoading } = useQuery<SubmissionWithDetails[]>({
    queryKey: ["/api/events", eventId, "submissions"],
    enabled: !!eventId,
  });

  const { data: userTeams = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "teams"],
    enabled: !!user?.id,
  });

  const createSubmissionMutation = useMutation({
    mutationFn: async (data: typeof submissionData) => {
      const teamId = userTeams[0]?.team?.id || null;
      const res = await apiRequest("POST", `/api/events/${eventId}/submissions`, {
        ...data,
        teamId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "submissions"] });
      setSubmissionData({
        title: "",
        description: "",
        githubUrl: "",
        videoUrl: "",
        track: "",
        tags: [],
      });
      setShowSubmissionForm(false);
      toast({
        title: "Success",
        description: "Project submitted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionData.title.trim() || !submissionData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }
    createSubmissionMutation.mutate(submissionData);
  };

  const addTag = () => {
    if (tagInput.trim() && !submissionData.tags.includes(tagInput.trim())) {
      setSubmissionData({
        ...submissionData,
        tags: [...submissionData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setSubmissionData({
      ...submissionData,
      tags: submissionData.tags.filter(t => t !== tag),
    });
  };

  const tracks = ["Core Platform", "AI Plagiarism", "Gamification", "UI/UX Design", "Mobile Development"];

  if (isLoading) {
    return (
      <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48 mb-6"></div>
          {[1, 2].map(i => (
            <div key={i} className="p-4 bg-slate-800/50 rounded-xl space-y-3">
              <div className="h-5 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
          <Rocket className="text-fuchsia-400" />
          Project Submissions
        </h2>
        <Button
          onClick={() => setShowSubmissionForm(!showSubmissionForm)}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold hover-glow"
          data-testid="button-toggle-submission-form"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit Project
          {showSubmissionForm ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      <AnimatePresence>
        {showSubmissionForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-200 mb-4">Submit Your Project</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Project Title"
                      value={submissionData.title}
                      onChange={(e) => setSubmissionData({ ...submissionData, title: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-slate-100"
                      data-testid="input-submission-title"
                      required
                    />
                    <Select
                      value={submissionData.track}
                      onValueChange={(value) => setSubmissionData({ ...submissionData, track: value })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100" data-testid="select-submission-track">
                        <SelectValue placeholder="Select Track" />
                      </SelectTrigger>
                      <SelectContent>
                        {tracks.map((track) => (
                          <SelectItem key={track} value={track}>{track}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    placeholder="Project Description - Tell us what makes your project special!"
                    value={submissionData.description}
                    onChange={(e) => setSubmissionData({ ...submissionData, description: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-slate-100 min-h-[100px]"
                    data-testid="textarea-submission-description"
                    required
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="url"
                      placeholder="GitHub Repository URL (optional)"
                      value={submissionData.githubUrl}
                      onChange={(e) => setSubmissionData({ ...submissionData, githubUrl: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-slate-100"
                      data-testid="input-submission-github"
                    />
                    <Input
                      type="url"
                      placeholder="Demo Video URL (optional)"
                      value={submissionData.videoUrl}
                      onChange={(e) => setSubmissionData({ ...submissionData, videoUrl: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-slate-100"
                      data-testid="input-submission-video"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tags (e.g., React, Python, AI)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="bg-slate-900 border-slate-700 text-slate-100"
                        data-testid="input-submission-tag"
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                        data-testid="button-add-tag"
                      >
                        Add Tag
                      </Button>
                    </div>
                    {submissionData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {submissionData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-fuchsia-700/30 text-fuchsia-300 border-fuchsia-700/40"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-fuchsia-400 hover:text-fuchsia-300"
                              data-testid={`button-remove-tag-${tag}`}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSubmissionForm(false)}
                      className="border-slate-600 text-slate-300"
                      data-testid="button-cancel-submission"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createSubmissionMutation.isPending}
                      className="bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold"
                      data-testid="button-submit-project"
                    >
                      {createSubmissionMutation.isPending ? "Submitting..." : "Submit Project"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg mb-2">No submissions yet</p>
            <p className="text-slate-500">Be the first to showcase your project! 🚀</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <motion.div
              key={submission.id}
              whileHover={{ y: -2 }}
              className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-fuchsia-700/50 transition-all"
              data-testid={`submission-card-${submission.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-200 mb-1">{submission.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    {submission.team && (
                      <span>
                        Team: <span className="text-fuchsia-400">{submission.team.name}</span>
                      </span>
                    )}
                    <span>
                      By: <span className="text-slate-300">{submission.submitter.name}</span>
                    </span>
                    {submission.track && (
                      <span>
                        Track: <span className="text-emerald-400">{submission.track}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-700/30 text-emerald-300 border-emerald-700/40">
                    AI Score: {submission.aiScore}/100
                  </Badge>
                </div>
              </div>

              <p className="text-slate-300 mb-4 leading-relaxed">{submission.description}</p>

              {submission.tags && submission.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {submission.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-fuchsia-700/20 text-fuchsia-300 border-fuchsia-700/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {submission.githubUrl && (
                    <a
                      href={submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-300 hover:text-fuchsia-400 transition-colors"
                      data-testid={`link-github-${submission.id}`}
                    >
                      <Github className="w-4 h-4" />
                      <span>Repository</span>
                    </a>
                  )}
                  {submission.videoUrl && (
                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-300 hover:text-fuchsia-400 transition-colors"
                      data-testid={`link-video-${submission.id}`}
                    >
                      <Play className="w-4 h-4" />
                      <span>Demo Video</span>
                    </a>
                  )}
                </div>
                <button className="flex items-center gap-2 text-slate-300 hover:text-red-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>0</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
