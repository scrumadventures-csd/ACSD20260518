// backend/app.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const registerGame = require('./registerGame');
const app = express();

const PINSETTER_API_URL = process.env.PINSETTER_API_URL || 'http://pinsetter.herokuapp.com/pinsetter';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const gameId = result?.gameId ?? result?.id ?? result;
    return res.json({ gameId });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/roll', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing game id' });
  }

  try {
    const url = `${PINSETTER_API_URL.replace(/\/+$|$/, '')}/?action=roll&id=${encodeURIComponent(id)}`;
    const response = await axios.get(url);
    const raw = String(response.data).trim();

    if (raw === '.') {
      return res.json({ roll: '.', ended: true });
    }

    const pins = Number(raw);
    if (!Number.isInteger(pins) || pins < 0 || pins > 10) {
      return res.status(500).json({ error: `Invalid roll response from pinsetter: ${raw}` });
    }

    return res.json({ roll: pins, ended: false });
  } catch (error) {
    const detail = error.response
      ? `status ${error.response.status}: ${JSON.stringify(error.response.data)}`
      : error.request
      ? 'no response received from pinsetter API'
      : error.message;

    return res.status(500).json({ error: `roll failed requesting ${error.config?.url || 'pinsetter'}: ${detail}` });
  }
});

function sumRolls(rolls) {
  if (!Array.isArray(rolls) || rolls.length === 0) {
    throw new Error('sumRolls requires a non-empty array of roll values');
  }

  return rolls.reduce((total, pins) => {
    if (!Number.isInteger(pins) || pins < 0 || pins > 10) {
      throw new Error('sumRolls accepts only integer pin values between 0 and 10');
    }
    return total + pins;
  }, 0);
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.sumRolls = sumRolls;
module.exports = app; // for testing purpose