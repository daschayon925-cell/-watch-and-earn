import React, { useState, useEffect } from 'react';
import { X, Send, Heart, MessageSquare } from 'lucide-react';
import { Comment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface CommentsDrawerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  videoId,
  isOpen,
  onClose,
  onCommentAdded
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { language, showToast } = useApp();

  useEffect(() => {
    if (isOpen && videoId) {
      loadComments();
    }
  }, [isOpen, videoId]);

  const loadComments = async () => {
    try {
      const list = await api.getComments(videoId);
      setComments(list);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const newCmt = await api.addComment(videoId, text.trim());
      setComments(prev => [newCmt, ...prev]);
      setText('');
      if (onCommentAdded) onCommentAdded();
      showToast(language === 'bn' ? 'মন্তব্য যুক্ত হয়েছে' : 'Comment added', '', 'success');
    } catch {
      showToast(language === 'bn' ? 'মন্তব্য পাঠানো যায়নি' : 'Failed to send comment', '', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md mx-auto h-[65vh] bg-[#0B111A] border-t border-slate-800 rounded-t-3xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              {language === 'bn' ? `মন্তব্যসমূহ (${comments.length})` : `Comments (${comments.length})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {language === 'bn' ? 'প্রথম মন্তব্যকারী হোন!' : 'No comments yet. Be the first!'}
            </div>
          ) : (
            comments.map((cmt) => (
              <div key={cmt.id} className="flex items-start gap-3">
                <img
                  src={cmt.userAvatar}
                  alt={cmt.userName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{cmt.userName}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{cmt.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={language === 'bn' ? 'সুন্দর একটি মন্তব্য লিখুন...' : 'Add a nice comment...'}
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-full text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="p-2 rounded-full bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold hover:bg-emerald-400 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
