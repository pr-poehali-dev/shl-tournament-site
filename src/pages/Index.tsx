import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AdminPanel from '@/components/AdminPanel';

interface Team {
  id: number;
  name: string;
  city: string;
  emoji: string;
  conference: string;
  wins: number;
  losses: number;
  otl: number;
  points: number;
  badge?: string;
}

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

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [westTeams, setWestTeams] = useState<Team[]>([]);
  const [eastTeams, setEastTeams] = useState<Team[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, matchesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/1bc0acb2-8632-423e-b78e-4ff5de91f6c3'),
          fetch('https://functions.poehali.dev/5350980f-fc68-4e4f-8ec8-0229b88d844e'),
        ]);
        
        const teamsData = await teamsRes.json();
        const matchesData = await matchesRes.json();
        
        const west = teamsData.teams.filter((t: Team) => t.conference === 'west');
        const east = teamsData.teams.filter((t: Team) => t.conference === 'east');
        
        setWestTeams(west);
        setEastTeams(east);
        setUpcomingMatches(matchesData.matches.filter((m: Match) => m.status === 'scheduled'));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent">
      <nav className="bg-primary/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏒</div>
              <h1 className="text-xl md:text-2xl font-bold text-white">СХЛ</h1>
            </div>
            <div className="hidden md:flex gap-6">
              {['home', 'standings', 'rules', 'schedule', 'admin', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === section
                      ? 'text-secondary'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'standings' && 'Турнирная таблица'}
                  {section === 'rules' && 'Правила'}
                  {section === 'schedule' && 'Расписание'}
                  {section === 'admin' && 'Админ-панель'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => {
                const sections = ['home', 'standings', 'rules', 'schedule', 'admin', 'contacts'];
                const currentIndex = sections.indexOf(activeSection);
                const nextIndex = (currentIndex + 1) % sections.length;
                setActiveSection(sections[nextIndex]);
              }}
            >
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-xl">Загрузка...</div>
          </div>
        ) : activeSection === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center py-12 md:py-20">
              <div className="text-6xl md:text-8xl mb-6">🏒</div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Сибирская Хоккейная Лига
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Профессиональный хоккейный турнир с лучшими командами России и СНГ
              </p>
            </div>

            {westTeams.length > 0 && eastTeams.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Trophy" className="text-secondary" size={24} />
                      Лидер Запада
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{westTeams[0].emoji}</div>
                      <div>
                        <h3 className="text-2xl font-bold">{westTeams[0].name}</h3>
                        <p className="text-muted-foreground">{westTeams[0].city}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{westTeams[0].points} очков</Badge>
                          <Badge variant="outline">{westTeams[0].wins}-{westTeams[0].losses}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Trophy" className="text-secondary" size={24} />
                      Лидер Востока
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{eastTeams[0].emoji}</div>
                      <div>
                        <h3 className="text-2xl font-bold">{eastTeams[0].name} {eastTeams[0].badge}</h3>
                        <p className="text-muted-foreground">{eastTeams[0].city}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{eastTeams[0].points} очков</Badge>
                          <Badge variant="outline">{eastTeams[0].wins}-{eastTeams[0].losses}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeSection === 'standings' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Турнирная таблица</h2>
            <Tabs defaultValue="west" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/20 backdrop-blur-sm">
                <TabsTrigger value="west">Запад</TabsTrigger>
                <TabsTrigger value="east">Восток</TabsTrigger>
              </TabsList>

              <TabsContent value="west" className="mt-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-primary text-white">
                          <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Команда</th>
                            <th className="px-4 py-3 text-center">И</th>
                            <th className="px-4 py-3 text-center">В</th>
                            <th className="px-4 py-3 text-center">П</th>
                            <th className="px-4 py-3 text-center">ПО</th>
                            <th className="px-4 py-3 text-center font-bold">О</th>
                          </tr>
                        </thead>
                        <tbody>
                          {westTeams.map((team, index) => (
                            <tr
                              key={index}
                              className={`border-b border-muted hover:bg-muted/50 transition-colors ${
                                index < 3 ? 'bg-accent/10' : ''
                              }`}
                            >
                              <td className="px-4 py-3 font-medium">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{team.emoji}</span>
                                  <div>
                                    <div className="font-semibold">{team.name}</div>
                                    <div className="text-sm text-muted-foreground">{team.city}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">{team.wins + team.losses + team.otl}</td>
                              <td className="px-4 py-3 text-center text-green-600 font-medium">{team.wins}</td>
                              <td className="px-4 py-3 text-center text-red-600 font-medium">{team.losses}</td>
                              <td className="px-4 py-3 text-center">{team.otl}</td>
                              <td className="px-4 py-3 text-center font-bold text-lg">{team.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="east" className="mt-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-primary text-white">
                          <tr>
                            <th className="px-4 py-3 text-left">#</th>
                            <th className="px-4 py-3 text-left">Команда</th>
                            <th className="px-4 py-3 text-center">И</th>
                            <th className="px-4 py-3 text-center">В</th>
                            <th className="px-4 py-3 text-center">П</th>
                            <th className="px-4 py-3 text-center">ПО</th>
                            <th className="px-4 py-3 text-center font-bold">О</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eastTeams.map((team, index) => (
                            <tr
                              key={index}
                              className={`border-b border-muted hover:bg-muted/50 transition-colors ${
                                index < 3 ? 'bg-accent/10' : ''
                              }`}
                            >
                              <td className="px-4 py-3 font-medium">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{team.emoji}</span>
                                  <div>
                                    <div className="font-semibold">
                                      {team.name} {team.badge && <span className="ml-1">{team.badge}</span>}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{team.city}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">{team.wins + team.losses + team.otl}</td>
                              <td className="px-4 py-3 text-center text-green-600 font-medium">{team.wins}</td>
                              <td className="px-4 py-3 text-center text-red-600 font-medium">{team.losses}</td>
                              <td className="px-4 py-3 text-center">{team.otl}</td>
                              <td className="px-4 py-3 text-center font-bold text-lg">{team.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeSection === 'rules' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Правила лиги</h2>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Регламент SHL</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="admin">
                    <AccordionTrigger className="text-lg font-semibold">
                      1. Правила связанные с Администраторами/Судьями
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <p><strong>1.1</strong> Незнание правил не освобождает от ответственности</p>
                        <p><strong>1.2</strong> Формат игр происходит 3+1 (3 полевых и 1 вратарь)</p>
                        <p><strong>1.3</strong> 🙋‍♂️ Не оскорблять админов и судей - штраф: дисквалификация (срок на усмотрение)</p>
                        <p><strong>1.4</strong> 🙋‍♂️ На матчах игроки не имеют права гнобить судейство за неправильное решение (можно будет подать заявку на переигровку в случае ошибки судейства)</p>
                        <p><strong>1.5</strong> 🕴 Администрация может вводить корректировки в правила только по Выходным</p>
                        <p><strong>1.6</strong> 🕴 Администрация имеет право выдавать наказание без объяснений причин</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="matches">
                    <AccordionTrigger className="text-lg font-semibold">
                      2. Регламент Матчей
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <p><strong>2.0</strong> 🏒 Удары и поднятие клюшки — Запрещено бить или поднимать клюшку соперника — Штраф: 2 минуты</p>
                        <p><strong>2.1</strong> 🏒 Атака игрока не владеющей шайбы — Запрещено атаковать игрока если он не владеет шайбой — Штраф: 2 минуты - За повторение дисквалификация на матч</p>
                        <p><strong>2.2</strong> 🏒 Помеха вратарю — Запрещается атаковать вратаря физически, толкая или сбивая с ног — Штраф: 3 минуты и аннулирование гола</p>
                        <p><strong>2.3</strong> 🕗 Задержка игры — За намеренное удержание и бездействие игрока с шайбой карается — Штраф: буллиты или 2 минуты</p>
                        <p><strong>2.4</strong> ☣️ Токсичность — Запрещено оскорблять и провоцировать игроков противоположной команды — Штраф: 5 минут</p>
                        <p><strong>2.5</strong> ⛔️ Подделка аккаунта — Запрещено подделывать или играть под чужим ником — Штраф: техническое поражение и дисквалификация на 3 матча</p>
                        <p><strong>2.6</strong> 🔴 Тайм-аут — Разрешается использовать 1 тайм-аут во время игры — тайм-аут длится 1 минуту</p>
                        <p><strong>2.7</strong> 🏒 Игроки на льду — Если на льду игроков больше чем 4 человека (3+1) то штраф. Если лишний игрок не выходит в течении 5 сек - Штраф: 2 минуты</p>
                        <p><strong>2.8</strong> ⚫️ Вбрасывание — При вбрасывании запрещено поднимать клюшку — Штраф: буллит</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="technical">
                    <AccordionTrigger className="text-lg font-semibold">
                      2.9 Технические Поражения
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <p className="font-semibold">➡️ Переносы:</p>
                        <p>🔰 Команда может перенести матч не более 4 раз за сезон</p>
                        
                        <p className="font-semibold mt-4">➡️ Опоздание:</p>
                        <p>🔰 Максимальное время ожидания - 15 минут неявка → Техническое Поражение</p>
                        
                        <p className="font-semibold mt-4">➡️ Провокации:</p>
                        <p>🔰 Массовое Осуждение судьи (2+ игрока) → Техническое Поражение</p>
                        <p>🔰 Победа только присуждается команде при минимум 3 игрока в составе</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="recruitment">
                    <AccordionTrigger className="text-lg font-semibold">
                      4. Правила набора игроков
                    </AccordionTrigger>
                    <AccordionContent>
                      <p><strong>4.0</strong> Набирать игроков, у которых больше 300 часов запрещено.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="respect">
                    <AccordionTrigger className="text-lg font-semibold">
                      5. Уважение
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p><strong>5.1</strong> Запрещено провоцировать и оскорблять чужие команды или игроков в тгк лиги, в личных сообщениях, и так далее. Наказание: дисквалификация виноватого(ых) на 3 матча.</p>
                      <p><strong>5.2</strong> Запрещено угрожать каким-либо образом. Наказание - бан в лиге.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="teams">
                    <AccordionTrigger className="text-lg font-semibold">
                      6. Про команды
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p><strong>6.1</strong> Нельзя играть в двух лигах. Наказание - кик команды с лиги (если уйдут с другой лиги)</p>
                      <p><strong>6.2</strong> Разрешено иметь только 2 Goalkeeper в команде (Запас, Основа)</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'schedule' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Расписание матчей</h2>
            
            <div className="grid gap-4">
              {upcomingMatches.map((match) => (
                <Card key={match.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover-scale">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">{match.date}</div>
                          <div className="text-lg font-bold text-secondary">{match.time}</div>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-right flex-1">
                            <div className="font-semibold text-lg">{match.home_team.emoji} {match.home_team.name}</div>
                          </div>
                          <div className="text-2xl font-bold text-muted-foreground">VS</div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-lg">{match.away_team.name} {match.away_team.emoji}</div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icon name="Calendar" size={16} className="mr-2" />
                        Напомнить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'admin' && (
          <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Админ-панель</h2>
            <AdminPanel />
          </div>
        )}

        {activeSection === 'contacts' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Контакты</h2>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <Icon name="Mail" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Email</h3>
                      <p className="text-muted-foreground">info@shl-league.ru</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <Icon name="Phone" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Телефон</h3>
                      <p className="text-muted-foreground">+7 (495) 123-45-67</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <Icon name="MapPin" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Адрес</h3>
                      <p className="text-muted-foreground">г. Москва, ул. Спортивная, д. 1</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <Icon name="MessageCircle" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Telegram</h3>
                      <p className="text-muted-foreground">@shl_league</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-muted">
                  <h3 className="font-semibold text-lg mb-4">Следите за нами</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="icon">
                      <Icon name="Facebook" size={20} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Icon name="Twitter" size={20} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Icon name="Instagram" size={20} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Icon name="Youtube" size={20} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-primary/95 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/70">
            <p>© 2024 Сибирская Хоккейная Лига. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;