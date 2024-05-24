import { Request, Response } from "express";
import sqlite3 from 'sqlite3';
import { app, getEventIds } from ".";
import { readFile } from "fs/promises";


let db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});
// create database structure - events have shafts, goblins, cards; shafts have levels, costs, income and cards; cards have levels and multipliers
db.serialize(() => {
  //db.run('DROP TABLE IF EXISTS event');
  //db.run('DROP TABLE IF EXISTS shaft');
  //db.run('DROP TABLE IF EXISTS card');
  //db.run('DROP TABLE IF EXISTS shaft_card');
  //db.run('DROP TABLE IF EXISTS goblin');
  db.run('CREATE TABLE IF NOT EXISTS event (id INTEGER PRIMARY KEY, name TEXT, start_date DATE, end_date DATE)');
  db.run('CREATE TABLE IF NOT EXISTS shaft (id INTEGER PRIMARY KEY, event_id INTEGER, name TEXT, level INTEGER, cost INTEGER, income INTEGER)');
  db.run('CREATE TABLE IF NOT EXISTS card (id INTEGER PRIMARY KEY, event_id INTEGER, name TEXT, rarity TEXT, max_level INTEGER)');
  db.run('CREATE TABLE IF NOT EXISTS shaft_card (id INTEGER PRIMARY KEY, shaft_id INTEGER, card_id INTEGER, level INTEGER, multiplier INTEGER)');
  db.run('CREATE TABLE IF NOT EXISTS goblin (id INTEGER PRIMARY KEY, event_id INTEGER, name TEXT, level INTEGER, cost INTEGER, count INTEGER)');
});
// seed db event table with data from getEventIds mmethod
async function seedDb() {
  // this should come from lte not from this method i think
var eventIds = await getEventIds();
eventIds.forEach(async (id) => {
  db.run('INSERT INTO event (name) VALUES (?)', [id]);

  const json_data = JSON.parse(await readFile(`event/event_${id}.json`, "utf8"));
  db.run('INSERT into shaft (event_id, name) VALUES (?, ?)', [id, 'spawningcart']);
  for (const mineshaft of json_data.MineShafts) {
    const name : string = mineshaft.Id;
    db.run('INSERT into shaft (event_id, name) VALUES (?, ?)', [id, name]);
  }
  });

}
seedDb();

// add some basic crud operations for each table
// add event
app.post('/api/event', (req: Request, res: Response) => {
// return an error
res.sendStatus(500);
});
// get all events
app.get('/api/event', (req: Request, res: Response) => {
  db.all('SELECT * FROM event', (err, rows) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(rows);
    }
  });
});
// get one event
app.get('/api/event/:name', (req: Request, res: Response) => {
  db.get('SELECT * FROM event WHERE name = ?', [req.params.name], (err, row) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(row);
    }
  });
});
// update event
app.put('/api/event/:name', (req: Request, res: Response) => {
  db.run('UPDATE event SET start_date = ?, end_date = ? WHERE name = ?', [req.body.start_date, req.body.end_date, req.params.name], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
// delete event
app.delete('/api/event/:id', (req: Request, res: Response) => {
  db.run('DELETE FROM event WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
// add shaft
app.post('/api/shaft', (req: Request, res: Response) => {
  db.run('INSERT INTO shaft (event_id, name, level, cost, income) VALUES (?, ?, ?, ?, ?)', [req.body.event_id, req.body.name, req.body.level, req.body.cost, req.body.income], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ id: this.lastID });
    }
  });
});
// get all shafts
app.get('/api/shaft', (req: Request, res: Response) => {
  db.all('SELECT * FROM shaft', (err, rows) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(rows);
    }
  });
});
// get event shafts
app.get('/api/event/:event_id/shafts', (req: Request, res: Response) => {
  db.all('SELECT * FROM shaft WHERE event_id = ?', [req.params.event_id], (err, rows) => {
    if (err) {
      res.sendStatus(500);
    } else {
      // log rows to terminal
      console.log(rows);
      res.json(rows);
    }
  });
});
// update shaft level
app.put('/api/shaft/:id', (req: Request, res: Response) => {
  db.run('UPDATE shaft SET  level = ? WHERE id = ?', [req.body.level, req.params.id], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
// delete shaft
app.delete('/api/shaft/:id', (req: Request, res: Response) => {
  db.run('DELETE FROM shaft WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
// add card
app.post('/api/card', (req: Request, res: Response) => {
  db.run('INSERT INTO card (event_id, name, rarity, max_level) VALUES (?, ?, ?, ?)', [req.body.event_id, req.body.name, req.body.rarity, req.body.max_level], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ id: this.lastID });
    }
  });
});
// get all cards
app.get('/api/card', (req: Request, res: Response) => {
  db.all('SELECT * FROM card', (err, rows) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(rows);
    }
  });
});
// get one card
app.get('/api/card/:id', (req: Request, res: Response) => {
  db.get('SELECT * FROM card WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(row);
    }
  });
});
// update card
app.put('/api/card/:id', (req: Request, res: Response) => {
  db.run('UPDATE card SET event_id = ?, name = ?, rarity = ?, max_level = ? WHERE id = ?', [req.body.event_id, req.body.name, req.body.rarity, req.body.max_level, req.params.id], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
// delete card
app.delete('/api/card/:id', (req: Request, res: Response) => {
  db.run('DELETE FROM card WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
// add shaft_card
app.post('/api/shaft_card', (req: Request, res: Response) => {
  db.run('INSERT INTO shaft_card (shaft_id, card_id, level, multiplier) VALUES (?, ?, ?, ?)', [req.body.shaft_id, req.body.card_id, req.body.level, req.body.multiplier], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ id: this.lastID });
    }
  });
});
// get all shaft_cards
app.get('/api/shaft_card', (req: Request, res: Response) => {
  db.all('SELECT * FROM shaft_card', (err, rows) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(rows);
    }
  });
});
// get one shaft_card
app.get('/api/shaft_card/:id', (req: Request, res: Response) => {
  db.get('SELECT * FROM shaft_card WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(row);
    }
  });
});
// update shaft_card
app.put('/api/shaft_card/:id', (req: Request, res: Response) => {
  db.run('UPDATE shaft_card SET shaft_id = ?, card_id = ?, level = ?, multiplier = ? WHERE id = ?', [req.body.shaft_id, req.body.card_id, req.body.level, req.body.multiplier, req.params.id], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
// delete shaft_card
app.delete('/api/shaft_card/:id', (req: Request, res: Response) => {
  db.run('DELETE FROM shaft_card WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ changes: this.changes });
    }
  });
});
