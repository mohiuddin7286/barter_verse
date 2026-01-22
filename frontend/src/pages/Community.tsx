import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, Share2, Search, Plus, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api'; // Correct import
import { useAuth } from '@/contexts/AuthContext'; 

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]); // Real posts state
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Post Form State
  const [newPost, setNewPost] = useState({ title: '', content: '', tag: 'General' });

  // 1. Fetch Posts on Component Mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await api.getPosts();
      // Ensure we extract the array correctly (backend usually sends { success: true, data: [...] })
      setPosts(res.data.data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
      // Optional: don't show toast on load failure to avoid spamming user if offline
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Create Post
  const handlePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
        return toast.error("Title and content are required");
    }
    
    setIsSubmitting(true);
    try {
      await api.createPost(newPost);
      toast.success("Post published successfully!");
      
      // Reset Form
      setNewPost({ title: '', content: '', tag: 'General' });
      setIsCreating(false);
      
      // Refresh List
      loadPosts(); 
    } catch (error) {
      console.error("Create post error:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
      toast.success('Thanks for the like!');
    } catch (error) {
      toast.error('Failed to like post');
      console.error('Like error:', error);
    }
  };

  const handleComment = (postId: string) => {
    toast.message('Comment feature coming soon');
    console.debug('Comment clicked for', postId);
  };

  const handleShare = async (post: any) => {
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;
    const shareData = {
      title: post.title,
      text: post.content,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied');
      } else {
        toast.message('Sharing not available');
      }
    } catch (error) {
      toast.error('Could not share');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Community Hub</h1>
            <p className="text-slate-400">Connect, discuss, and organize with fellow barterers.</p>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> 
            {isCreating ? "Cancel Post" : "Create Post"}
          </Button>
        </div>

        {/* Create Post Form (Collapsible) */}
        {isCreating && (
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4 mb-6 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                Start a Discussion
            </h3>
            <div className="space-y-4">
              <div>
                  <Input 
                    placeholder="Topic Title" 
                    className="bg-slate-950 border-slate-700 text-white focus:border-emerald-500/50 h-12 text-lg"
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                  />
              </div>
              <div>
                  <Textarea 
                    placeholder="What's on your mind? Share tips, ask questions, or tell a story..." 
                    className="bg-slate-950 border-slate-700 text-white min-h-[120px] focus:border-emerald-500/50 resize-none p-4"
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                  />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <Badge variant="outline" className="border-slate-700 text-slate-400">
                    Tag: {newPost.tag}
                </Badge>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                    <Button onClick={handlePost} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[100px]">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
                    </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
               <p className="text-slate-500 text-sm animate-pulse">Loading discussions...</p>
           </div>
        ) : posts.length > 0 ? (
           <div className="space-y-4 animate-fade-in-up [animation-delay:150ms]">
             {posts.map((post) => (
               <div key={post.id} className="group bg-slate-900/30 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-slate-900/50 hover:shadow-lg hover:shadow-emerald-900/10">
                 <div className="flex items-start gap-4">
                   {/* Author Avatar */}
                   <Avatar className="border border-slate-700">
                     <AvatarImage src={post.author?.avatar_url} />
                     <AvatarFallback className="bg-slate-800 text-emerald-400 font-bold border border-emerald-500/20">
                        {post.author?.username?.[0]?.toUpperCase() || 'U'}
                     </AvatarFallback>
                   </Avatar>
                   
                   <div className="flex-1 min-w-0">
                     {/* Post Meta */}
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {post.title}
                         </h3>
                         <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                           <span className="font-medium text-slate-300">@{post.author?.username || 'Unknown'}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                           <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                         </div>
                       </div>
                       <Badge variant="secondary" className="bg-slate-800 text-slate-400 border border-slate-700">
                         {post.tag || "General"}
                       </Badge>
                     </div>
                     
                     {/* Post Content */}
                     <p className="text-slate-300 mt-3 leading-relaxed text-sm whitespace-pre-wrap">
                       {post.content}
                     </p>

                     {/* Actions Bar */}
                     <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/5">
                       <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors group/like" onClick={() => handleLike(post.id)}>
                         <Heart className="w-4 h-4 group-hover/like:scale-110 transition-transform" /> 
                         <span>{post.likes}</span>
                       </button>
                       <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors group/comment" onClick={() => handleComment(post.id)}>
                         <MessageSquare className="w-4 h-4 group-hover/comment:scale-110 transition-transform" /> 
                         <span>Comment</span>
                       </button>
                       <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors ml-auto" onClick={() => handleShare(post)}>
                         <Share2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
               <div className="p-4 bg-slate-800 rounded-full mb-4 opacity-50">
                   <MessageSquare className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">No discussions yet</h3>
               <p className="text-slate-500 max-w-sm">Be the first to start a conversation in the community!</p>
           </div>
        )}
      </div>
    </div>
  );
}