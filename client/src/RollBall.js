import React, { useEffect, useMemo, useState } from 'react';
import './RollBall.css';

function RollBall({ game }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolls, setRolls] = useState([]);
  const [ended, setEnded] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);

  const rollsPerFrame = Number(game?.rolls) || 2;
  const frames = Number(game?.frames) || 10;
  const bowlerName = game?.bowler || 'Bowler 1';
  const maxRolls = frames * rollsPerFrame;

  useEffect(() => {
    setRolls([]);
    setError(null);
    setLoading(false);
    setEnded(false);
    setLastRoll(null);
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
    if (rolls.length >= maxRolls || ended) {
      setError('All ball for this game have been rolled.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: game?.gameId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.roll === '.') {
        setEnded(true);
        setLastRoll('.');
        setError('Game ended. No more rolls are available.');
      } else {
        setRolls((prevRolls) => [...prevRolls, data.roll]);
        setLastRoll(data.roll);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rollBall">
      <h3>Roll ball</h3>
      <div className="game-info">
        <span>Bowler: {bowlerName}</span>
        <span>Frames: {frames}</span>
        <span>Rolls per frame: {rollsPerFrame}</span>
      </div>
      <form onSubmit={handleRoll} className="roll-form">
        <button type="submit" disabled={loading || rolls.length >= maxRolls || ended}>
          {loading ? 'Rolling...' : ended ? 'Game ended' : 'Roll next ball'}
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

export default RollBall;
