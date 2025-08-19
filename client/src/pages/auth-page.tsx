import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Users, Trophy, Gavel, Sparkles } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    role: "participant" as "participant" | "organizer" | "judge",
    bio: "",
    skills: [] as string[],
  });
  
  const [skillInput, setSkillInput] = useState("");

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  const addSkill = () => {
    if (skillInput.trim() && !registerData.skills.includes(skillInput.trim())) {
      setRegisterData({
        ...registerData,
        skills: [...registerData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setRegisterData({
      ...registerData,
      skills: registerData.skills.filter(s => s !== skill),
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-inter">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-600/20 blur-3xl rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-600/10 blur-3xl rounded-full animate-float"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400 mb-6">
                Welcome to HackSphere
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-lg">
                The metaverse-inspired hackathon platform that revolutionizes how teams form, compete, and innovate together.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 glassmorphism bg-slate-900/40 border border-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-fuchsia-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">HackMatch Team Formation</h3>
                  <p className="text-slate-400 text-sm">Swipe-based team matching with skill compatibility</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 glassmorphism bg-slate-900/40 border border-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI-Powered Judge Copilot</h3>
                  <p className="text-slate-400 text-sm">Intelligent first-impression scoring and insights</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 glassmorphism bg-slate-900/40 border border-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Live Leaderboards & Analytics</h3>
                  <p className="text-slate-400 text-sm">Real-time competition tracking and insights</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 glassmorphism bg-slate-900/40 border border-slate-800 rounded-2xl">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Interactive Timeline Maps</h3>
                  <p className="text-slate-400 text-sm">Visual progress tracking with milestone management</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="glassmorphism bg-slate-900/60 border-slate-800 neon-border">
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold text-center text-white">
                  {isLogin ? "Sign In" : "Join HackSphere"}
                </CardTitle>
                <CardDescription className="text-center text-slate-400">
                  {isLogin ? "Welcome back to the metaverse" : "Start your hackathon journey"}
                </CardDescription>
                
                {/* Toggle Buttons */}
                <div className="flex bg-slate-800/50 p-1 rounded-xl">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                      isLogin 
                        ? "bg-fuchsia-600 text-white" 
                        : "text-slate-400 hover:text-white"
                    }`}
                    data-testid="button-switch-login"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                      !isLogin 
                        ? "bg-fuchsia-600 text-white" 
                        : "text-slate-400 hover:text-white"
                    }`}
                    data-testid="button-switch-register"
                  >
                    Register
                  </button>
                </div>
              </CardHeader>

              <CardContent>
                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-slate-300">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        data-testid="input-username"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-300">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white pr-10"
                          data-testid="input-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold py-2 hover-glow"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name" className="text-slate-300">Full Name</Label>
                        <Input
                          id="reg-name"
                          type="text"
                          placeholder="Your full name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white"
                          data-testid="input-name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-slate-300">Username</Label>
                        <Input
                          id="reg-username"
                          type="text"
                          placeholder="Choose username"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white"
                          data-testid="input-reg-username"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-slate-300">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                        data-testid="input-email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-slate-300">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password (min 6 chars)"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white pr-10"
                          data-testid="input-reg-password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                          data-testid="button-reg-toggle-password"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-slate-300">Role</Label>
                      <Select 
                        value={registerData.role} 
                        onValueChange={(value: "participant" | "organizer" | "judge") => 
                          setRegisterData({ ...registerData, role: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white" data-testid="select-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participant">Participant</SelectItem>
                          <SelectItem value="organizer">Organizer</SelectItem>
                          <SelectItem value="judge">Judge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-300">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={registerData.bio}
                        onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
                        data-testid="input-bio"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Skills (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add a skill (e.g., React, Python)"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="bg-slate-900 border-slate-700 text-white"
                          data-testid="input-skill"
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          className="bg-slate-700 hover:bg-slate-600 text-white"
                          data-testid="button-add-skill"
                        >
                          Add
                        </Button>
                      </div>
                      {registerData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {registerData.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="bg-fuchsia-700/30 text-fuchsia-300 border-fuchsia-700/40"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-fuchsia-400 hover:text-fuchsia-300"
                                data-testid={`button-remove-skill-${skill}`}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold py-2 hover-glow"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? "Creating account..." : "Join HackSphere"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
