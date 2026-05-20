const request = require('supertest');
const app = require('../rollBalls');

describe('POST /api/ball/total', () => {
  it('should return total pins knocked down for valid input', async () => {
    const response = await request(app).post('/api/ball/total').send({ pinsKnockedDown: 2 });
//    console.log(response);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.total).toBe(2);
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