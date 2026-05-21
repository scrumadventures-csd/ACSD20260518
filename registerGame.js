const axios = require('axios');

const PINSETTER_API_URL = process.env.PINSETTER_API_URL || 'http://pinsetter.herokuapp.com/pinsetter';

function validateRequiredParam(name, value) {
  if (value === undefined || value === null) {
    throw new Error(`registerGame missing required param "${name}"`);
  }
}

function buildRegisterUrl({ frames, pins, rolls, test }) {
  const encodedTest = encodeURIComponent(String(test)).replace(/%2F/g, '/');
  const params = `action=register&frames=${encodeURIComponent(String(frames))}&pins=${encodeURIComponent(String(pins))}&rolls=${encodeURIComponent(String(rolls))}&test=${encodedTest}`;

  return `${PINSETTER_API_URL.replace(/\/+$/, '')}/?${params}`;
}

async function registerGame({ frames, pins, rolls, test }) {
  validateRequiredParam('frames', frames);
  validateRequiredParam('pins', pins);
  validateRequiredParam('rolls', rolls);
  validateRequiredParam('test', test);

  const url = buildRegisterUrl({ frames, pins, rolls, test });

  try {
    const response = await axios.get(url);
    console.log(response.data)
    return response.data;
  } catch (error) {
    const detail = error.response
      ? `status ${error.response.status}: ${JSON.stringify(error.response.data)}`
      : error.request
      ? 'no response received from pinsetter API'
      : error.message;

    throw new Error(`registerGame failed requesting ${url}: ${detail}`);
  }
}

module.exports = registerGame;
