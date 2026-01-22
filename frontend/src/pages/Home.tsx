import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Coins, Globe, Handshake, Zap, ShieldCheck, 
  CheckCircle, ArrowLeftRight, Users, Repeat, GraduationCap, 
  Briefcase, Heart, Sprout
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] selection:bg-emerald-500/30">
      
      {/* Deep Space Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Hero Section: The Manifesto */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-md mb-8 animate-fade-in-up shadow-xl shadow-emerald-900/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">Beyond The Cash Economy</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-fade-in-up [animation-delay:200ms] opacity-0">
            <span className="text-white">A Parallel</span><br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-200 to-emerald-400 bg-[length:200%_auto] animate-shimmer">
              Micro-Economy.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up [animation-delay:400ms] opacity-0 font-light">
            We are building a world where <span className="text-emerald-400 font-medium">trust</span>, <span className="text-emerald-400 font-medium">skills</span>, and <span className="text-emerald-400 font-medium">utility</span> replace cash. 
            Connect with your local community to exchange what you have for what you need.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-24 animate-fade-in-up [animation-delay:600ms] opacity-0">
            <Link to="/explore">
              <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                Join the Ecosystem
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-300">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Ecosystem Logic (3 Models) */}
      <section className="py-24 relative border-y border-white/5 bg-slate-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Multiple Ways to Exchange</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Money-centric platforms fail when you have skills but no income. Barter Verse bridges that gap with three distinct exchange models.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ModelCard 
              icon={<Repeat className="w-8 h-8 text-blue-400" />}
              title="Direct Barter"
              subtitle="I give X, You give Y"
              description="The classic swap. Exchange a laptop repair for graphic design, or a textbook for a guitar. Simple, direct, and cash-free."
              delay="0ms"
            />
            <ModelCard 
              icon={<Coins className="w-8 h-8 text-amber-400" />}
              title="Barter Coins"
              subtitle="Internal Credit Ledger"
              description="Earn coins by offering value now, spend them later. It prevents deadlocks and keeps the economy flowing. Not crypto, just credit."
              delay="100ms"
            />
            <ModelCard 
              icon={<ArrowLeftRight className="w-8 h-8 text-emerald-400" />}
              title="Multi-Hop Exchange"
              subtitle="A → B → C → A"
              description="Our future engine will connect the dots. You teach Math to B, B designs for C, and C fixes your phone. Everyone wins."
              delay="200ms"
            />
          </div>
        </div>
      </section>

      {/* Target Audience / Use Cases */}
      <section className="py-32 relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8 relative z-10">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                     Built for the <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Value Creators.</span>
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed">
                     This isn't for everyone. It's for those who understand that value isn't just a number in a bank account.
                  </p>
                  
                  <div className="space-y-6">
                     <AudienceItem 
                        icon={<GraduationCap className="w-6 h-6 text-emerald-400" />}
                        title="Students"
                        desc="Exchange notes, tutoring, and tech help without spending your allowance."
                     />
                     <AudienceItem 
                        icon={<Briefcase className="w-6 h-6 text-blue-400" />}
                        title="Freelancers & Creators"
                        desc="Trade your professional skills for services you need, instead of underpricing your work."
                     />
                     <AudienceItem 
                        icon={<Sprout className="w-6 h-6 text-green-400" />}
                        title="Local Communities"
                        desc="Strengthen neighborhood bonds by circulating goods and help locally."
                     />
                  </div>
               </div>

               {/* Visual Representation */}
               <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl -z-10 group-hover:blur-[80px] transition-all duration-700" />
                  <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                     <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                           <div>
                              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Recent Activity</div>
                              <div className="text-xl font-bold text-white">Campus Hub</div>
                           </div>
                           <Globe className="w-8 h-8 text-slate-500" />
                        </div>
                        <div className="space-y-4">
                           <TradeRow user="Alex" action="taught Python to" target="Sarah" value="Skill Swap" />
                           <TradeRow user="Sarah" action="gave a Monitor to" target="Mike" value="450 BC" />
                           <TradeRow user="Mike" action="fixed Bike for" target="Alex" value="Service" />
                        </div>
                        <div className="pt-4">
                           <div className="text-center text-sm text-slate-400">
                              <span className="text-white font-bold">142</span> trades in your area this week
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Trust & Safety Features */}
      <section className="py-24 relative bg-slate-900/30">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white">The Trust Layer</h2>
               <p className="text-slate-400 mt-2">Unlike messy forums, we provide the infrastructure for safety.</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
               <FeaturePill icon={<ShieldCheck className="w-5 h-5" />} title="Verified Users" />
               <FeaturePill icon={<Heart className="w-5 h-5" />} title="Reputation Score" />
               <FeaturePill icon={<Handshake className="w-5 h-5" />} title="Escrow Protocol" />
               <FeaturePill icon={<Users className="w-5 h-5" />} title="Dispute Resolution" />
            </div>
         </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-emerald-950/30 -z-10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[150px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Stop Buying.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Start Bartering.</span>
          </h2>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
             Your skills and unused items are currency. Unlock their value in the Barter Verse today.
          </p>
          <div className="pt-8">
            <Link to="/auth">
              <Button size="lg" className="h-16 px-12 text-lg font-bold btn-primary rounded-full shadow-2xl shadow-emerald-500/30 hover:scale-105 transition-transform duration-300">
                Join the Revolution
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Sub-components for Cleaner Code ---

function ModelCard({ icon, title, subtitle, description, delay }: { icon: React.ReactNode, title: string, subtitle: string, description: string, delay: string }) {
   return (
      <div 
         className="glass p-8 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group animate-fade-in-up opacity-0 hover:-translate-y-2"
         style={{ animationDelay: delay, animationFillMode: 'forwards' }}
      >
         <div className="mb-6 p-4 bg-slate-950/50 rounded-2xl inline-block border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-lg">
            {icon}
         </div>
         <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
         <div className="text-emerald-400 text-sm font-mono mb-4">{subtitle}</div>
         <p className="text-slate-400 leading-relaxed text-sm">
            {description}
         </p>
      </div>
   );
}

function AudienceItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
   return (
      <div className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/5 transition-colors duration-300 border border-transparent hover:border-white/5">
         <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex-shrink-0">
            {icon}
         </div>
         <div>
            <h4 className="text-lg font-bold text-slate-200">{title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed mt-1">{desc}</p>
         </div>
      </div>
   );
}

function TradeRow({ user, action, target, value }: { user: string, action: string, target: string, value: string }) {
   return (
      <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5">
         <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-bold text-white">{user}</span>
            <span className="text-slate-500 text-xs">{action}</span>
            <span className="font-bold text-white">{target}</span>
         </div>
         <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{value}</div>
      </div>
   );
}

function FeaturePill({ icon, title }: { icon: React.ReactNode, title: string }) {
   return (
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all cursor-default">
         {icon}
         <span className="font-semibold">{title}</span>
      </div>
   );
}