import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { apiConnector } from "../../services/apiconnector";

export default function GlobalAIChat() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef(null);
  const location = useLocation();
  const { user } = useSelector((state) => state.profile);

  // Dynamic context suggestions
  const suggestions = [
    { text: "📚 List Courses", prompt: "What courses are available on Codeverse?" },
    { text: "💳 Payment Options", prompt: "What payment options does Codeverse support?" },
    { text: "🚀 About Codeverse", prompt: "What is Codeverse and what are its key features?" },
    { text: "🎓 Beginner Guide", prompt: "Which course is best for a beginner student on Codeverse?" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const getTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Extract active course ID from URL path if user is viewing a course page
  const getActiveCourseId = () => {
    const paths = location.pathname.split("/");
    if (paths[1] === "courses" && paths[2]) {
      return paths[2];
    }
    if (paths[1] === "view-course" && paths[2]) {
      return paths[2];
    }
    return null;
  };

  const askAI = async (customQuestion) => {
    const queryText = customQuestion || question;
    if (!queryText.trim()) return;

    const userMsg = { type: "user", text: queryText, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    if (!customQuestion) setQuestion("");

    try {
      setLoading(true);
      const res = await apiConnector("POST", "/ai/doubt-solver", {
        question: queryText,
        courseId: getActiveCourseId(),
      });
      
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: res.data.reply || "I am here to help you, could you please repeat?", time: getTime() }
      ]);
    } catch (err) {
      console.error("AI CHAT ERROR:", err);
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Connection failed. Please check your network or try again.", time: getTime() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (promptText) => {
    setStarted(true);
    askAI(promptText);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-yellow-50 hover:bg-yellow-100 shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all text-richblack-900 border border-yellow-100/50"
        >
          {open ? "✕" : "🤖"}
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[580px] bg-richblack-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-richblack-700 flex flex-col overflow-hidden z-[9999] animate-in slide-in-from-bottom-2">
          
          {/* Header */}
          <div className="p-5 bg-richblack-800 border-b border-richblack-700 flex items-center gap-3 shadow-md">
             <div className="w-10 h-10 rounded-full bg-richblack-900 flex items-center justify-center shadow-lg border border-richblack-700 text-lg">🤖</div>
             <div>
                <h2 className="text-white font-bold tracking-tight">Codeverse AI Assistant</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-emerald-400 text-[10px] font-semibold tracking-wider">Online & Active</p>
                </div>
             </div>
          </div>

          {/* Chat Content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-richblack-950/40">
            {!started ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4">
                <div className="w-20 h-20 bg-yellow-50/5 rounded-3xl flex items-center justify-center text-4xl mb-4 border border-yellow-50/10">✨</div>
                <h3 className="text-white text-2xl font-bold mb-2">
                  {user?.firstName ? `Hi, ${user.firstName}! 👋` : "Hi there! 👋"}
                </h3>
                <p className="text-richblack-300 text-sm mb-6 leading-relaxed">
                  I can recommend courses, answer doubts, and guide you through Codeverse!
                </p>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s.prompt)}
                      className="p-3 text-xs bg-richblack-800 hover:bg-richblack-700 text-richblack-100 font-medium rounded-xl border border-richblack-700 transition-all text-left hover:scale-[1.02] active:scale-95 shadow-sm"
                    >
                      {s.text}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStarted(true)}
                  className="w-full py-3.5 bg-yellow-50 hover:bg-yellow-100 text-richblack-900 font-bold rounded-2xl transition-all hover:scale-[0.98] shadow-xl"
                >
                  Start Custom Chat
                </button>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                      msg.type === "user" 
                      ? "bg-yellow-50 text-richblack-900 rounded-tr-none shadow-md font-medium" 
                      : "bg-richblack-800 text-richblack-5 border border-richblack-700 rounded-tl-none shadow-sm ai-markdown"
                    }`}>
                      {msg.type === "user" ? (
                        msg.text
                      ) : (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      )}
                    </div>
                    <span className="text-[10px] text-richblack-400 mt-1.5 font-semibold px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-2 items-center px-4 py-3 bg-richblack-800 rounded-2xl w-fit border border-richblack-700 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-yellow-25 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-25 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-25 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <p className="text-richblack-200 text-xs font-medium ml-1">Thinking...</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Input Area */}
          {started && (
            <div className="p-4 bg-richblack-800 border-t border-richblack-700">
              <div className="relative flex items-center bg-richblack-900 border border-richblack-700 rounded-2xl px-4 py-1 focus-within:border-yellow-50/50 transition-all">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askAI()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent py-3 text-richblack-5 placeholder:text-richblack-400 focus:outline-none text-sm"
                />
                <button onClick={() => askAI()} className="text-yellow-50 hover:text-yellow-100 p-2 transition-transform active:scale-75">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}