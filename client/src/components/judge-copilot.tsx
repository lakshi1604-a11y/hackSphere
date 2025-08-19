import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Submission, Team, User, Score } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Brain, Star, TrendingUp, Lightbulb, Code, Palette, Target } from "lucide-react";

interface JudgeCopilotProps {
  eventId: string;
}

type SubmissionWithDetails = Submission & { team: Team | null; submitter: User };
type ScoreWithJudge = Score & { judge: User };

export default function JudgeCopilot({ eventId }: JudgeCopilotProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [scores, setScores] = useState({
    innovation: 0,
    technical: 0,
    design: 0,
    impact: 0,
  });
  const [feedback, setFeedback] = useState("");

  const { data: submissions = [], isLoading: loadingSubmissions } = useQuery<SubmissionWithDetails[]>({
    queryKey: ["/api/events", eventId, "submissions"],
    enabled: !!eventId,
  });

  const { data: submissionScores = [], isLoading: loadingScores } = useQuery<ScoreWithJudge[]>({
    queryKey: ["/api/submissions", selectedSubmission?.id, "scores"],
    enabled: !!selectedSubmission?.id,
  });

  const createScoreMutation = useMutation({
    mutationFn: async (scoreData: typeof scores & { feedback: string }) => {
      if (!selectedSubmission) throw new Error("No submission selected");
      const res = await apiRequest("POST", `/api/submissions/${selectedSubmission.id}/scores`, {
        ...scoreData,
        round: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions", selectedSubmission?.id, "scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "leaderboard"] });
      setScores({ innovation: 0, technical: 0, design: 0, impact: 0 });
      setFeedback("");
      toast({
        title: "Score submitted",
        description: "Your evaluation has been recorded!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit score",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitScore = () => {
    const totalScore = scores.innovation + scores.technical + scores.design + scores.impact;
    if (totalScore === 0) {
      toast({
        title: "Invalid score",
        description: "Please provide scores for at least one category",
        variant: "destructive",
      });
      return;
    }
    createScoreMutation.mutate({ ...scores, feedback });
  };

  const getAIInsights = (submission: SubmissionWithDetails) => {
    const score = submission.aiScore || 0;
    const insights = [];

    if (score >= 80) {
      insights.push("Strong technical implementation with modern stack");
    } else if (score >= 60) {
      insights.push("Good foundation with room for enhancement");
    } else {
      insights.push("Consider evaluating core functionality");
    }

    if (submission.githubUrl && submission.videoUrl) {
      insights.push("Complete submission with both code and demo");
    } else if (submission.githubUrl) {
      insights.push("Code available for review");
    } else if (submission.videoUrl) {
      insights.push("Demo video available");
    }

    return insights.join(". ");
  };

  const categoryIcons = {
    innovation: <Lightbulb className="w-4 h-4" />,
    technical: <Code className="w-4 h-4" />,
    design: <Palette className="w-4 h-4" />,
    impact: <Target className="w-4 h-4" />,
  };

  const categoryColors = {
    innovation: "fuchsia",
    technical: "emerald",
    design: "indigo",
    impact: "orange",
  };

  if (loadingSubmissions) {
    return (
      <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48"></div>
          <div className="p-4 bg-slate-800/50 rounded-xl space-y-3">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glassmorphism bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
        <Bot className="text-indigo-400" />
        Judge Copilot
        <Badge className="bg-indigo-700/30 text-indigo-300 border-indigo-700/40">AI-Powered</Badge>
      </h2>

      {/* Submission Selector */}
      <div className="mb-6">
        <label className="block text-slate-300 text-sm mb-2">Select Submission to Evaluate</label>
        <select
          value={selectedSubmission?.id || ""}
          onChange={(e) => {
            const submission = submissions.find(s => s.id === e.target.value);
            setSelectedSubmission(submission || null);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
          data-testid="select-submission"
        >
          <option value="">Choose a submission...</option>
          {submissions.map((submission) => (
            <option key={submission.id} value={submission.id}>
              {submission.title} - {submission.team?.name || submission.submitter.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubmission && (
        <div className="space-y-6">
          {/* AI First Impression */}
          <Card className="bg-indigo-900/30 border-indigo-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-indigo-300">
                <Brain className="w-5 h-5" />
                AI First Impression
                <Badge className="bg-indigo-600/20 text-indigo-400">
                  Score: {selectedSubmission.aiScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    {categoryIcons.innovation}
                    Innovation Indicators
                  </span>
                  <Progress 
                    value={Math.min((selectedSubmission.aiScore || 0) * 0.8, 100)} 
                    className="w-20 h-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    {categoryIcons.technical}
                    Technical Depth
                  </span>
                  <Progress 
                    value={Math.min((selectedSubmission.aiScore || 0) * 1.1, 100)} 
                    className="w-20 h-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    {categoryIcons.design}
                    Presentation Quality
                  </span>
                  <Progress 
                    value={Math.min((selectedSubmission.aiScore || 0) * 0.9, 100)} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-300 text-sm">
                  <strong className="text-indigo-400">AI Insight:</strong> {getAIInsights(selectedSubmission)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Scoring */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Star className="w-5 h-5 text-fuchsia-400" />
              Your Evaluation
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(scores).map(([category, value]) => (
                <div key={category} className="space-y-2">
                  <label className="block text-slate-300 text-sm capitalize flex items-center gap-2">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    {category} (0-25)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="25"
                    value={value}
                    onChange={(e) => setScores({ 
                      ...scores, 
                      [category]: Math.min(25, Math.max(0, Number(e.target.value))) 
                    })}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                    data-testid={`input-score-${category}`}
                  />
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all bg-${categoryColors[category as keyof typeof categoryColors]}-500`}
                      style={{ width: `${(value / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl font-bold text-fuchsia-400">
                {scores.innovation + scores.technical + scores.design + scores.impact}/100
              </div>
              <div className="text-slate-400 text-sm">Total Score</div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-slate-300 text-sm">Detailed Feedback</label>
              <Textarea
                placeholder="Provide constructive feedback to help the team improve..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100 min-h-[100px]"
                data-testid="textarea-feedback"
              />
            </div>
            
            <Button
              onClick={handleSubmitScore}
              disabled={createScoreMutation.isPending}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 font-semibold py-3 hover-glow"
              data-testid="button-submit-score"
            >
              {createScoreMutation.isPending ? "Submitting Score..." : "Submit Evaluation"}
            </Button>
          </div>

          {/* Previous Scores */}
          {submissionScores.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-200 text-sm">Previous Evaluations</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {submissionScores.map((score) => (
                  <div key={score.id} className="p-2 bg-slate-800/50 rounded-lg text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">{score.judge.name}</span>
                      <span className="text-fuchsia-400 font-semibold">{score.totalScore}/100</span>
                    </div>
                    {score.feedback && (
                      <p className="text-slate-400 text-xs mt-1">{score.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {submissions.length === 0 && (
        <div className="text-center py-8">
          <Bot className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No submissions to evaluate yet</p>
          <p className="text-slate-500 text-sm mt-1">Check back when teams start submitting projects</p>
        </div>
      )}
    </section>
  );
}
