import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTrade } from '@/contexts/TradeContext';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function TradeCenter() {
  const { trades, acceptTrade, rejectTrade, isLoading } = useTrade();
  const [activeTab, setActiveTab] = useState('incoming');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const incomingTrades = trades.filter(t => t.direction === 'incoming');
  const outgoingTrades = trades.filter(t => t.direction === 'outgoing');

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    await acceptTrade(id);
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await rejectTrade(id);
    setProcessingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-center tracking-tight leading-tight">Trade Center</h1>
          <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-center">
            Manage your incoming and outgoing trade requests
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="incoming">Incoming ({incomingTrades.length})</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing ({outgoingTrades.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : incomingTrades.length > 0 ? (
              incomingTrades.map(trade => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  showActions={trade.status === 'pending'}
                  isProcessing={processingId === trade.id}
                />
              ))
            ) : (
              <EmptyState message="No incoming trade requests" />
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : outgoingTrades.length > 0 ? (
              outgoingTrades.map(trade => (
                <TradeCard key={trade.id} trade={trade} showActions={false} />
              ))
            ) : (
              <EmptyState message="No outgoing trade requests" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TradeCard({
  trade,
  onAccept,
  onReject,
  showActions,
  isProcessing,
}: {
  trade: any;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions: boolean;
  isProcessing?: boolean;
}) {
  return (
    <Card className="bg-[#0F172A] rounded-2xl shadow-lg border border-border hover:border-primary/50 transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-semibold">{trade.listing?.title || trade.listing_title || 'Trade Request'}</h3>
              <StatusBadge status={trade.status?.toLowerCase() || 'pending'} />
            </div>
            <div className="text-muted-foreground space-y-1">
              {trade.direction === 'incoming' ? (
                <div>From: <span className="font-medium text-foreground">{trade.initiator?.username || 'User'}</span></div>
              ) : (
                <div>To: <span className="font-medium text-foreground">{trade.responder?.username || 'User'}</span></div>
              )}
              {trade.coin_amount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 font-semibold">{trade.coin_amount} BC</span>
                  <span className="text-xs">offered</span>
                </div>
              )}
              {trade.message && (
                <div className="text-sm italic">&quot;{trade.message}&quot;</div>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex gap-3">
              <Button
                onClick={() => onAccept?.(trade.id)}
                variant="gradient"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Accept
              </Button>
              <Button
                onClick={() => onReject?.(trade.id)}
                variant="destructive"
                className="shadow-md hover:shadow-xl"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    accepted: 'bg-green-500/20 text-green-500',
    rejected: 'bg-red-500/20 text-red-500',
  };

  const icons = {
    pending: <Clock className="w-4 h-4" />,
    accepted: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
  };

  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]}
      {labels[status as keyof typeof labels]}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <p className="text-xl text-muted-foreground">{message}</p>
    </div>
  );
}
