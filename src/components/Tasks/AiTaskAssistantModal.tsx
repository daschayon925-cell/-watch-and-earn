import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  X, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  BookOpen, 
  MessageSquare, 
  ThumbsUp, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  ExternalLink,
  ChevronRight,
  ClipboardPaste,
  ShieldAlert
} from 'lucide-react';
import { soundService } from '../../services/audio';

interface AiTaskAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isTaskAnalysis?: boolean;
}

const SAMPLE_PROMPTS = [
  {
    icon: '🎁',
    label: 'ফ্রি গিফট কার্ড সাইন-আপ',
    prompt: 'You will earn 150 Coins once you finish the process. Requirements to be credited are: Sign up & get your free gift card'
  },
  {
    icon: '📲',
    label: '৩০ সেকেন্ড অ্যাপ রান',
    prompt: 'Download and install this app then run it for 30 seconds to unlock your reward.'
  },
  {
    icon: '🎮',
    label: 'লেভেল ১৫ গেম টাস্ক',
    prompt: 'Download and install this app then reach level 15 to unlock your reward.'
  },
  {
    icon: '🏆',
    label: 'Earno মাইলস্টোন অফার',
    prompt: 'Create a new Earno account and complete offers on its offer wall within 15 days'
  },
  {
    icon: '💳',
    label: 'বিকাশ/নগদে টাকা তোলার নিয়ম',
    prompt: 'বিকাশ বা নগদে টাকা তুলতে কত কয়েন লাগবে এবং কত সময় লাগে?'
  },
  {
    icon: '⚠️',
    label: 'ভিপিএন ব্যবহারের নিয়ম',
    prompt: 'ভিপিএন (VPN) কানেক্ট করে কি কাজ করা যাবে?'
  }
];

export const AiTaskAssistantModal: React.FC<AiTaskAssistantModalProps> = ({
  isOpen,
  onClose,
  initialText = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [inputMessage, setInputMessage] = useState<string>(initialText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `### 🌟 স্বাগতম! আমি আপনার বাংলা এআই সহায়ক
আমি **Google Gemini 3.8 Flash** ও চ্যাটজিবিটি প্রযুক্তিতে তৈরি। 

অফারওয়ালের (Affmine, BitcoTasks) যেকোনো ইংরেজি কাজের লেখা বুঝতে না পারলে নিচে পেস্ট করুন। আমি সহজ বাংলায় ১-২-৩ ধাপে বুঝিয়ে দেব কীভাবে কাজ করে কয়েন পাবেন!

এছাড়াও বিকাশ উইথড্র, সার্ভে ট্রিকস বা অ্যাকাউন্ট সংক্রান্ত যেকোনো প্রশ্ন আমাকে করতে পারেন।`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, []);

  // Send Message
  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const text = (textToSend ?? inputMessage).trim();
    if (!text || isLoading) return;

    soundService.playTap();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          isTaskAnalysis: text.length > 30 || /[a-zA-Z]{4,}/.test(text)
        };
        setMessages((prev) => [...prev, botMsg]);
        soundService.playCoinReward();
      } else {
        throw new Error(data.message || 'উত্তর তৈরি করতে সমস্যা হয়েছে');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ দুঃখিত, সাময়িক সমস্যা হয়েছে। আপনি কি আবার প্রশ্নটি করবেন? এছাড়া সাধারণ গাইড ট্যাব থেকে কাজের নিয়ম দেখতে পারেন।`,
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      if (initialText) {
        handleSendMessage(initialText);
      }
    } else {
      stopSpeaking();
    }
  }, [isOpen, initialText, stopSpeaking]);

  // Clean speech synthesis when unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  if (!isOpen) return null;

  // Text to Speech
  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === messageId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    const cleanText = text
      .replace(/###/g, '')
      .replace(/\*\*/g, '')
      .replace(/[#*_`]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;

    // Pick a Bengali voice if available
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('Bangla'));
    if (bnVoice) utterance.voice = bnVoice;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Speech Recognition (Mic)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: `mic_unsupported_${Date.now()}`,
          sender: 'assistant',
          text: '⚠️ আপনার ব্রাউজারে সরাসরি ভয়েস ইনপুট সমর্থিত নয়। অনুগ্রহ করে লিখে বা ইংরেজি লেখা পেস্ট করে পাঠান।',
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Paste from Clipboard helper
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputMessage(text);
          inputRef.current?.focus();
        }
      }
    } catch {
      // Permission denied or clipboard empty
    }
  };

  // Copy Message
  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore
    }
  };

  // Reset / Clear chat
  const handleNewChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `### 🔄 নতুন চ্যাট শুরু হয়েছে
যেকোনো কাজের ইংরেজি নির্দেশনা বা আপনার প্রশ্ন এখানে লিখুন। আমি বাংলায় সাহায্য করতে প্রস্তুত!`,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Format message text with rich ChatGPT / Gemini styling
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading ###
          if (trimmed.startsWith('###')) {
            const heading = trimmed.replace(/^###\s*/, '');
            return (
              <div 
                key={idx} 
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-500/40 shadow-lg shadow-emerald-950/40 my-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs shrink-0 font-bold">
                    🎯
                  </div>
                  <h4 className="font-black text-white sm:text-sm text-xs tracking-tight">
                    {heading}
                  </h4>
                </div>
              </div>
            );
          }

          // Numbered steps (1. 2. 3.)
          if (/^\d+\.\s+/.test(trimmed)) {
            const stepNum = trimmed.match(/^(\d+)\.\s+/)?.[1] || '•';
            const stepContent = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div 
                key={idx} 
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 transition shadow-sm"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  {stepNum}
                </span>
                <span className="text-slate-200">
                  {parseInlineFormatting(stepContent)}
                </span>
              </div>
            );
          }

          // Tips box 💡
          if (trimmed.includes('💡') || trimmed.includes('এআই টিপস')) {
            return (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 shadow-sm my-1.5"
              >
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  {parseInlineFormatting(trimmed.replace(/^💡\s*/, ''))}
                </div>
              </div>
            );
          }

          // Warning box ⚠️
          if (trimmed.includes('⚠️') || trimmed.includes('সতর্কতা')) {
            return (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 shadow-sm my-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">
                  {parseInlineFormatting(trimmed.replace(/^⚠️\s*/, ''))}
                </div>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-slate-200 leading-relaxed">
              {parseInlineFormatting(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for inline **bold**
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-[#0d1117] sm:bg-[#131314] border border-slate-800 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
          isFullscreen 
            ? 'w-full h-full sm:rounded-none' 
            : 'w-full sm:max-w-2xl h-full sm:h-[92vh] sm:rounded-3xl'
        }`}
      >
        {/* ================= TOP HEADER (Gemini / ChatGPT Style) ================= */}
        <div className="px-4 py-3 bg-[#161b22] sm:bg-[#1e1f20] border-b border-slate-800/80 flex items-center justify-between shrink-0 shadow-sm">
          {/* Brand & Model Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-[1.5px] shadow-lg shadow-indigo-500/20 animate-pulse">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#161b22] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>Watch & Earn AI</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>বাংলা টাস্ক সহায়ক ও বুদ্ধিমান অনুবাদক</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleNewChat}
              title="নতুন চ্যাট শুরু করুন"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">নতুন চ্যাট</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'ছোট স্ক্রিন' : 'ফুলস্ক্রিন মোড'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer active:scale-95 border border-slate-700/60"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="বন্ধ করুন"
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-300 transition cursor-pointer active:scale-95 border border-slate-700/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= TABS / QUICK MODES ================= */}
        <div className="px-4 py-2 bg-[#0d1117] sm:bg-[#131314] border-b border-slate-800/80 flex items-center justify-between text-xs font-bold shrink-0">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>এআই চ্যাট ও ট্রান্সলেটর</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('knowledge')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>অফার ট্রিকস ও চিটশিট</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>সরাসরি বাংলায় কথা বলুন</span>
          </div>
        </div>

        {/* ================= MAIN CONTENT BODY ================= */}
        {activeTab === 'chat' ? (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gradient-to-b from-[#0d1117] via-[#10141a] to-[#0d1117]">
            {/* Messages Feed */}
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {/* Assistant Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shrink-0 mt-0.5 shadow-md">
                    <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                )}

                {/* Bubble Container */}
                <div 
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-medium'
                      : 'bg-[#161b22] sm:bg-[#1e1f20] border border-slate-800 text-slate-100 rounded-tl-none space-y-2'
                  }`}
                >
                  {/* Content */}
                  {msg.sender === 'assistant' ? (
                    renderFormattedText(msg.text)
                  ) : (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}

                  {/* Assistant Message Actions (TTS, Copy, Like) */}
                  {msg.sender === 'assistant' && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>

                      <div className="flex items-center gap-1.5">
                        {/* Audio / Listen */}
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          title={speakingId === msg.id ? 'থামান' : 'বাংলায় শুনুন'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            speakingId === msg.id 
                              ? 'bg-emerald-500 text-slate-950 font-bold' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy */}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          title="কপি করুন"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Like */}
                        <button
                          type="button"
                          onClick={() => setLikedMap((p) => ({ ...p, [msg.id]: !p[msg.id] }))}
                          title="সাহায্যকারী উত্তর"
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            likedMap[msg.id] 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-emerald-300">
                    ইউ
                  </div>
                )}
              </div>
            ))}

            {/* AI Thinking Animation (Gemini sparkle dots) */}
            {isLoading && (
              <div className="flex gap-2.5 sm:gap-3 items-center animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#161b22] border border-slate-800 flex items-center gap-2 text-xs text-cyan-300">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-medium text-slate-300">Gemini এআই উত্তর প্রস্তুত করছে...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* ================= KNOWLEDGE BASE & CHEAT SHEET ================= */
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d1117] text-xs text-slate-300">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                💡 প্রফেশনাল চিটশিট
              </span>
              <h4 className="text-sm font-black text-white">অফারওয়াল কাজের সাধারণ ইংরেজি শব্দের বাংলা অর্থ</h4>
              <p className="text-[11px] text-slate-300">
                Affmine এবং BitcoTasks-এর অফারগুলোতে নিচের শব্দগুলো বেশি ব্যবহৃত হয়:
              </p>
            </div>

            <div className="grid gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold text-xs sm:text-sm">
                    Run for 30 seconds / Open app
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    সবচেয়ে সহজ কাজ
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                  👉 <strong>কী করবেন:</strong> সবুজ বাটনে ক্লিক করে গুগল প্লে স্টোর থেকে অ্যাপ নামান। প্রথমবার অ্যাপটি ওপেন করে ৩০-৪০ সেকেন্ড ভেতরে স্ক্রল করুন। এরপর আমাদের সাইটে ফেরত এলেই ওয়ালেটে কয়েন যুক্ত হবে।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold text-xs sm:text-sm">
                    Claim Your Instant Free Gift Card / Sign up
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                    ফ্রি সাইন-আপ
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                  👉 <strong>কী করবেন:</strong> অফারের পেজে গিয়ে আপনার নাম ও ইমেইল দিয়ে একটি ফ্রি রেজিস্ট্রেশন করুন। কোনো টাকা বা কার্ড চাইবে না। সাইন-আপ সম্পন্ন করলেই অ্যাকাউন্টে কয়েন চলে আসবে।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-blue-400 font-bold text-xs sm:text-sm">
                    Reach Level 10 / 15 / 20 in Game
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                    গেম লেভেল টাস্ক
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                  👉 <strong>কী করবেন:</strong> গেমটি প্লে স্টোর থেকে ডাউনলোড করে খেলে খেলে নির্ধারিত লেভেলে (যেমন ১৫ নম্বর লেভেল) পৌঁছান। লেভেল সম্পন্ন হওয়া মাত্রই কয়েন চলে আসবে।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-400 font-bold text-xs sm:text-sm">
                    Complete offers on its offer wall within 15 days
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                    মাইলস্টোন কাজ
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                  👉 <strong>কী করবেন:</strong> যেমন Earno অফার। নতুন অ্যাকাউন্ট খুলে ১৫ দিনের মধ্যে অন্যান্য সহজ অফার শেষ করতে হবে। মাইলস্টোন পার হলে বড় কয়েন রিওয়ার্ড পাবেন।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-red-300 font-bold text-xs sm:text-sm">
                    Deposit / Purchase / Buy
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold text-[10px] flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    এড়িয়ে চলুন ⚠️
                  </span>
                </div>
                <p className="text-red-200 leading-relaxed text-[11px] sm:text-xs">
                  👉 <strong>সতর্কতা:</strong> এতে টাকা রিচার্জ বা কিছু কিনতে বলে। ফ্রি আর্নিংয়ের জন্য সাধারণ ইউজাররা এই ধরণের ডিপোজিট কাজ এড়িয়ে ১০০% ফ্রি কাজগুলো করুন।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= SUGGESTION CHIPS (ChatGPT / Gemini style) ================= */}
        {activeTab === 'chat' && (
          <div className="px-3 py-1.5 bg-[#0d1117] border-t border-slate-800/60 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">
                পরামর্শ:
              </span>
              {SAMPLE_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/40 text-[10px] sm:text-[11px] flex items-center gap-1 transition cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= INPUT BAR (Gemini / ChatGPT Style Capsule) ================= */}
        {activeTab === 'chat' && (
          <div className="p-3 bg-[#161b22] sm:bg-[#1e1f20] border-t border-slate-800/80 shrink-0">
            <div className="relative flex items-center bg-[#0d1117] border border-slate-700/80 rounded-2xl sm:rounded-3xl p-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-lg">
              {/* Quick Paste Button */}
              <button
                type="button"
                onClick={handlePasteClipboard}
                title="ক্লিপবোর্ড থেকে লেখা পেস্ট করুন"
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition cursor-pointer active:scale-95 shrink-0"
              >
                <ClipboardPaste className="w-4 h-4" />
              </button>

              {/* Text Input / Textarea */}
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="ইংরেজি কাজের লেখা পেস্ট করুন অথবা বাংলায় যেকোনো প্রশ্ন লিখুন..."
                className="flex-1 bg-transparent border-0 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none resize-none px-2 py-1.5 max-h-24 font-sans"
              />

              {/* Mic / Voice Input */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? 'শোনা হচ্ছে...' : 'মুখে বাংলায় বলুন'}
                className={`p-2 rounded-xl transition cursor-pointer active:scale-95 shrink-0 ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                title="পাঠান"
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95 disabled:opacity-40 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">পাঠান</span>
              </button>
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>✨ Powered by Gemini 3.8 Flash • Watch & Earn BD AI</span>
              <span>ভিপিএন ছাড়া কাজ করুন</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
