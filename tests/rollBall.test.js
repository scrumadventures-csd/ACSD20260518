const request = require('supertest');
const axios = require('axios');
const app = require('../rollBall');

jest.mock('axios');

describe('POST /api/ball/total', () => {
  it('should return total 2 pins knocked down for valid input of 2', async () => {
    const response = await request(app).post('/api/ball/total').send({ pinsKnockedDown: 2 });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.total).toBe(2);
  });

  it('should return total 4 pins knocked down for valid input of 4', async () => {
    const response = await request(app).post('/api/ball/total').send({ pinsKnockedDown: 4 });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.total).toBe(4);
  });

  it('should return error for invalid input (negative)', async () => {
    const response = await request(app).post('/api/ball/total').send({ pinsKnockedDown: -1 });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid number of pins');
  });

  it('should return error for invalid input (greater than 10)', async () => {
    const response = await request(app).post('/api/ball/total').send({ pinsKnockedDown: 11 });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid number of pins');
  });
});

describe('POST /api/roll', () => {
  it('should return a numeric roll from the pinsetter API', async () => {
    axios.get.mockResolvedValue({ data: '7' });

    const response = await request(app).post('/api/roll').send({ id: 'game-123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ roll: 7, ended: false });
    expect(axios.get).toHaveBeenCalledWith(
      'http://pinsetter.herokuapp.com/pinsetter/?action=roll&id=game-123'
    );
  });

  it('should return ended=true when the pinsetter API returns a period', async () => {
    axios.get.mockResolvedValue({ data: '.' });

    const response = await request(app).post('/api/roll').send({ id: 'game-123' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ roll: '.', ended: true });
  });

  it('should return error when game id is missing', async () => {
    const response = await request(app).post('/api/roll').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing game id');
  });
});