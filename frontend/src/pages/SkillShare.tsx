import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Star, Zap, Clock, ShieldCheck, Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const skills = [
  {
    id: 1,
    title: 'Web Development',
    provider: 'Ammar',
    rating: 4.8,
    available: true,
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
  },
  {
    id: 2,
    title: 'Graphic Design',
    provider: 'Priya',
    rating: 4.9,
    available: true,
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500',
  },
  {
    id: 3,
    title: 'Language Tutoring',
    provider: 'Rahul',
    rating: 4.7,
    available: false,
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500',
  },
  {
    id: 4,
    title: 'Music Lessons',
    provider: 'Siddu',
    rating: 5.0,
    available: true,
    category: 'Arts',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500',
  },
];

export default function SkillShare() {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [bookingModal, setBookingModal] = useState<{ open: boolean; skill: typeof skills[number] | null }>({ open: false, skill: null });
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilterClick = () => {
    setAvailableOnly(!availableOnly);
    toast.message(availableOnly ? 'Showing all skills' : 'Showing only available skills');
  };

  const handleBook = (skill: typeof skills[number]) => {
    if (!skill.available) return;
    setBookingModal({ open: true, skill });
  };

  const handleBookingSubmit = async () => {
    if (!bookingModal.skill || !scheduledAt) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          skill_title: bookingModal.skill.title,
          participant_id: 'current_user_id', // Would be actual user ID from auth
          scheduled_at: scheduledAt,
          duration_minutes: durationMinutes,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Booked session with ${bookingModal.skill.provider}!`);
        setBookingModal({ open: false, skill: null });
        setScheduledAt('');
        setDurationMinutes(60);
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(`Booking failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const matchesAvailability = availableOnly ? skill.available : true;
    const matchesSearch = `${skill.title} ${skill.provider} ${skill.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesAvailability && matchesSearch;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative bg-[#020617]">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-500/10 blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-fade-in-up">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Master New Skills</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Skill <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Exchange</span>
            </h1>
            <p className="text-lg text-slate-400">
              Trade your expertise for knowledge. Connect with mentors and learners in the BarterVerse.
            </p>
          </div>

          {/* Search/Filter Bar */}
          <div className="glass p-2 rounded-xl border border-white/10 flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                   placeholder="Find a skill..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-9 bg-slate-900/50 border-transparent text-white focus:bg-slate-900 h-10 rounded-lg"
                />
             </div>
             <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white" onClick={handleFilterClick}>
                <Filter className="w-4 h-4" />
             </Button>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up [animation-delay:200ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
           {filteredSkills.map((skill, idx) => (
            <div 
               key={skill.id} 
               className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col hover:-translate-y-1"
               style={{ animationDelay: `${idx * 100}ms` }}
            >
              
              {/* Image Area */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={skill.image}
                  alt={skill.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {skill.available ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      OPEN
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-md border border-white/10 text-slate-400 text-xs font-bold">
                      <Clock className="w-3 h-3" />
                      BUSY
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <Badge variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-2 hover:bg-white/20 transition-colors">
                    {skill.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{skill.title}</h3>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5 flex flex-col flex-1 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/5 group-hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300 font-bold">
                      {skill.provider[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{skill.provider}</p>
                      <div className="flex items-center text-xs text-amber-400 font-medium">
                        <Star className="w-3 h-3 fill-amber-400 mr-1" />
                        {skill.rating}
                      </div>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                </div>

                <Button
                  className={`w-full h-12 text-base font-medium transition-all duration-300 ${
                    skill.available 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/30' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed hover:bg-slate-800'
                  }`}
                  disabled={!skill.available}
                  onClick={() => handleBook(skill)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {skill.available ? 'Book Session' : 'Unavailable'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        <Dialog open={bookingModal.open} onOpenChange={(open) => setBookingModal({ ...bookingModal, open })}>
          <DialogContent className="bg-[#0B1121] border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Book Session with {bookingModal.skill?.provider}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Skill</label>
                <input
                  type="text"
                  disabled
                  value={bookingModal.skill?.title || ''}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="30"
                  max="240"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(30, Math.min(240, parseInt(e.target.value) || 60)))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setBookingModal({ open: false, skill: null })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookingSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}