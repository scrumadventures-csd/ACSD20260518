const axios = require('axios');
const registerGame = require('../registerGame');

jest.mock('axios');

describe('registerGame', () => {
  it('registers a new game with 1 frame, 10 pins, 1 roll, test=2', async () => {
    axios.get.mockResolvedValue({ data: { success: true, gameId: 'abc123' } });

    const result = await registerGame({
      frames: 1,
      pins: 10,
      rolls: 1,
      test: '2',
    });

    expect(result).toEqual({ success: true, gameId: 'abc123' });
    expect(axios.get).toHaveBeenCalledWith(
      'http://pinsetter.herokuapp.com/pinsetter/?action=register&frames=1&pins=10&rolls=1&test=2'
    );
  });
});
