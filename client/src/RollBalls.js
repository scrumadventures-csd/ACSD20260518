import React, { useEffect, useMemo, useState } from 'react';
import './RollBalls.css';

function RollBalls({ game }) {
  const [pinsKnockedDown, setPinsKnockedDown] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolls, setRolls] = useState([]);

  const rollsPerFrame = Number(game?.rolls) || 2;
  const frames = Number(game?.frames) || 10;
  const bowlerName = game?.bowler || 'Bowler 1';
  const maxRolls = frames * rollsPerFrame;

  useEffect(() => {
    setRolls([]);
    setPinsKnockedDown(0);
    setError(null);
    setLoading(false);
  }, [game]);

  const scoreRows = useMemo(() => {
    const rows = [];
    let runningTotal = 0;

    rolls.forEach((pins, index) => {
      runningTotal += pins;
      rows.push({
        bowler: bowlerName,
        frame: Math.min(Math.floor(index / rollsPerFrame) + 1, frames),
        ball: (index % rollsPerFrame) + 1,
        total: runningTotal,
      });
    });

    return rows;
  }, [rolls, rollsPerFrame, frames, bowlerName]);

  const handleRoll = async (event) => {
    event.preventDefault();
    if (rolls.length >= maxRolls) {
      setError('All balls for this game have been rolled.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ball/total', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinsKnockedDown }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRolls((prevRolls) => [...prevRolls, data.total]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="RollBalls">
      <h3>Roll Balls</h3>
      <div className="game-info">
        <span>Bowler: {bowlerName}</span>
        <span>Frames: {frames}</span>
        <span>Rolls per frame: {rollsPerFrame}</span>
      </div>
      <form onSubmit={handleRoll} className="roll-form">
        <div className="form-group">
          <label htmlFor="pinsKnockedDown">Pins knocked down:</label>
          <input
            id="pinsKnockedDown"
            type="number"
            min="0"
            max="10"
            value={pinsKnockedDown}
            onChange={(e) => setPinsKnockedDown(Number(e.target.value))}
            required
          />
        </div>

        <button type="submit" disabled={loading || rolls.length >= maxRolls}>
          {loading ? 'Rolling...' : 'Roll next ball'}
        </button>
      </form>

      {error && <div className="error-message">Error: {error}</div>}

      <div className="score-sheet-wrapper">
        <h4>Score Sheet</h4>
        <table className="score-sheet">
          <thead>
            <tr>
              <th>Bowler</th>
              <th>Frame</th>
              <th>Ball</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {scoreRows.length > 0 ? (
              scoreRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.bowler}</td>
                  <td>{row.frame}</td>
                  <td>{row.ball}</td>
                  <td>{row.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-state">
                  No rolls yet. Roll the first ball to populate the score sheet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="roll-summary">
        <p>Total rolls: {rolls.length} / {maxRolls}</p>
        <p>Cumulative score: {scoreRows.length ? scoreRows[scoreRows.length - 1].total : 0}</p>
      </div>
    </div>
  );
}

export default RollBalls;
