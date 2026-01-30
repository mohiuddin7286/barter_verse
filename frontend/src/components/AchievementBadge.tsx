import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  badgeColor?: 'gold' | 'silver' | 'bronze';
  earnedAt?: string;
  unlocked?: boolean;
}

export function AchievementBadge({
  title,
  description,
  icon,
  badgeColor = 'silver',
  earnedAt,
  unlocked = true,
}: AchievementBadgeProps) {
  const colorClasses = {
    gold: 'from-yellow-400 to-amber-500',
    silver: 'from-gray-300 to-slate-400',
    bronze: 'from-orange-400 to-amber-600',
  };

  const borderClasses = {
    gold: 'border-yellow-400/30',
    silver: 'border-gray-400/30',
    bronze: 'border-orange-400/30',
  };

  const bgClasses = {
    gold: 'bg-yellow-400/5',
    silver: 'bg-gray-400/5',
    bronze: 'bg-orange-400/5',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const badgeContent = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-col items-center gap-2 ${
              unlocked ? 'opacity-100' : 'opacity-30 grayscale'
            } transition-opacity`}
          >
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${colorClasses[badgeColor]} border-2 ${borderClasses[badgeColor]} flex items-center justify-center text-3xl shadow-lg ring-2 ring-black/20`}
            >
              {icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {badgeColor}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-bold text-white">{title}</p>
            <p className="text-sm text-slate-200">{description}</p>
            {unlocked && earnedAt && (
              <p className="text-xs text-slate-400">
                Earned {formatDate(earnedAt)}
              </p>
            )}
            {!unlocked && (
              <p className="text-xs text-slate-400 italic">Locked - Keep playing!</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card
      className={`border ${borderClasses[badgeColor]} ${bgClasses[badgeColor]} bg-slate-900/20 backdrop-blur-sm hover:shadow-lg transition-all`}
    >
      <CardContent className="p-4 flex items-center justify-center">
        {badgeContent}
      </CardContent>
    </Card>
  );
}
