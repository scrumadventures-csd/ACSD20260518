import React, { useState } from 'react';
import './RegisterGame.css';
import RollBall from './RollBall';

function RegisterGame() {
  const [bowler, setBowler] = useState('');
  const [frames, setFrames] = useState(10);
  const [pins, setPins] = useState(10);
  const [rolls, setRolls] = useState(2);
  const [test, setTest] = useState('');
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGame(null);

    try {
      const response = await fetch('/api/registerGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bowler, frames, pins, rolls, test }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const gameId = data?.gameId ?? data?.id ?? data;
      setGame({ gameId, bowler, frames, pins, rolls, test });
      setBowler(bowler);
      setFrames(frames);
      setPins(pins);
      setRolls(rolls);
      setTest(test);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="RegisterGame">
      <h2>Register New Game</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="bowler">Bowler:</label>
          <input
            id="bowler"
            type="text"
            value={bowler}
            onChange={(e) => setBowler(e.target.value)}
            placeholder="Enter bowler name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="frames">Frames:</label>
          <input
            id="frames"
            type="number"
            value={frames}
            onChange={(e) => setFrames(Number(e.target.value))}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pins">Pins:</label>
          <input
            id="pins"
            type="number"
            value={pins}
            onChange={(e) => setPins(Number(e.target.value))}
            min="1"
            max="10"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="rolls">Rolls:</label>
          <input
            id="rolls"
            type="number"
            value={rolls}
            onChange={(e) => setRolls(Number(e.target.value))}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="test">Test Sequence (optional, e.g. 1-2-3-4-5-6-7-8-9/X12):</label>
          <input
            id="test"
            type="text"
            value={test}
            onChange={(e) => setTest(e.target.value)}
            placeholder="e.g., 1-2-3-4-5-6-7-8-9/X12"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Game'}
        </button>
      </form>

      {error && <div className="error-message">Error: {error}</div>}

      {game && (
        <div className="result-message">
          <h3>Game Registered Successfully</h3>
          <p>Registered Game ID: <strong>{game.gameId || game.id || 'Unknown'}</strong></p>
        </div>
      )}

      {game && <RollBall game={game} />}
    </div>
  );
}

export default RegisterGame;
