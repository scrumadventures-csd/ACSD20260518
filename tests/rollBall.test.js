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

  it('should call pinsetter twice for two balls in one frame and total 6 pins', async () => {
    axios.get
      .mockResolvedValueOnce({ data: '2' })
      .mockResolvedValueOnce({ data: '4' });

    const response1 = await request(app).post('/api/roll').send({ id: 'game-123' });
    const response2 = await request(app).post('/api/roll').send({ id: 'game-123' });

    expect(response1.statusCode).toBe(200);
    expect(response1.body).toEqual({ roll: 2, ended: false });
    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual({ roll: 4, ended: false });
    expect(app.sumRolls([response1.body.roll, response2.body.roll])).toBe(6);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'http://pinsetter.herokuapp.com/pinsetter/?action=roll&id=game-123'
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
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