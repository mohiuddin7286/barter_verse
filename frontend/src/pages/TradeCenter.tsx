import { useEffect, useState } from 'react';
import { useTrade, Trade } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, Clock, ShieldCheck, 
  AlertTriangle, Package, ArrowRight, Lock, User,
  ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TradeCenter() {
  const { trades, fetchTrades, isLoading, acceptTrade, rejectTrade, confirmDelivery, completeTrade, activeEscrowAmount } = useTrade();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeTrades = trades.filter(t => ['PENDING', 'ESCROW_LOCKED', 'DELIVERED'].includes(t.status));
  const historyTrades = trades.filter(t => ['COMPLETED', 'REJECTED', 'DISPUTED'].includes(t.status));

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#020617] relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trade Control Center</h1>
            <p className="text-slate-400">Manage your active negotiations and secure escrow exchanges.</p>
          </div>
          
          <div className="glass px-6 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-4">
             <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Lock className="w-5 h-5" />
             </div>
             <div>
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Active Escrow</div>
                <div className="text-xl font-bold text-white">{activeEscrowAmount} BC <span className="text-xs text-slate-400 font-normal">Locked</span></div>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/80 border border-slate-800 p-1 rounded-xl mb-6">
            <TabsTrigger value="active" className="flex-1 rounded-lg text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all font-medium">
               Active Trades ({activeTrades.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 rounded-lg text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all font-medium">
               History
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
             {isLoading ? (
                <div className="text-center py-20 text-slate-400 animate-pulse">Loading secure data...</div>
             ) : (activeTab === 'active' ? activeTrades : historyTrades).length === 0 ? (
                <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-800">
                   <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-slate-300">No trades found</h3>
                   <p className="text-slate-400 mb-6">Start a conversation to initiate a trade.</p>
                   <Link to="/explore"><Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">Browse Listings</Button></Link>
                </div>
             ) : (
                (activeTab === 'active' ? activeTrades : historyTrades).map((trade) => (
                   <TradeCard 
                      key={trade.id} 
                      trade={trade} 
                      currentUserId={user?.id || ''}
                      actions={{ acceptTrade, rejectTrade, confirmDelivery, completeTrade }}
                   />
                ))
             )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// --- Trade Card Component ---
function TradeCard({ trade, currentUserId, actions }: { trade: Trade, currentUserId: string, actions: any }) {
   const isInitiator = trade.initiatorId === currentUserId;
   
   // Logic: If you are the Responder (Seller), the trade is Incoming.
   const isIncoming = trade.responderUserId === currentUserId || trade.responder_id === currentUserId;
   
   const partner = isInitiator ? trade.responder : trade.initiator;

   const formatDate = (dateString: string) => {
       try {
           return new Date(dateString).toLocaleDateString();
       } catch (e) {
           return 'New';
       }
   };

   return (
      <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all bg-[#0B1121]/50">
         {/* Status Line */}
         <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            trade.status === 'COMPLETED' ? 'bg-emerald-500' : 
            trade.status === 'ESCROW_LOCKED' ? 'bg-amber-500' : 
            trade.status === 'DELIVERED' ? 'bg-blue-500' :
            trade.status === 'DISPUTED' ? 'bg-red-500' : 'bg-slate-600'
         }`} />

         <div className="flex flex-col md:flex-row gap-6 items-center">
            
            <div className="flex-1 space-y-4 w-full">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     
                     {/* 1. Status Badge */}
                     <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                        trade.status === 'ESCROW_LOCKED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        trade.status === 'DELIVERED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        trade.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-600'
                     }`}>
                        {trade.status.replace('_', ' ')}
                     </span>

                     {/* 2. Direction Badge */}
                     <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider flex items-center gap-1 ${
                        isIncoming 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                     }`}>
                        {isIncoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isIncoming ? 'Received' : 'Sent'}
                     </span>

                     <span className="text-xs text-slate-400 font-medium">
                        {trade.createdAt ? formatDate(trade.createdAt) : 'Just now'}
                     </span>
                  </div>
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User className="w-5 h-5 text-slate-300" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-white">
                            {partner?.display_name || partner?.username || 'Trading Partner'}
                        </div>
                        <div className="text-xs text-slate-400">Partner</div>
                     </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                  
                  <div className="text-right">
                     <div className="text-sm font-bold text-white truncate max-w-[150px]">
                        {trade.listing?.title || 'Unknown Item'}
                     </div>
                     <div className="text-xs text-emerald-400 font-bold">
                        {trade.proposedCoins || trade.coin_amount || 0} BC
                     </div>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="w-full md:w-auto min-w-[200px] flex flex-col gap-3">
               
               {/* 1. PENDING: Only Seller (Incoming) can accept */}
               {trade.status === 'PENDING' && isIncoming && (
                  <>
                     <div className="text-xs text-center text-amber-400 mb-1 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Action Required
                     </div>
                     <Button onClick={() => actions.acceptTrade(trade.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                        Accept & Lock Funds
                     </Button>
                     <Button onClick={() => actions.rejectTrade(trade.id)} variant="outline" className="w-full border-red-900/50 text-red-400 hover:bg-red-900/20">
                        Decline Offer
                     </Button>
                  </>
               )}
               {trade.status === 'PENDING' && !isIncoming && (
                   <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-pulse" />
                      <div className="text-sm text-slate-300">Waiting for response</div>
                   </div>
               )}

               {/* 2. ESCROW LOCKED: Seller (Incoming) must Deliver */}
               {trade.status === 'ESCROW_LOCKED' && (
                  <div className="space-y-3">
                     <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Funds Secured
                     </div>
                     
                     {/* FIX: If you are the SELLER (Incoming), YOU confirm delivery */}
                     {isIncoming ? ( 
                        <Button onClick={() => actions.confirmDelivery(trade.id)} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                           <Package className="w-4 h-4 mr-2" /> Confirm I Sent It
                        </Button>
                     ) : (
                        <div className="text-xs text-slate-400 text-center">Waiting for seller to deliver...</div>
                     )}
                  </div>
               )}

               {/* 3. DELIVERED: Buyer (Outgoing) must Release Funds */}
               {trade.status === 'DELIVERED' && (
                  <div className="space-y-3">
                     {/* FIX: If you are the BUYER (Not Incoming), YOU release funds */}
                     {!isIncoming ? (
                        <Button onClick={() => actions.completeTrade(trade.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse text-white">
                           <CheckCircle className="w-4 h-4 mr-2" /> Release Funds
                        </Button>
                     ) : (
                        <div className="text-xs text-slate-400 text-center">Waiting for buyer to confirm...</div>
                     )}
                  </div>
               )}
               
               {/* 4. COMPLETED */}
               {trade.status === 'COMPLETED' && (
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                     <CheckCircle className="w-5 h-5" /> Trade Successful
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}