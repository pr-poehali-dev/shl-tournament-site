import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: number;
  home_team: { id: number; name: string; emoji: string };
  away_team: { id: number; name: string; emoji: string };
  home_score: number | null;
  away_score: number | null;
  date: string;
  time: string;
  status: string;
}

const AdminPanel = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<{ [key: number]: { home: string; away: string } }>({});
  const { toast } = useToast();

  const fetchMatches = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5350980f-fc68-4e4f-8ec8-0229b88d844e');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить матчи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleScoreChange = (matchId: number, team: 'home' | 'away', value: string) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleUpdateMatch = async (matchId: number) => {
    const matchScores = scores[matchId];
    if (!matchScores || matchScores.home === '' || matchScores.away === '') {
      toast({
        title: 'Ошибка',
        description: 'Введите оба счета',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/a7a845c8-b5c9-40b2-bc59-06c6442b914e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: matchId,
          home_score: parseInt(matchScores.home),
          away_score: parseInt(matchScores.away),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Результат матча обновлен',
        });
        fetchMatches();
        setScores((prev) => {
          const newScores = { ...prev };
          delete newScores[matchId];
          return newScores;
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить результат',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const scheduledMatches = matches.filter((m) => m.status === 'scheduled');
  const finishedMatches = matches.filter((m) => m.status === 'finished');

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Edit" className="text-secondary" size={24} />
            Запланированные матчи
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduledMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Нет запланированных матчей</p>
          ) : (
            scheduledMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 border border-muted rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{match.home_team.emoji}</span>
                    <span className="font-semibold">{match.home_team.name}</span>
                  </div>
                  <Badge variant="outline">{match.date} {match.time}</Badge>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="font-semibold">{match.away_team.name}</span>
                    <span className="text-2xl">{match.away_team.emoji}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Счет хозяев"
                    value={scores[match.id]?.home || ''}
                    onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">:</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Счет гостей"
                    value={scores[match.id]?.away || ''}
                    onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    onClick={() => handleUpdateMatch(match.id)}
                    className="ml-auto"
                  >
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {finishedMatches.length > 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="CheckCircle" className="text-green-600" size={24} />
              Завершенные матчи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {finishedMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 border border-muted rounded-lg"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{match.home_team.emoji}</span>
                    <span className="font-semibold">{match.home_team.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xl px-4 py-1">
                      {match.home_score} : {match.away_score}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{match.away_team.name}</span>
                    <span className="text-2xl">{match.away_team.emoji}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {match.date} в {match.time}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPanel;
