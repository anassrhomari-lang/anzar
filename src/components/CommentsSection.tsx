import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, getDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { Comment, UserProfile } from '../types';
import { MessageSquare, Send, Heart, Loader2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommentsSectionProps {
  paperId: string;
  userProfile: UserProfile | null;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ paperId, userProfile }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!paperId) return;

    const q = query(
      collection(db, 'papers', paperId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(docs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `papers/${paperId}/comments`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [paperId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser || !userProfile || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newCommentRef = doc(collection(db, 'papers', paperId, 'comments'));
      const commentData = {
        id: newCommentRef.id,
        paperId,
        userId: auth.currentUser.uid,
        userName: userProfile.name,
        userSpecialty: userProfile.specialty,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0
      };

      await setDoc(newCommentRef, commentData);
      
      // Update User Impact Score
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        commentCount: increment(1),
        impactScore: increment(20) // 20 XP per clinical insight
      });

      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `papers/${paperId}/comments`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const commentRef = doc(db, 'papers', paperId, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `papers/${paperId}/comments/${commentId}`);
    }
  };

  return (
    <div className="space-y-8 mt-12 pb-12">
      <div className="flex items-center justify-between">
        <h3 className="text-xl lg:text-2xl font-serif font-bold text-foreground flex items-center gap-3">
          <MessageSquare className="text-blue-500" size={24} />
          Clinical Discourse
        </h3>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{comments.length} Peer Insights</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your clinical insight or peer-review observation..."
          className="w-full min-h-[120px] p-6 pb-16 resize-none rounded-3xl bg-foreground/[0.03] border border-foreground/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-foreground transition-all outline-none text-sm leading-relaxed placeholder:text-muted-foreground/30 relative z-10 no-scrollbar"
        />
        <div className="absolute bottom-4 right-4 z-10">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="h-10 px-6 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Post Insight
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="animate-spin text-blue-500/40" size={32} />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Retrieving Discourse...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-foreground/[0.02] rounded-3xl border border-dashed border-foreground/5">
            <MessageSquare className="mx-auto text-muted-foreground/20" size={40} />
            <p className="text-sm text-muted-foreground italic">No peer insights recorded for this node yet.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-3xl bg-foreground/[0.03] border border-foreground/5 space-y-4 hover:border-foreground/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{comment.userName}</p>
                      <p className="text-[10px] text-blue-500/60 font-black uppercase tracking-widest">{comment.userSpecialty}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium opacity-50">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed pl-1">
                  {comment.content}
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-2 group/like"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-foreground/5 group-hover/like:bg-rose-500/10 transition-colors">
                      <Heart size={14} className={`transition-colors ${comment.likes > 0 ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground/30 group-hover/like:text-rose-500'}`} />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground/50 group-hover/like:text-rose-500 transition-colors">{comment.likes} Support</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
