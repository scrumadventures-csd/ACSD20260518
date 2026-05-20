// backend/app.js
const express = require('express');
const registerGame = require('./registerGame');
const app = express();

app.use(express.json());

app.post('/api/ball/total', (req, res) => {
  const { pinsKnockedDown } = req.body;
  const value = Number(pinsKnockedDown);

  if (!Number.isInteger(value) || value < 0 || value > 10) {
    return res.status(400).json({ error: 'Invalid number of pins' });
  }

  return res.json({ total: value });
});

app.post('/api/registerGame', async (req, res) => {
  try {
    const { frames, pins, rolls, test } = req.body;
    const result = await registerGame({ frames, pins, rolls, test });
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // for testing purpose