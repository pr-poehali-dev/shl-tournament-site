CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  conference VARCHAR(10) NOT NULL CHECK (conference IN ('west', 'east')),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  otl INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  badge VARCHAR(20),
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  home_score INTEGER,
  away_score INTEGER,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'finished')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO teams (name, city, emoji, conference, display_order, badge) VALUES
('ЦСКА', 'Москва', '⭐', 'west', 1, NULL),
('СКА', 'Санкт-Петербург', '⭐', 'west', 2, NULL),
('Динамо', 'Москва', '🔵', 'west', 3, NULL),
('Спартак', 'Москва', '🔴', 'west', 4, NULL),
('Локомотив', 'Ярославль', '🚂', 'west', 5, NULL),
('Лада', 'Тольятти', '🦅', 'west', 6, NULL),
('Торпедо', 'Нижний Новгород', '🦌', 'west', 7, NULL),
('Сочи', 'Сочи', '🐆', 'west', 8, NULL),
('Шанхай Драгонс', 'Шанхай', '🐉', 'west', 9, NULL),
('Северсталь', 'Череповец', '🟡', 'west', 10, NULL),
('Динамо', 'Минск', '🐃', 'west', 11, NULL),
('Акбарс', 'Казань', '🐱', 'east', 1, '🏆🥇'),
('Металлург', 'Магнитогорск', '🦊', 'east', 2, NULL),
('Трактор', 'Челябинск', '🐻‍❄️', 'east', 3, NULL),
('Авангард', 'Омск', '🦅', 'east', 4, NULL),
('Салават Юлаев', 'Уфа', '🍯', 'east', 5, NULL),
('Нефтехимик', 'Нижнекамск', '🐺', 'east', 6, NULL),
('Сибирь', 'Новосибирск', '❄️', 'east', 7, NULL),
('Автомобилист', 'Екатеринбург', '🚘', 'east', 8, NULL),
('Амур', 'Хабаровск', '🐅', 'east', 9, NULL),
('Барыс', 'Астана', '🐱', 'east', 10, NULL),
('Адмирал', 'Владивосток', '⚓', 'east', 11, '🥉');

INSERT INTO matches (home_team_id, away_team_id, match_date, match_time, status) VALUES
(1, 12, '2024-10-15', '19:00', 'scheduled'),
(2, 13, '2024-10-15', '19:30', 'scheduled'),
(3, 14, '2024-10-16', '19:00', 'scheduled'),
(4, 15, '2024-10-16', '19:30', 'scheduled');