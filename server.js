const express = require('express');
const cors = require('cors');
const db = require('./arango-config');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/skills', async (req, res) => {
  try {
    const query = 'FOR skill IN skills RETURN skill';
    const cursor = await db.query(query);
    const result = await cursor.all();
    res.json(result);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).send('Failed to fetch skills');
  }
});

app.get('/skills/next/:completed', async (req, res) => {
  try {
    const completedParam = req.params.completed;
    const completedKeys = completedParam && completedParam.trim().length > 0
      ? completedParam.split(',')
      : [];
    const completedIds = completedKeys.map(k => `skills/${k}`);

    const query = `
      FOR s IN skills
        LET prereqs = (
          FOR p IN prerequisites
            FILTER p._to == s._id
            RETURN p._from
        )
        FILTER LENGTH(prereqs) == 0
          OR EVERY(pr IN prereqs ALL pr IN @completed)
        RETURN s
    `;
    const cursor = await db.query(query, { completed: completedIds });
    const result = await cursor.all();
    res.json(result);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).send('Failed to fetch suggestions');
  }
});

app.get('/skills/prereqs/:key', async (req, res) => {
  try {
    const skillKey = req.params.key;
    const query = `
      FOR p IN prerequisites
        FILTER p._to == @id
        FOR s IN skills
          FILTER s._id == p._from
          RETURN s
    `;
    const cursor = await db.query(query, { id: `skills/${skillKey}` });
    const result = await cursor.all();
    res.json(result);
  } catch (err) {
    console.error('Error fetching prerequisites:', err);
    res.status(500).send('Failed to fetch prerequisites');
  }
});

app.get('/skills/next', async (req, res) => {
  // Just pass empty completed [] to handler.
  const completedKeys = [];
  const completedIds = [];
  const query = `
    FOR s IN skills
      LET prereqs = (
        FOR p IN prerequisites
          FILTER p._to == s._id
          RETURN p._from
      )
      FILTER LENGTH(prereqs) == 0
        OR EVERY(pr IN prereqs ALL pr IN @completed)
      RETURN s
  `;
  const cursor = await db.query(query, { completed: completedIds });
  const result = await cursor.all();
  res.json(result);
});


app.listen(5000, () => console.log('Server running on port 5000'));
