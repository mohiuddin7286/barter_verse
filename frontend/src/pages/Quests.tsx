import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Swords, Star, CheckCircle, Clock, Target, Gift, Flame, Coins, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  coin_reward: number;
  progress_target: number;
}

interface QuestCompletion {
  quest_id: string;
  progress: number;
  completed: boolean;
}

interface UserLevel {
  level: number;
  current_xp: number;
  xp_for_next_level: number;
  total_xp: number;
}

export default function Quests() {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [seasonalQuests, setSeasonalQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<Map<string, QuestCompletion>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'seasonal'>('daily');

  useEffect(() => {
    fetchAllQuestData();
  }, []);

  const fetchAllQuestData = async () => {
    try {
      setIsLoading(true);
      const [levelRes, dailyRes, weeklyRes, seasonalRes, userQuestsRes] = await Promise.all([
        api.getUserLevel(),
        api.getDailyQuests(),
        api.getWeeklyQuests(),
        api.getSeasonalQuests('Season 1'),
        api.getUserQuests(undefined, 50, 1),
      ]);

      setUserLevel(levelRes.data);
      setDailyQuests(dailyRes.data.quests || []);
      setWeeklyQuests(weeklyRes.data.quests || []);
      setSeasonalQuests(seasonalRes.data.quests || []);

      const questMap = new Map();
      userQuestsRes.data.quests?.forEach((q: QuestCompletion) => {
        questMap.set(q.quest_id, q);
      });
      setUserQuests(questMap);
    } catch (err) {
      setError('Failed to load quests');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      setCompletingQuestId(questId);
      await api.completeQuest(questId);
      await fetchAllQuestData();
    } catch (err) {
      setError('Failed to complete quest');
    } finally {
      setCompletingQuestId(null);
    }
  };

  const getCurrentQuests = () => {
    switch (activeTab) {
      case 'daily':
        return dailyQuests;
      case 'weekly':
        return weeklyQuests;
      case 'seasonal':
        return seasonalQuests;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-amber-400 mx-auto animate-pulse mb-4" />
          <p className="text-slate-300">Loading quests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#020617]">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Level Progress Card */}
        {userLevel && (
          <div className="relative glass rounded-2xl p-8 border border-white/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/10 to-transparent -z-10" />

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:items-end">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20">
                  <Flame className="w-3 h-3" /> Season 1: The Pioneers
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                  Level {userLevel.level} Trader
                </h1>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-300">XP Progress</span>
                    <span className="text-amber-400">{userLevel.current_xp} / {userLevel.xp_for_next_level}</span>
                  </div>
                  <Progress value={(userLevel.current_xp / userLevel.xp_for_next_level) * 100} className="h-3" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">Total XP</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{userLevel.total_xp}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{userQuests.size}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Tabs and Quests */}
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-slate-800">
            {['daily', 'weekly', 'seasonal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-3 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab} Quests
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {getCurrentQuests().length === 0 ? (
              <div className="md:col-span-2 text-center py-12 text-slate-400">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No quests available</p>
              </div>
            ) : (
              getCurrentQuests().map((quest) => {
                const completion = userQuests.get(quest.id);
                const progress = completion?.progress || 0;
                const progressPercent = (progress / quest.progress_target) * 100;
                const isCompleted = completion?.completed || false;

                return (
                  <Card key={quest.id} className={`border-2 transition-all ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {quest.title}
                        {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-2">{quest.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {!isCompleted && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300">Progress</span>
                            <span className="text-amber-400">{progress} / {quest.progress_target}</span>
                          </div>
                          <Progress value={Math.min(progressPercent, 100)} className="h-2" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-slate-400">XP</span>
                          </div>
                          <p className="font-bold text-yellow-400">+{quest.xp_reward}</p>
                        </div>
                        {quest.coin_reward > 0 && (
                          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-1 mb-1">
                              <Coins className="w-3 h-3 text-amber-400" />
                              <span className="text-xs text-slate-400">BC</span>
                            </div>
                            <p className="font-bold text-amber-400">+{quest.coin_reward}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleCompleteQuest(quest.id)}
                        disabled={isCompleted || completingQuestId === quest.id || progress < quest.progress_target}
                        className={`w-full ${
                          isCompleted
                            ? 'bg-emerald-600/50 cursor-default'
                            : progress >= quest.progress_target
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {completingQuestId === quest.id ? 'Completing...' : isCompleted ? 'Completed ✓' : progress >= quest.progress_target ? 'Complete' : 'In Progress'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Info Section */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Star className="w-5 h-5" />
              How Quests Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>💰 <strong>Earn Rewards:</strong> Complete quests to earn XP and BarterCoins</p>
            <p>📈 <strong>Level Up:</strong> Accumulate XP to increase your trader level</p>
            <p>🏆 <strong>Different Schedules:</strong> Daily, Weekly, and Seasonal quests reset on different schedules</p>
            <p>🎯 <strong>Track Progress:</strong> Watch your progress bar fill as you work towards quest objectives</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
