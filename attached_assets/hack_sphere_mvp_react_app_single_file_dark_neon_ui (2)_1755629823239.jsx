import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// HackSphere – Metaverse-like Hackathon MVP (Single File)
// - Dark neon UI, role-based dashboards (Organizer/Participant/Judge)
// - Event creation + timeline map
// - Teaming via HackMatch (swipe)
// - Project submissions + live feed
// - Judge Copilot (heuristic "AI" first-impression score) + scoring
// - Announcements (global) + Leaderboard
// - LocalStorage persistence (no backend needed for demo)
// ============================================================

// Tailwind is assumed available by the canvas runtime.
// If running locally, ensure Tailwind is set up or replace classes with CSS.

// ------- Utilities & Local Storage Helpers -------
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const uid = () => Math.random().toString(36).slice(2, 10);

const nowISO = () => new Date().toISOString();

// ------- Dummy Seed Data (first load only) -------
const seedIfEmpty = () => {
  const seeded = store.get("__seeded__", false);
  if (seeded) return;
  const users = [
    {
      id: "user-1",
      name: "Lakshmi",
      skills: ["React", "UI/UX", "Arduino"],
      bio: "Frontend wizard + IoT tinkerer",
      avatar: "🪄",
    },
    {
      id: "user-2",
      name: "Amrutha",
      skills: ["Python", "ML", "NLP"],
      bio: "ML generalist who ships fast",
      avatar: "🤖",
    },
    {
      id: "user-3",
      name: "Himashi",
      skills: ["Node", "SQL", "DevOps"],
      bio: "Loves scalable backends",
      avatar: "🛠️",
    },
    {
      id: "user-4",
      name: "Janis",
      skills: ["Figma", "3D", "Three.js"],
      bio: "Design + 3D micro-interactions",
      avatar: "🎨",
    },
    {
      id: "user-5",
      name: "Arjun",
      skills: ["Java", "Spring Boot", "APIs"],
      bio: "Enterprise backend architect",
      avatar: "☕",
    },
    {
      id: "user-6",
      name: "Meera",
      skills: ["Vue.js", "Tailwind", "Accessibility"],
      bio: "Clean UI & inclusive design advocate",
      avatar: "🌸",
    },
    {
      id: "user-7",
      name: "Karthik",
      skills: ["C++", "Rust", "Game Dev"],
      bio: "Performance freak, builds engines from scratch",
      avatar: "🎮",
    },
    {
      id: "user-8",
      name: "Sofia",
      skills: ["Data Science", "Pandas", "Visualization"],
      bio: "Turns data into stories",
      avatar: "📊",
    },
    {
      id: "user9",
      name: "Ravi",
      skills: ["Go", "Microservices", "Kubernetes"],
      bio: "Cloud-native systems thinker",
      avatar: "☁️",
    },
    {
      id: "user-10",
      name: "Ananya",
      skills: ["Cybersecurity", "Ethical Hacking", "Networking"],
      bio: "Breaks systems to secure them",
      avatar: "🕵️‍♀️",
    },
    {
      id: "user-11",
      name: "Leo",
      skills: ["iOS", "SwiftUI", "ARKit"],
      bio: "Builds future-ready mobile apps",
      avatar: "📱",
    },
    {
      id: "user-12",
      name: "Priya",
      skills: ["Django", "REST", "Postgres"],
      bio: "Fast backend prototyper",
      avatar: "⚡",
    },
    {
      id: "user-13",
      name: "Mikhail",
      skills: ["Blockchain", "Solidity", "Web3"],
      bio: "Crypto-enthusiast & smart contract dev",
      avatar: "⛓️",
    },
    {
      id: "user-14",
      name: "Sara",
      skills: ["Content Strategy", "Marketing", "SEO"],
      bio: "Bridges tech with storytelling",
      avatar: "📢",
    },
    {
      id: "user-15",
      name: "Omar",
      skills: ["Unity", "C#", "VR/AR"],
      bio: "Immersive experiences creator",
      avatar: "🕶️",
    },
    {
      id: "user-16",
      name: "Zara",
      skills: ["R", "Statistics", "ML Ops"],
      bio: "Research-driven, production-minded",
      avatar: "📐",
    },
    {
      id: "user-17",
      name: "Daniel",
      skills: ["PHP", "Laravel", "MySQL"],
      bio: "Old school fullstack, still shipping fast",
      avatar: "🧑‍💻",
    },
    {
      id: "user-18",
      name: "Fatima",
      skills: ["Cloud", "AWS", "Terraform"],
      bio: "Infra-as-code believer",
      avatar: "🛡️",
    },
    {
      id: "user-19",
      name: "Chen",
      skills: ["Computer Vision", "Deep Learning", "PyTorch"],
      bio: "Sees the world in pixels",
      avatar: "👁️",
    },
    {
      id: "user-20",
      name: "Isabella",
      skills: ["Angular", "NgRx", "TypeScript"],
      bio: "Loves structure & reactive apps",
      avatar: "🌀",
    },
    {
      id: "user-21",
      name: "David",
      skills: ["Testing", "QA", "Automation"],
      bio: "Catches bugs before you do",
      avatar: "🔍",
    },
    {
      id: "user-22",
      name: "Aisha",
      skills: ["Product Management", "Agile", "Scrum"],
      bio: "Keeps devs aligned with vision",
      avatar: "📋",
    },
    {
      id: "user-23",
      name: "Noah",
      skills: ["Hardware", "Raspberry Pi", "C"],
      bio: "Loves tinkering with boards",
      avatar: "🔧",
    },
    {
      id: "u24",
      name: "Elena",
      skills: ["Graphic Design", "Motion", "Branding"],
      bio: "Makes everything beautiful",
      avatar: "✨",
    },
  ];

  const eventId = uid();
  const events = [
    {
      id: eventId,
      title: "SynapHack 3.0 – HackSphere Demo",
      theme: "Event & Hackathon Hosting Platform",
      tracks: ["Core Platform", "AI Plagiarism", "Gamification"],
      rules: ["Team size up to 4", "Build MVP in 24h", "Original work only"],
      prizes: ["Best Innovation", "Best UI/UX", "Best Tech Stack"],
      sponsors: ["Synap Labs", "Azure", "MongoDB"],
      mode: "online",
      timeline: [
        { id: uid(), label: "Register", due: "2025-08-17", done: true },
        { id: uid(), label: "Build MVP", due: "2025-08-18", done: false },
        { id: uid(), label: "Submit", due: "2025-08-18", done: false },
        { id: uid(), label: "Demo Day", due: "2025-08-18", done: false },
      ],
      createdAt: nowISO(),
      createdBy: "u1",
    },
  ];

  const announcements = [
    {
      id: uid(),
      eventId,
      msg: "Welcome to HackSphere! 🚀 Drop your first submission when ready.",
      by: "System",
      at: nowISO(),
    },
  ];

  const teams = [
    {
      id: uid(),
      eventId,
      name: "NeonBits",
      members: ["u1", "u3"],
      createdAt: nowISO(),
    },
  ];

  const submissions = [
    {
      id: uid(),
      eventId,
      teamId: teams[0].id,
      title: "HackSphere – Social Feed + Map",
      desc: "Gamified hackathon platform with AI judge copilot and swipe teaming.",
      github: "https://github.com/example/hacksphere",
      video: "https://youtu.be/dQw4w9WgXcQ",
      track: "Core Platform",
      tags: ["React", "Tailwind", "FramerMotion"],
      createdAt: nowISO(),
      scores: [], // {judgeId, round, score, feedback}
    },
  ];

  store.set("users", users);
  store.set("events", events);
  store.set("announcements", announcements);
  store.set("teams", teams);
  store.set("submissions", submissions);
  store.set("__seeded__", true);
};

seedIfEmpty();

// ------- Simple Scoring Heuristic ("AI" Copilot) -------
const rubricKeywords = {
  innovation: ["novel", "gamified", "3d", "metaverse", "unique", "ai"],
  functionality: ["upload", "submission", "team", "score", "judge", "realtime"],
  scalability: ["azure", "mongodb", "sql", "serverless", "cloud", "scale"],
  uiux: ["tailwind", "framer", "neon", "dark", "animation", "map"],
};

function aiFirstImpression(sub) {
  // score 0..100 based on keyword overlap with description+tags+title
  const text =
    `${sub.title} ${sub.desc} ${sub.tags?.join(" ") || ""}`.toLowerCase();
  const buckets = Object.values(rubricKeywords).map((arr) => arr);
  let hits = 0;
  let total = 0;
  buckets.forEach((arr) => {
    arr.forEach((k) => {
      total += 1;
      if (text.includes(k)) hits += 1;
    });
  });
  const base = Math.round((hits / Math.max(total, 1)) * 100);
  // small boost if github/video exist
  const boost = (sub.github ? 5 : 0) + (sub.video ? 5 : 0);
  return Math.min(100, base + boost);
}

// ------- UI Primitives -------
const Section = ({ title, right, children }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg md:text-xl font-semibold text-slate-100 tracking-wide">
        {title}
      </h3>
      {right}
    </div>
    {children}
  </div>
);

const Pill = ({ children }) => (
  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs mr-2 mb-2 inline-block">
    {children}
  </span>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500 ${props.className || ""}`}
  />
);

const TextArea = (props) => (
  <textarea
    {...props}
    className={`w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-fuchsia-500 min-h-[100px] ${props.className || ""}`}
  />
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}) => {
  const variants = {
    primary: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white",
    ghost:
      "bg-transparent border border-slate-700 hover:border-fuchsia-500 text-slate-200",
    subtle: "bg-slate-800 hover:bg-slate-700 text-slate-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl transition-all shadow-md ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children }) => (
  <span className="px-2 py-0.5 text-xs rounded-md bg-fuchsia-700/30 text-fuchsia-300 border border-fuchsia-700/40">
    {children}
  </span>
);

// ------- Components -------
function NeonHeader({ role, setRole }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-fuchsia-700/30 bg-gradient-to-br from-slate-900 to-slate-950 mb-6">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-600/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-600/30 blur-3xl rounded-full" />
      </div>
      <div className="p-6 md:p-10 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              HackSphere <span className="text-fuchsia-400">MVP</span>
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl">
              Metaverse-inspired hackathon hub with swipe teaming, social feed
              submissions, timeline map, and Judge Copilot.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { key: "participant", label: "Participant" },
              { key: "organizer", label: "Organizer" },
              { key: "judge", label: "Judge" },
            ].map((r) => (
              <Button
                key={r.key}
                variant={role === r.key ? "primary" : "ghost"}
                onClick={() => setRole(r.key)}
                className="min-w-[120px]"
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineMap({ event, onToggle }) {
  return (
    <div className="flex items-center flex-wrap gap-4">
      {event.timeline.map((m, idx) => (
        <div key={m.id} className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`px-4 py-2 rounded-2xl border cursor-pointer select-none ${
              m.done
                ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-200"
            }`}
            onClick={() => onToggle?.(m.id)}
          >
            <div className="text-sm font-semibold">{m.label}</div>
            <div className="text-[11px] opacity-75">Due: {m.due}</div>
          </motion.div>
          {idx < event.timeline.length - 1 && (
            <div className="w-8 h-[2px] bg-slate-700 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

function Announcements({ eventId }) {
  const [list, setList] = useState(() =>
    store.get("announcements", []).filter((a) => a.eventId === eventId),
  );
  const [msg, setMsg] = useState("");

  const post = () => {
    if (!msg.trim()) return;
    const all = store.get("announcements", []);
    const a = { id: uid(), eventId, msg, by: "Organizer", at: nowISO() };
    all.unshift(a);
    store.set("announcements", all);
    setList(all.filter((x) => x.eventId === eventId));
    setMsg("");
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Post announcement…"
        />
        <Button onClick={post}>Announce</Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-auto pr-1">
        {list.map((a) => (
          <div
            key={a.id}
            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-200 text-sm">{a.msg}</span>
              <Badge>{new Date(a.at).toLocaleString()}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganizerDashboard({ activeEvent, setActiveEvent }) {
  const [events, setEvents] = useState(() => store.get("events", []));
  const [form, setForm] = useState({ title: "", theme: "", mode: "online" });

  useEffect(() => {
    store.set("events", events);
  }, [events]);

  const create = () => {
    if (!form.title.trim()) return;
    const ev = {
      id: uid(),
      title: form.title,
      theme: form.theme || "",
      tracks: [],
      rules: [],
      prizes: [],
      sponsors: [],
      mode: form.mode,
      timeline: [
        {
          id: uid(),
          label: "Register",
          due: new Date().toISOString().slice(0, 10),
          done: false,
        },
        {
          id: uid(),
          label: "Build",
          due: new Date().toISOString().slice(0, 10),
          done: false,
        },
        {
          id: uid(),
          label: "Submit",
          due: new Date().toISOString().slice(0, 10),
          done: false,
        },
        {
          id: uid(),
          label: "Demo Day",
          due: new Date().toISOString().slice(0, 10),
          done: false,
        },
      ],
      createdAt: nowISO(),
      createdBy: "u1",
    };
    const next = [ev, ...events];
    setEvents(next);
    setActiveEvent(ev.id);
    setForm({ title: "", theme: "", mode: "online" });
  };

  const onToggleTimeline = (id) => {
    const next = events.map((ev) =>
      ev.id === activeEvent
        ? {
            ...ev,
            timeline: ev.timeline.map((m) =>
              m.id === id ? { ...m, done: !m.done } : m,
            ),
          }
        : ev,
    );
    setEvents(next);
  };

  const current = events.find((e) => e.id === activeEvent) || events[0];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Section title="Create Event">
        <div className="grid gap-3">
          <Input
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Theme"
            value={form.theme}
            onChange={(e) => setForm({ ...form, theme: e.target.value })}
          />
          <div className="flex gap-3">
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <Button onClick={create}>Create</Button>
          </div>
        </div>
      </Section>

      <Section
        title={current ? `Event: ${current.title}` : "No events yet"}
        right={
          <select
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
            value={current?.id}
            onChange={(e) => setActiveEvent(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        }
      >
        {current && (
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-slate-300">
                Timeline Map (toggle to mark done)
              </div>
              <TimelineMap event={current} onToggle={onToggleTimeline} />
            </div>
            <div>
              <div className="mb-2 text-slate-300">Quick Facts</div>
              <div className="flex flex-wrap gap-2">
                {current.tracks.map((t, i) => (
                  <Pill key={i}>{t}</Pill>
                ))}
                {current.tracks.length === 0 && (
                  <span className="text-slate-500">
                    Add tracks in doc later → (MVP)
                  </span>
                )}
              </div>
            </div>
            <Section title="Announcements">
              <Announcements eventId={current.id} />
            </Section>
          </div>
        )}
      </Section>
    </div>
  );
}

function HackMatch({ currentUserId = "u1", onTeamCreated, eventId }) {
  const users = store.get("users", []);
  const candidates = users.filter((u) => u.id !== currentUserId);
  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState([]);

  const person = candidates[idx];

  const like = () => {
    if (!person) return;
    const next = [...liked, person.id];
    setLiked(next);
    setIdx(idx + 1);
    if (next.length >= 2) {
      // create team quickly
      const team = {
        id: uid(),
        eventId,
        name: `Team-${uid()}`,
        members: [currentUserId, ...next.slice(0, 2)],
        createdAt: nowISO(),
      };
      const all = store.get("teams", []);
      all.unshift(team);
      store.set("teams", all);
      onTeamCreated?.(team);
    }
  };

  const skip = () => setIdx(idx + 1);

  return (
    <div className="flex flex-col items-center text-center">
      {person ? (
        <motion.div
          key={person.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl"
        >
          <div className="text-6xl mb-3">{person.avatar}</div>
          <div className="text-xl font-bold text-white">{person.name}</div>
          <div className="text-slate-300 text-sm mb-3">{person.bio}</div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {person.skills.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={skip} className="min-w-[120px]">
              Skip
            </Button>
            <Button onClick={like} className="min-w-[120px]">
              Match
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="text-slate-400">No more candidates. Nice picks! 🎯</div>
      )}
    </div>
  );
}

function SubmissionForm({ eventId }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [github, setGithub] = useState("");
  const [video, setVideo] = useState("");
  const [track, setTrack] = useState("Core Platform");

  const submit = () => {
    if (!title.trim() || !desc.trim()) return;
    const sub = {
      id: uid(),
      eventId,
      teamId: null,
      title,
      desc,
      github,
      video,
      track,
      tags: [],
      createdAt: nowISO(),
      scores: [],
    };
    const all = store.get("submissions", []);
    all.unshift(sub);
    store.set("submissions", all);
    setTitle("");
    setDesc("");
    setGithub("");
    setVideo("");
    alert("Submission added to live feed ✨");
  };

  return (
    <div className="grid gap-2">
      <Input
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextArea
        placeholder="Short description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div className="grid md:grid-cols-2 gap-2">
        <Input
          placeholder="GitHub URL (optional)"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
        />
        <Input
          placeholder="Demo video URL (optional)"
          value={video}
          onChange={(e) => setVideo(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-300 text-sm">Track</span>
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
        >
          <option>Core Platform</option>
          <option>AI Plagiarism</option>
          <option>Gamification</option>
        </select>
      </div>
      <Button onClick={submit}>Submit Project</Button>
    </div>
  );
}

function LiveFeed({ eventId }) {
  const [subs, setSubs] = useState(() =>
    store.get("submissions", []).filter((s) => s.eventId === eventId),
  );

  useEffect(() => {
    const i = setInterval(() => {
      setSubs(
        store.get("submissions", []).filter((s) => s.eventId === eventId),
      );
    }, 1000);
    return () => clearInterval(i);
  }, [eventId]);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subs.map((s) => (
        <motion.div
          key={s.id}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-white font-semibold">{s.title}</div>
            <Badge>{s.track}</Badge>
          </div>
          <div className="text-slate-300 text-sm line-clamp-3 mb-3">
            {s.desc}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {s.github && (
              <a
                className="text-fuchsia-300 text-sm underline"
                href={s.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            )}
            {s.video && (
              <a
                className="text-fuchsia-300 text-sm underline"
                href={s.video}
                target="_blank"
                rel="noreferrer"
              >
                Video
              </a>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            {new Date(s.createdAt).toLocaleString()}
          </div>
        </motion.div>
      ))}
      {subs.length === 0 && (
        <div className="text-slate-400">
          No submissions yet. Be the first! 🚀
        </div>
      )}
    </div>
  );
}

function JudgeDashboard({ eventId }) {
  const [subs, setSubs] = useState(() =>
    store.get("submissions", []).filter((s) => s.eventId === eventId),
  );
  const [round, setRound] = useState(1);
  const [myId] = useState("judge-01");

  useEffect(() => {
    const i = setInterval(() => {
      setSubs(
        store.get("submissions", []).filter((s) => s.eventId === eventId),
      );
    }, 1000);
    return () => clearInterval(i);
  }, [eventId]);

  const scoreSub = (id, score, feedback) => {
    const all = store.get("submissions", []);
    const idx = all.findIndex((x) => x.id === id);
    if (idx >= 0) {
      const s = all[idx];
      const others = (s.scores || []).filter(
        (r) => !(r.judgeId === myId && r.round === round),
      );
      s.scores = [
        ...others,
        { judgeId: myId, round, score: Number(score), feedback, at: nowISO() },
      ];
      all[idx] = s;
      store.set("submissions", all);
      setSubs(all.filter((x) => x.eventId === eventId));
    }
  };

  const leaderboard = useMemo(() => {
    return subs
      .map((s) => ({
        id: s.id,
        title: s.title,
        avg:
          s.scores && s.scores.length
            ? Math.round(
                s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length,
              )
            : aiFirstImpression(s),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [subs]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Section title="Submissions">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-slate-300 text-sm">Round</span>
          <select
            value={round}
            onChange={(e) => setRound(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>
        <div className="space-y-4 max-h-[520px] overflow-auto pr-1">
          {subs.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-semibold">{s.title}</div>
                  <div className="text-slate-300 text-sm mb-2">{s.desc}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {s.github && (
                      <a
                        className="text-fuchsia-300 text-sm underline"
                        href={s.github}
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub
                      </a>
                    )}
                    {s.video && (
                      <a
                        className="text-fuchsia-300 text-sm underline"
                        href={s.video}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Video
                      </a>
                    )}
                    <Badge>AI First Look: {aiFirstImpression(s)} / 100</Badge>
                  </div>
                </div>
              </div>
              <JudgeScoring
                onSubmit={(score, feedback) => scoreSub(s.id, score, feedback)}
              />
            </div>
          ))}
          {subs.length === 0 && (
            <div className="text-slate-400">Nothing to judge yet.</div>
          )}
        </div>
      </Section>

      <Section title="Leaderboard (Live)">
        <div className="space-y-2">
          {leaderboard.map((l, i) => (
            <div
              key={l.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  {i + 1}
                </div>
                <div className="text-slate-100 font-medium">{l.title}</div>
              </div>
              <div className="text-fuchsia-300 font-semibold">{l.avg}</div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-slate-400">No entries yet.</div>
          )}
        </div>
      </Section>
    </div>
  );
}

function JudgeScoring({ onSubmit }) {
  const [score, setScore] = useState(80);
  const [feedback, setFeedback] = useState("");
  return (
    <div className="mt-3 grid gap-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-300 text-sm">Score</span>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
        />
        <Badge>{score}</Badge>
      </div>
      <TextArea
        placeholder="Feedback (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={() => onSubmit(score, feedback)}>Save Score</Button>
        <Button
          variant="ghost"
          onClick={() => {
            setScore(80);
            setFeedback("");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

function ParticipantDashboard({ activeEvent }) {
  const [teams, setTeams] = useState(() =>
    store.get("teams", []).filter((t) => t.eventId === activeEvent),
  );
  useEffect(() => {
    const i = setInterval(
      () =>
        setTeams(
          store.get("teams", []).filter((t) => t.eventId === activeEvent),
        ),
      800,
    );
    return () => clearInterval(i);
  }, [activeEvent]);

  const onTeamCreated = (team) => setTeams((t) => [team, ...t]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Section title="HackMatch – Find Teammates">
        <HackMatch eventId={activeEvent} onTeamCreated={onTeamCreated} />
      </Section>

      <Section title="Your Teams">
        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {teams.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800"
            >
              <div className="text-slate-100 font-semibold">{t.name}</div>
              <div className="text-slate-300 text-sm">
                Members: {t.members.join(", ")}
              </div>
            </div>
          ))}
          {teams.length === 0 && (
            <div className="text-slate-400">No team yet. Try HackMatch ➡️</div>
          )}
        </div>
      </Section>

      <Section title="Submit Your Project">
        <SubmissionForm eventId={activeEvent} />
      </Section>

      <Section title="Live Feed – Submissions">
        <LiveFeed eventId={activeEvent} />
      </Section>
    </div>
  );
}

// ------- Root App -------
export default function App() {
  const [role, setRole] = useState("participant");
  const events = store.get("events", []);
  const [activeEvent, setActiveEvent] = useState(events[0]?.id || null);

  useEffect(() => {
    // Sync active event if storage changes
    const i = setInterval(() => {
      const evs = store.get("events", []);
      if (!evs.find((e) => e.id === activeEvent)) {
        setActiveEvent(evs[0]?.id || null);
      }
    }, 1500);
    return () => clearInterval(i);
  }, [activeEvent]);

  const current = store.get("events", []).find((e) => e.id === activeEvent);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 p-4 md:p-8">
      <NeonHeader role={role} setRole={setRole} />

      {current ? (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Active Event</div>
              <div className="text-xl font-semibold">{current.title}</div>
            </div>
            <div>
              <select
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                value={current.id}
                onChange={(e) => setActiveEvent(e.target.value)}
              >
                {store.get("events", []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-slate-400">
          No events yet. Switch to Organizer to create one.
        </div>
      )}

      <div className="space-y-6">
        {role === "organizer" && (
          <OrganizerDashboard
            activeEvent={activeEvent}
            setActiveEvent={setActiveEvent}
          />
        )}
        {role === "participant" && current && (
          <ParticipantDashboard activeEvent={activeEvent} />
        )}
        {role === "judge" && current && (
          <JudgeDashboard eventId={activeEvent} />
        )}
      </div>

      <footer className="mt-10 text-center text-slate-500 text-xs">
        Built fast with ❤️ – HackSphere MVP. LocalStorage powered. (Swap to
        Azure SQL + MongoDB for production.)
      </footer>
    </div>
  );
}
