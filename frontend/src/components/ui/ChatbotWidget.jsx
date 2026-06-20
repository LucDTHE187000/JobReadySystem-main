import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Sparkles, Trash2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // A simple and robust Markdown formatter to display bold, code, bullet lists, and links beautifully
  const formatMessageContent = (text) => {
    if (!text) return '';
    
    // Replace newlines with <br /> and split into sections
    const lines = text.split('\n');
    
    return lines.map((line, idx) => {
      // Handle separator lines like ===, ---, ***
      if (/^[=\-*_]{3,}$/.test(line.trim())) {
        return <hr key={idx} className="border-slate-800/60 my-2.5" />;
      }
      
      // 1. Handle lists
      const listMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
      const numListMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
      
      // 2. Format bold text (**bold**)
      const formatBold = (str) => {
        const parts = str.split('**');
        return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-emerald-400">{part}</strong> : part);
      };

      // 3. Format inline code (`code`)
      const formatCode = (str) => {
        const parts = str.split('`');
        return parts.map((part, i) => i % 2 === 1 ? <code key={i} className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-400 font-mono text-[11px]">{part}</code> : formatBold(part));
      };

      // 4. Format markdown links: [Text](Url)
      const formatLinks = (str) => {
        if (!str) return '';
        const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
        const parts = str.split(linkRegex);
        return parts.map((part, i) => {
          const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (match) {
            const textContent = match[1];
            const url = match[2];
            const isExternal = url.startsWith('http://') || url.startsWith('https://');
            
            if (isExternal) {
              return (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition-colors decoration-dotted"
                >
                  {textContent}
                </a>
              );
            } else {
              return (
                <button 
                  key={i}
                  type="button"
                  onClick={() => {
                    navigate(url);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-1.5 py-0.5 rounded underline font-semibold transition-all inline-block align-baseline text-left border-0 bg-transparent cursor-pointer decoration-dotted"
                  style={{ padding: '2px 4px', margin: '0 2px' }}
                >
                  {textContent}
                </button>
              );
            }
          }
          return formatCode(part);
        });
      };

      if (listMatch) {
        return (
          <li key={idx} className="list-disc ml-4 mb-1 text-slate-200 text-xs sm:text-xs select-text" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {formatLinks(listMatch[2])}
          </li>
        );
      }
      
      if (numListMatch) {
        return (
          <li key={idx} className="list-decimal ml-4 mb-1 text-slate-200 text-xs sm:text-xs select-text" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {formatLinks(numListMatch[2])}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="mb-1.5 leading-relaxed text-slate-200 text-xs sm:text-xs select-text" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {formatLinks(line)}
        </p>
      );
    });
  };

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  // Dynamic User Scoped Storage Key to keep history strictly isolated per account
  const userId = user?._id || user?.id || 'guest';
  const storageKey = `jobready_chat_history_${userId}`;

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history whenever the logged-in user changes (prevents bleed-over between accounts)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  }, [storageKey]);

  // Auto-scroll to bottom and save to storage key
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (history.length > 0 || localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(history));
    }
  }, [history, storageKey]);

  // Show greeting tooltip for first-time interactions
  useEffect(() => {
    const hasInteracted = localStorage.getItem('jobready_chat_interacted');
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
    localStorage.setItem('jobready_chat_interacted', 'true');
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const activeText = textToSend || message;
    if (!activeText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: activeText };
    setHistory((prev) => [...prev, userMessage]);
    
    if (!textToSend) {
      setMessage('');
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_URL}/api/chat`, {
        message: activeText,
        history: history,
      }, { headers });

      if (response.data && response.data.success) {
        const assistantMessage = { role: 'assistant', content: response.data.response };
        setHistory((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Xin lỗi bạn, kết nối của mình tới máy chủ AI đang bị gián đoạn. Vui lòng thử lại sau vài giây nhé! 😢',
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có muốn xóa toàn bộ lịch sử trò chuyện của tài khoản này không?')) {
      setHistory([]);
      localStorage.removeItem(storageKey);
    }
  };

  const quickPrompts = [
    'Làm sao để CV nổi bật chuẩn ATS?',
    'Mẹo phỏng vấn hành vi (STAR)?',
    'Lộ trình trở thành React Developer?',
    'Xu hướng tuyển dụng nghề nghiệp 2026'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* Custom pulse animation style block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-scale-zoom {
          0%, 100% {
            transform: scale(0.92);
          }
          50% {
            transform: scale(1.08);
          }
        }
        .animate-pulse-scale-zoom {
          animation: pulse-scale-zoom 2.5s infinite ease-in-out;
        }
        @keyframes custom-ping-glow {
          0% {
            transform: scale(1);
            opacity: 0.85;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }
        .animate-custom-ping {
          animation: custom-ping-glow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />

      {/* Tooltip Welcoming Balloon */}
      {showTooltip && !isOpen && (
        <div className="mb-3 mr-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm px-4 py-2.5 rounded-2xl shadow-xl max-w-xs animate-bounce relative">
          <button 
            onClick={() => setShowTooltip(false)} 
            className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 hover:bg-slate-700"
          >
            <X size={10} />
          </button>
          <div className="font-semibold flex items-center gap-1.5 mb-0.5">
            <Sparkles size={14} className="text-yellow-300" />
            JobReady AI chào bạn!
          </div>
          Mình có thể giúp bạn viết CV & luyện phỏng vấn cực hiệu quả. Chat thử nhé!
        </div>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="w-[310px] sm:w-[340px] h-[500px] max-h-[85vh] bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-3 py-2.5 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-md relative shrink-0">
                <img src="/robot-logo.png" alt="Robot Logo" className="w-[90%] h-[90%] object-contain rounded-full" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-xs sm:text-sm flex items-center gap-1">
                  JobReady AI 
                  <Sparkles size={11} className="text-yellow-400" />
                </h3>
                <span className="text-[10px] text-emerald-400 font-medium block leading-none">Đang trực tuyến</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/40 rounded-lg transition-all"
                  title="Xóa cuộc trò chuyện"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={handleOpenToggle}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 no-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                  <img src="/robot-logo.png" alt="Robot Logo" className="w-[90%] h-[90%] object-contain rounded-xl" />
                </div>
                <div>
                  <h4 className="text-slate-200 font-semibold text-sm">Chào mừng bạn đến với JobReady!</h4>
                  <p className="text-slate-400 text-[11px] mt-1 max-w-[240px] leading-relaxed">
                    Mình là Trợ lý AI, ở đây để giúp bạn tối ưu hóa cơ hội nghề nghiệp. Hãy hỏi mình bất kỳ câu hỏi nào nhé!
                  </p>
                </div>
                
                {/* Suggestions Card */}
                <div className="w-full bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 text-left">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">Gợi ý câu hỏi:</span>
                  <div className="flex flex-col gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-left text-[11px] bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 hover:border-emerald-500/30 text-slate-300 hover:text-white py-1.5 px-2 rounded-lg transition-all duration-200"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pb-1">
                {history.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role !== 'user' && (
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        <img src="/robot-logo.png" alt="Robot Logo" className="w-[95%] h-[95%] object-contain rounded-full" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3 py-2 rounded-xl text-xs ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md shadow-emerald-950/20'
                          : 'bg-slate-900/90 text-slate-100 border border-slate-800/50 rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="leading-relaxed whitespace-pre-wrap select-text" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{msg.content}</p>
                      ) : (
                        <div className="text-left select-text" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{formatMessageContent(msg.content)}</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      <img src="/robot-logo.png" alt="Robot Logo" className="w-[95%] h-[95%] object-contain rounded-full" />
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800/50 px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <div className="p-2 bg-slate-900/40 border-t border-slate-800/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500 rounded-lg px-3 py-1.5 text-xs transition-all"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-600 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={handleOpenToggle}
        className={`w-16 h-16 rounded-full bg-white border border-slate-200 hover:border-slate-300 shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 relative group focus:outline-none ${
          isOpen ? 'rotate-90' : ''
        }`}
        style={{
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
        }}
      >
        {isOpen ? (
          <ChevronDown size={28} className="text-slate-500 hover:text-slate-800" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-white rounded-full">
            {/* Robot logo with customized zoom pulsing animation */}
            <img 
              src="/robot-logo.png" 
              alt="Robot Logo" 
              className="w-[90%] h-[90%] object-contain rounded-full animate-pulse-scale-zoom group-hover:scale-105 transition-transform duration-300" 
            />
            {/* Ping animation indicator - floating outside at -top-1 -right-1 */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-custom-ping"></span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>
          </div>
        )}
      </button>
    </div>
  );
}

