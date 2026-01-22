import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Vote, Users, TrendingUp, AlertCircle, Check, X, 
  FileText, ArrowRight, MessageSquare 
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Governance() {
   const navigate = useNavigate();

   const handleDiscuss = () => {
      toast.message('Opening community discussion');
      navigate('/community');
   };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#020617] relative">
       {/* Background Ambience */}
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

       <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-fade-in-up">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
                   <Vote className="w-3 h-3" /> Community DAO
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-2">Governance Console</h1>
                <p className="text-slate-400 max-w-2xl">
                   Shape the future of the BarterVerse. Your coins give you voting power to decide on platform fees, new features, and community rules.
                </p>
             </div>
             <div className="flex gap-4">
                <StatsCard label="Active Voters" value="1,204" icon={<Users className="w-4 h-4 text-blue-400" />} />
                <StatsCard label="Treasury" value="45k BC" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} />
             </div>
          </div>

          {/* Active Proposals Grid */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up [animation-delay:200ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
             
             {/* Featured Proposal */}
             <div className="md:col-span-2 glass p-8 rounded-3xl border border-purple-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 bg-purple-500 text-white text-xs font-bold rounded-bl-2xl">
                   ENDING SOON
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                         <span>Proposal #104</span>
                         <span>•</span>
                         <span className="text-purple-400">Core Protocol</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">Reduce Listing Fee to 5 BC</h2>
                      <p className="text-slate-300 leading-relaxed">
                         To encourage more new users to join, we propose lowering the standard listing fee from 10 BC to 5 BC for the next 3 months. This will be subsidized by the Community Treasury.
                      </p>
                      
                      <div className="space-y-2 pt-2">
                         <div className="flex justify-between text-sm font-medium">
                            <span className="text-emerald-400">Yes (68%)</span>
                            <span className="text-red-400">No (32%)</span>
                         </div>
                         <Progress value={68} className="h-4 bg-slate-900" />
                         <div className="text-xs text-slate-500 text-right">1,402 Votes Cast</div>
                      </div>

                      <div className="flex gap-3 pt-4">
                         <VoteButton type="yes" label="Vote YES" />
                         <VoteButton type="no" label="Vote NO" />
                         <Button variant="outline" className="ml-auto border-slate-700 text-slate-300" onClick={handleDiscuss}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Discuss
                         </Button>
                      </div>
                   </div>
                   
                   {/* Visual / Icon */}
                   <div className="hidden md:flex flex-col items-center justify-center w-48 border-l border-white/5 pl-8">
                      <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                         <FileText className="w-10 h-10 text-purple-400" />
                      </div>
                      <div className="text-center">
                         <div className="text-sm font-bold text-white">By @AlexAdmin</div>
                         <div className="text-xs text-slate-500">Core Team</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Secondary Proposals */}
             <ProposalCard 
                id="#105"
                title="Add 'Vehicle' Category"
                desc="Should we add a dedicated category for vehicle rentals and swaps?"
                status="Active"
                yesPercent={92}
             />
             <ProposalCard 
                id="#106"
                title="Increase Escrow Time"
                desc="Extend the auto-release timer from 3 days to 5 days."
                status="Review"
                yesPercent={45}
             />
          </div>

          {/* Past Decisions */}
          <div className="space-y-4">
             <h3 className="text-xl font-bold text-white">Recent Decisions</h3>
             <div className="glass rounded-xl overflow-hidden border border-white/5">
                {[
                   { id: 103, title: "Enable Dark Mode by Default", result: "Passed", date: "Oct 12" },
                   { id: 102, title: "Allow Anonymous Trading", result: "Rejected", date: "Sep 28" },
                   { id: 101, title: "Launch Mobile App Beta", result: "Passed", date: "Sep 15" },
                ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-lg ${item.result === 'Passed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {item.result === 'Passed' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                         </div>
                         <span className="font-medium text-slate-200">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                         <span>{item.date}</span>
                         <ArrowRight className="w-4 h-4" />
                      </div>
                   </div>
                ))}
             </div>
          </div>

       </div>
    </div>
  );
}

// Sub-components
function StatsCard({ label, value, icon }: any) {
   return (
      <div className="glass px-5 py-3 rounded-xl border border-white/5 flex items-center gap-3">
         <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
         <div>
            <div className="text-xs text-slate-500 uppercase font-bold">{label}</div>
            <div className="text-lg font-bold text-white">{value}</div>
         </div>
      </div>
   );
}

function ProposalCard({ id, title, desc, status, yesPercent }: any) {
   return (
      <div className="glass p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between">
         <div className="space-y-3">
            <div className="flex justify-between items-start">
               <Badge variant="outline" className="bg-slate-900 text-slate-400 border-slate-700">{id}</Badge>
               <Badge className={`${status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}>{status}</Badge>
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{desc}</p>
         </div>
         
         <div className="pt-6 space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-300">
               <span>Approval Rating</span>
               <span>{yesPercent}%</span>
            </div>
            <Progress value={yesPercent} className="h-2 bg-slate-900" />
            <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white mt-2" onClick={() => toast.message('Proposal details coming soon')}>
               View Details
            </Button>
         </div>
      </div>
   );
}

function VoteButton({ type, label }: { type: 'yes' | 'no', label: string }) {
   const [voted, setVoted] = useState(false);
   
   const handleVote = () => {
      setVoted(true);
      toast.success(`You voted ${type.toUpperCase()}!`);
   };

   return (
      <Button 
         onClick={handleVote}
         disabled={voted}
         className={`min-w-[120px] font-bold ${
            type === 'yes' 
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
            : 'bg-transparent border border-red-900/50 text-red-400 hover:bg-red-900/20'
         }`}
      >
         {voted ? <Check className="w-4 h-4 mr-2" /> : null}
         {voted ? 'Voted' : label}
      </Button>
   );
}