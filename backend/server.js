const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Подключение к SQLite
const db = new sqlite3.Database(path.join(__dirname, 'crypto.db'));

// Создание таблиц
db.serialize(() => {
  // Таблица для контента страниц (главная, AES, DES, Кузнечик)
  db.run(`
    CREATE TABLE IF NOT EXISTS page_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      section TEXT NOT NULL,
      content TEXT NOT NULL,
      UNIQUE(page, section)
    )
  `);

  console.log('Tables created');
});

// ========== API для контента ==========

// Получить весь контент страницы (все секции)
app.get('/api/content/:page', (req, res) => {
  const { page } = req.params;
  db.all(
    'SELECT section, content FROM page_content WHERE page = ?',
    [page],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const result = {};
      rows.forEach(row => { result[row.section] = row.content; });
      res.json(result);
    }
  );
});

// Получить конкретную секцию страницы
app.get('/api/content/:page/:section', (req, res) => {
  const { page, section } = req.params;
  db.get(
    'SELECT content FROM page_content WHERE page = ? AND section = ?',
    [page, section],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ content: row ? row.content : '' });
    }
  );
});

// Обновить контент секции (опционально, для админки)
app.put('/api/content/:page/:section', (req, res) => {
  const { page, section } = req.params;
  const { content } = req.body;
  db.run(
    `INSERT OR REPLACE INTO page_content (page, section, content) VALUES (?, ?, ?)`,
    [page, section, content],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/content/:page`);
  console.log(`  GET  /api/content/:page/:section`);
  console.log(`  PUT  /api/content/:page/:section`);
});