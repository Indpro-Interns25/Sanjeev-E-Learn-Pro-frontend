import { useState, useRef, useEffect, useCallback } from 'react';
import { mockCourses } from '../data/mockCourses';

// ─── Course Knowledge Base ────────────────────────────────────────────────────

const CATEGORIES = [...new Set(mockCourses.map((c) => c.category))];
const LEVELS = [...new Set(mockCourses.map((c) => c.level))];
const FREE_LABEL = 'Free';

function courseCard(course) {
  return `📚 **${course.title}**
• Category: ${course.category}  |  Level: ${course.level}
• Instructor: ${course.instructor.name}
• Duration: ${course.duration}  |  Price: ${FREE_LABEL}
• Rating: ⭐ ${course.rating}/5`;
}

function matchCourse(query) {
  const q = query.toLowerCase();
  return mockCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.instructor.name.toLowerCase().includes(q)
  );
}

function getBotResponse(userMessage) {
  const msg = userMessage.trim().toLowerCase();

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|howdy|namaste|good\s*(morning|evening|afternoon))/i.test(msg)) {
    return `👋 Hello! I'm **EduBot**, your learning assistant for EduLearn Pro.\n\nI can help you with:\n• 📋 Browse all available courses\n• 🔍 Find courses by topic, level, or category\n• 💰 Check course prices & duration\n• 👨‍🏫 Learn about instructors\n• 🎓 Explore course curriculum\n\nWhat are you looking for today?`;
  }

  // ── Help / What can you do ─────────────────────────────────────────────────
  if (/help|what can you|what do you|capabilities|features/i.test(msg)) {
    return `🤖 I can help you with:\n\n• **"Show all courses"** – Full course catalog\n• **"Beginner courses"** – Filter by level\n• **"Data Science courses"** – Filter by category\n• **"Tell me about React"** – Course details\n• **"Price of Python course"** – Pricing info\n• **"Who teaches Machine Learning?"** – Instructor details\n• **"Cheapest course"** – Budget-friendly options\n• **"Best rated courses"** – Top-rated picks\n• **"Courses under ₹500"** – Price filter\n\nJust ask naturally!`;
  }

  // ── All courses ────────────────────────────────────────────────────────────
  if (/all courses|list courses|show courses|available courses|what courses|course catalog/i.test(msg)) {
    const list = mockCourses
      .map((c, i) => `${i + 1}. **${c.title}** (${c.level}) – ${FREE_LABEL}`)
      .join('\n');
    return `📚 We have **${mockCourses.length} courses** available:\n\n${list}\n\nAsk me about any course to get full details!`;
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  if (/categor(y|ies)|topics|subjects/i.test(msg)) {
    return `🗂️ We offer courses in **${CATEGORIES.length} categories**:\n\n${CATEGORIES.map((c) => `• ${c}`).join('\n')}\n\nAsk "Show me [category] courses" to see courses!`;
  }

  // ── Levels ─────────────────────────────────────────────────────────────────
  if (/levels|difficulty|beginner|intermediate|advanced/i.test(msg)) {
    const levelFilter = LEVELS.find((l) => msg.includes(l.toLowerCase()));
    if (levelFilter) {
      const filtered = mockCourses.filter((c) => c.level === levelFilter);
      if (filtered.length === 0) return `❌ No ${levelFilter} courses found.`;
      const list = filtered.map((c) => courseCard(c)).join('\n\n');
      return `🎯 **${levelFilter} Courses** (${filtered.length} found):\n\n${list}`;
    }
    return `📊 We have courses at **${LEVELS.join(', ')}** levels.\n\nAsk me "Show beginner courses" or "Advanced courses" to filter!`;
  }

  // ── Best rated ──────────────────────────────────────────────────────────────
  if (/best rated|top rated|highest rated|popular|best courses|recommended/i.test(msg)) {
    const sorted = [...mockCourses].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const list = sorted.map((c) => `⭐ ${c.rating} – **${c.title}** (${FREE_LABEL})`).join('\n');
    return `🏆 **Top 5 Highest Rated Courses**:\n\n${list}\n\nWant details on any of these?`;
  }

  // ── Cheapest / budget ──────────────────────────────────────────────────────
  if (/cheap|affordable|lowest price|budget|least expensive/i.test(msg)) {
    const sorted = [...mockCourses].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const list = sorted.map((c) => `💰 ${FREE_LABEL} – **${c.title}**`).join('\n');
    return `💸 **Most Affordable Courses**:\n\n${list}\n\nGreat choices to start your learning journey!`;
  }

  // ── Most expensive / premium ────────────────────────────────────────────────
  if (/expensive|premium|high.end|most .* cost|priciest/i.test(msg)) {
    const sorted = [...mockCourses].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const list = sorted.map((c) => `💎 ${FREE_LABEL} – **${c.title}**`).join('\n');
    return `💎 **Premium Courses**:\n\n${list}`;
  }

  // ── Price filter "under ₹X" ────────────────────────────────────────────────
  const priceMatch = msg.match(/under\s*[₹rs]?\s*(\d+)/i);
  if (priceMatch) {
    const filtered = [...mockCourses];
    const list = filtered.map((c) => `• **${c.title}** – ${FREE_LABEL}`).join('\n');
    return `💰 **All courses are ${FREE_LABEL}** (${filtered.length} found):\n\n${list}`;
  }

  // ── Category-specific search ────────────────────────────────────────────────
  for (const cat of CATEGORIES) {
    if (msg.includes(cat.toLowerCase())) {
      const filtered = mockCourses.filter((c) => c.category === cat);
      const list = filtered.map((c) => courseCard(c)).join('\n\n');
      return `🗂️ **${cat} Courses** (${filtered.length} found):\n\n${list}`;
    }
  }

  // ── Price / cost query ────────────────────────────────────────────────────
  if (/price|cost|fee|how much|charges?/i.test(msg)) {
    const query = msg.replace(/price|cost|fee|how much|charges?|of|the|for|course/gi, '').trim();
    const found = matchCourse(query).filter((c) => c !== undefined);
    if (found.length > 0) {
      const details = found
        .slice(0, 3)
        .map((c) => `• **${c.title}**: ${FREE_LABEL} (${c.duration})`)
        .join('\n');
      return `💰 **Course Pricing**:\n\n${details}`;
    }
    const allPrices = mockCourses
      .map((c) => `• ${c.title}: ${FREE_LABEL}`)
      .join('\n');
    return `💰 **All Course Prices**:\n\n${allPrices}`;
  }

  // ── Instructor query ────────────────────────────────────────────────────────
  if (/instructor|teacher|taught by|who teach|who is|professor/i.test(msg)) {
    const query = msg.replace(/instructor|teacher|taught by|who teach|who is|professor|the|course|for/gi, '').trim();
    const found = matchCourse(query);
    if (found.length > 0) {
      const details = found
        .slice(0, 3)
        .map((c) => `• **${c.title}** is taught by **${c.instructor.name}**`)
        .join('\n');
      return `👨‍🏫 **Instructor Information**:\n\n${details}`;
    }
    const instructors = [...new Set(mockCourses.map((c) => c.instructor.name))];
    return `👨‍🏫 **Our Instructors**:\n\n${instructors.map((i) => `• ${i}`).join('\n')}\n\nAsk about a specific course to learn who teaches it!`;
  }

  // ── Duration / length ────────────────────────────────────────────────────────
  if (/duration|long|weeks|hours|time|length/i.test(msg)) {
    const query = msg.replace(/duration|how long|weeks|hours|time|length|of|the|for|course|is/gi, '').trim();
    const found = matchCourse(query);
    if (found.length > 0) {
      const details = found
        .slice(0, 3)
        .map((c) => `• **${c.title}**: ${c.duration}`)
        .join('\n');
      return `⏱️ **Course Duration**:\n\n${details}`;
    }
  }

  // ── Curriculum / what will I learn ─────────────────────────────────────────
  if (/curriculum|syllabus|what will i learn|topics covered|learn in|what.*(course|teach)/i.test(msg)) {
    const query = msg.replace(/curriculum|syllabus|what will i learn|topics covered|learn in|what|course|teach|the|about|will/gi, '').trim();
    const found = matchCourse(query);
    if (found.length > 0) {
      const course = found[0];
      const topics = course.curriculum?.map((t) => `  ✓ ${t}`).join('\n') || 'Curriculum details coming soon.';
      return `📖 **${course.title} – Curriculum**:\n\n${topics}\n\n📌 Level: ${course.level} | Duration: ${course.duration} | Price: ${FREE_LABEL}`;
    }
  }

  // ── Rating ────────────────────────────────────────────────────────────────
  if (/rating|rated|stars|score/i.test(msg)) {
    const query = msg.replace(/rating|rated|stars|score|what is the|of|the|for|course/gi, '').trim();
    const found = matchCourse(query);
    if (found.length > 0) {
      const details = found
        .slice(0, 3)
        .map((c) => `• **${c.title}**: ⭐ ${c.rating}/5`)
        .join('\n');
      return `⭐ **Course Ratings**:\n\n${details}`;
    }
  }

  // ── General course search ───────────────────────────────────────────────────
  const searchTerms = msg.replace(/tell me about|show me|details|information|info|about/gi, '').trim();
  if (searchTerms.length >= 3) {
    const found = matchCourse(searchTerms);
    if (found.length === 1) {
      const c = found[0];
      const topics = c.curriculum?.slice(0, 4).map((t) => `  ✓ ${t}`).join('\n') || '';
      return `📚 **${c.title}**\n\n${c.description}\n\n**Details:**\n• Instructor: ${c.instructor.name}\n• Level: ${c.level}\n• Duration: ${c.duration}\n• Price: ${FREE_LABEL}\n• Rating: ⭐ ${c.rating}/5\n\n**You'll learn:**\n${topics}\n${c.curriculum?.length > 4 ? `  ... and ${c.curriculum.length - 4} more topics` : ''}`;
    }
    if (found.length > 1) {
      const list = found.slice(0, 5).map((c) => courseCard(c)).join('\n\n');
      return `🔍 Found **${found.length} course${found.length > 1 ? 's' : ''}** matching "${searchTerms}":\n\n${list}`;
    }
  }

  // ── Enrollment / how to enroll ───────────────────────────────────────────────
  if (/enroll|register|sign up|join|buy|purchase/i.test(msg)) {
    return `🎓 **How to Enroll**:\n\n1. Browse our **Course Catalog** (click "Courses" in the menu)\n2. Select a course you're interested in\n3. Click **"Enroll Now"** on the course detail page\n4. Complete the payment process\n5. Start learning immediately!\n\nNeed help finding the right course? Just ask me!`;
  }

  // ── About EduLearn Pro ────────────────────────────────────────────────────
  if (/about|what is edulearn|platform|this site|who are you/i.test(msg)) {
    return `🎓 **About EduLearn Pro**\n\nEduLearn Pro is a comprehensive online learning platform offering:\n\n• **${mockCourses.length}+ courses** across diverse topics\n• Courses taught by **expert instructors**\n• Levels from **${LEVELS.join(', ')}**\n• Categories: ${CATEGORIES.slice(0, 5).join(', ')} and more\n• Interactive video lessons\n• Progress tracking & quizzes\n• Certificates upon completion\n\nStart your learning journey today! 🚀`;
  }

  // ── Goodbye ────────────────────────────────────────────────────────────────
  if (/bye|goodbye|see you|thanks|thank you|that.s all/i.test(msg)) {
    return `👋 Happy learning! Feel free to come back anytime you have questions. Good luck on your learning journey! 🎓`;
  }

  // ── Default fallback ────────────────────────────────────────────────────────
  return `🤔 I didn't quite catch that. I specialize in answering questions about our courses!\n\nTry asking:\n• "Show all courses"\n• "Tell me about Python"\n• "Beginner courses"\n• "Cheapest course"\n• "Who teaches React?"\n\nOr type **"help"** for a full list of what I can do.`;
}

// ─── Chatbot UI Component ─────────────────────────────────────────────────────

const WELCOME_MESSAGE = {
  id: 0,
  from: 'bot',
  text: `👋 Hi! I'm **EduBot**, your AI learning assistant!\n\nI know everything about our courses. Ask me anything like:\n• "What courses are available?"\n• "Best rated courses"\n• "Tell me about Python for Data Science"\n• "Courses under ₹500"\n\nHow can I help you today?`,
  time: new Date(),
};

function MessageBubble({ msg }) {
  const isBot = msg.from === 'bot';
  const lines = msg.text.split('\n');

  return (
    <div
      className={`d-flex mb-3 ${isBot ? 'justify-content-start' : 'justify-content-end'}`}
    >
      {isBot && (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-2"
          style={{
            width: 32, height: 32, background: 'linear-gradient(135deg,#4F8EF7,#8b5cf6)',
            fontSize: 14, color: '#fff', fontWeight: 700,
          }}
        >
          🤖
        </div>
      )}
      <div
        style={{
          maxWidth: '80%',
          background: isBot
            ? 'var(--chatbot-bot-bg, #f3f4f6)'
            : 'linear-gradient(135deg,#4F8EF7,#6366f1)',
          color: isBot ? 'var(--chatbot-bot-text, #1f2937)' : '#fff',
          borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          padding: '10px 14px',
          fontSize: '0.83rem',
          lineHeight: 1.55,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        {lines.map((line, i) => {
          // render **bold** text
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <span key={i}>
              {parts.map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                )
              )}
              {i < lines.length - 1 && <br />}
            </span>
          );
        })}
        <div
          style={{
            fontSize: '0.68rem',
            opacity: 0.55,
            marginTop: 4,
            textAlign: isBot ? 'left' : 'right',
          }}
        >
          {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const userMsg = { id: Date.now(), from: 'user', text: userText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate thinking delay
    const delay = 400 + Math.random() * 600;
    await new Promise((r) => setTimeout(r, delay));

    const response = getBotResponse(userText);
    const botMsg = { id: Date.now() + 1, from: 'bot', text: response, time: new Date() };
    setMessages((prev) => [...prev, botMsg]);
    setTyping(false);

    if (!open) setUnread((n) => n + 1);
  }, [input, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestion = (text) => sendMessage(text);

  const suggestions = ['All courses', 'Best rated', 'Beginner courses', 'Cheapest course'];

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg,#4F8EF7,#6366f1)',
          color: '#fff',
          fontSize: 24,
          boxShadow: '0 4px 16px rgba(79,142,247,0.45)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title={open ? 'Close Chat' : 'Ask EduBot'}
        aria-label={open ? 'Close ChatBot' : 'Open EduBot'}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? (
          <i className="bi bi-x-lg" />
        ) : (
          <>
            <i className="bi bi-robot" />
            {unread > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#ef4444',
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: '2px solid #fff',
                }}
              >
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 96,
            right: 28,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            height: 500,
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: 18,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            background: 'var(--chatbot-bg, #fff)',
            border: '1px solid var(--chatbot-border, #e5e7eb)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg,#4F8EF7,#6366f1)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>EduBot</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>
                <span
                  style={{
                    display: 'inline-block', width: 7, height: 7,
                    borderRadius: '50%', background: '#4ade80',
                    marginRight: 5, verticalAlign: 'middle',
                  }}
                />
                AI Course Assistant · Online
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: 8, padding: '4px 8px', color: '#fff',
                cursor: 'pointer', fontSize: 12,
              }}
              title="Minimise"
            >
              <i className="bi bi-dash-lg" />
            </button>
          </div>

          {/* Messages area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {typing && (
              <div className="d-flex mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-2"
                  style={{
                    width: 32, height: 32,
                    background: 'linear-gradient(135deg,#4F8EF7,#8b5cf6)',
                    fontSize: 14, color: '#fff',
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    background: 'var(--chatbot-bot-bg, #f3f4f6)',
                    borderRadius: '4px 14px 14px 14px',
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#9ca3af',
                        animation: 'chatTyping 1.2s infinite',
                        animationDelay: `${i * 0.2}s`,
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div
            style={{
              padding: '6px 12px',
              display: 'flex', gap: 6, flexWrap: 'wrap',
              borderTop: '1px solid var(--chatbot-border, #e5e7eb)',
              flexShrink: 0,
            }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                style={{
                  background: 'var(--chatbot-chip-bg, #eff6ff)',
                  color: '#4F8EF7',
                  border: '1px solid #bfdbfe',
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#dbeafe')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--chatbot-chip-bg, #eff6ff)')}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 12px',
              borderTop: '1px solid var(--chatbot-border, #e5e7eb)',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses…"
              style={{
                flex: 1,
                border: '1.5px solid var(--chatbot-input-border, #e5e7eb)',
                borderRadius: 24,
                padding: '8px 14px',
                fontSize: '0.83rem',
                outline: 'none',
                background: 'var(--chatbot-input-bg, #f9fafb)',
                color: 'var(--chatbot-bot-text, #1f2937)',
                transition: 'border 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4F8EF7')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--chatbot-input-border, #e5e7eb)')}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              style={{
                width: 38, height: 38,
                borderRadius: '50%',
                border: 'none',
                background: input.trim() && !typing ? 'linear-gradient(135deg,#4F8EF7,#6366f1)' : '#e5e7eb',
                color: input.trim() && !typing ? '#fff' : '#9ca3af',
                cursor: input.trim() && !typing ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <i className="bi bi-send-fill" style={{ fontSize: 14 }} />
            </button>
          </form>
        </div>
      )}

      {/* Typing dots keyframe */}
      <style>{`
        @keyframes chatTyping {
          0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
          40% { transform: scale(1.3); opacity: 1; }
        }

        [data-theme="dark"] {
          --chatbot-bg: #1e1e2e;
          --chatbot-border: #374151;
          --chatbot-bot-bg: #2d2d3d;
          --chatbot-bot-text: #e5e7eb;
          --chatbot-input-bg: #2d2d3d;
          --chatbot-input-border: #374151;
          --chatbot-chip-bg: #1e3a5f;
        }
      `}</style>
    </>
  );
}
