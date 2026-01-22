import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Swords, Star, CheckCircle, Clock, Target, Gift, Flame, Coins } from 'lucide-react';

export default function Quests() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#020617] relative">
       {/* Background Effects */}
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -z-10" />

       <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Hero: Season Pass Style */}
          <div className="relative glass rounded-[2rem] p-8 md:p-12 border border-white/10 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/10 to-transparent -z-10" />
             
             <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="space-y-4 max-w-lg">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20">
                      <Flame className="w-3 h-3" /> Season 1: The Pioneers
                   </div>
                   <h1 className="text-4xl font-extrabold text-white">Level 5 Trader</h1>
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                         <span className="text-slate-300">XP Progress</span>
                         <span className="text-amber-400">2,450 / 3,000</span>
                      </div>
                      <Progress value={82} className="h-3 bg-slate-900 border border-slate-800" indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500" />
                   </div>
                </div>
                
                <div className="flex gap-4">
                   <RewardBox label="Next Reward" value="50 BC" icon={<Gift className="w-5 h-5 text-purple-400" />} />
                   <RewardBox label="Season End" value="12 Days" icon={<Clock className="w-5 h-5 text-blue-400" />} />
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             
             {/* Left: Daily Quests */}
             <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                   <Swords className="w-6 h-6 text-emerald-400" /> Daily Quests
                </h2>
                
                <div className="space-y-4">
                   <QuestItem 
                      title="The Lister" 
                      desc="Post 1 new item or skill listing today."
                      reward="5 BC"
                      progress={1}
                      total={1}
                      completed
                   />
                   <QuestItem 
                      title="Community Voice" 
                      desc="Comment on 3 community threads to help others."
                      reward="10 BC"
                      progress={1}
                      total={3}
                   />
                   <QuestItem 
                      title="Deal Maker" 
                      desc="Complete 1 trade verification."
                      reward="25 BC"
                      progress={0}
                      total={1}
                   />
                </div>

                <h2 className="text-2xl font-bold text-white flex items-center gap-2 pt-8">
                   <Target className="w-6 h-6 text-red-400" /> Community Bounties
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                   <BountyCard 
                      title="Logo Design Needed" 
                      requester="StartupDAO" 
                      reward="500 BC" 
                      difficulty="Hard"
                   />
                   <BountyCard 
                      title="Move a Sofa" 
                      requester="LocalCafe" 
                      reward="150 BC" 
                      difficulty="Medium"
                   />
                </div>
             </div>

             {/* Right: Achievements */}
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                   <Trophy className="w-6 h-6 text-amber-400" /> Badges
                </h2>
                <div className="glass rounded-2xl p-6 border border-white/5 grid grid-cols-3 gap-4">
                   <BadgeItem icon="🌱" name="Eco Starter" unlocked />
                   <BadgeItem icon="🤝" name="Trusted" unlocked />
                   <BadgeItem icon="🚀" name="Power User" />
                   <BadgeItem icon="💎" name="Diamond" />
                   <BadgeItem icon="🧠" name="Mentor" />
                   <BadgeItem icon="🌍" name="Legend" />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function QuestItem({ title, desc, reward, progress, total, completed }: any) {
   const percent = (progress / total) * 100;
   
   return (
      <div className={`glass p-5 rounded-2xl border transition-all ${completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'}`}>
         <div className="flex justify-between items-start mb-3">
            <div>
               <h3 className={`font-bold text-lg ${completed ? 'text-emerald-400' : 'text-white'}`}>{title}</h3>
               <p className="text-slate-400 text-sm">{desc}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-amber-400 font-bold text-sm">
               +{reward}
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${percent}%` }} />
            </div>
            <div className="text-xs font-bold text-slate-500">
               {progress} / {total}
            </div>
            {completed && <CheckCircle className="w-5 h-5 text-emerald-500" />}
         </div>
      </div>
   );
}

function BountyCard({ title, requester, reward, difficulty }: any) {
   return (
      <div className="glass p-5 rounded-2xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer group">
         <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
               <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 border border-slate-700 px-2 py-0.5 rounded">{difficulty}</span>
         </div>
         <h3 className="font-bold text-white mb-1">{title}</h3>
         <p className="text-sm text-slate-400 mb-4">by {requester}</p>
         <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Coins className="w-4 h-4" /> {reward}
         </div>
      </div>
   );
}

function RewardBox({ label, value, icon }: any) {
   return (
      <div className="bg-slate-900/50 backdrop-blur border border-white/10 rounded-xl p-3 flex flex-col items-center min-w-[80px]">
         {icon}
         <div className="text-lg font-bold text-white mt-1">{value}</div>
         <div className="text-[10px] text-slate-400 uppercase">{label}</div>
      </div>
   );
}

function BadgeItem({ icon, name, unlocked }: any) {
   return (
      <div className={`flex flex-col items-center gap-2 ${unlocked ? 'opacity-100' : 'opacity-30 grayscale'}`}>
         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-2xl shadow-lg">
            {icon}
         </div>
         <span className="text-xs font-medium text-slate-300">{name}</span>
      </div>
   );
}