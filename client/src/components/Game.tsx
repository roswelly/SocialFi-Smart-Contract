import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolana } from '../contexts/SolanaContext';
import { GameState } from '../types';

const Game: React.FC = () => {
  const { publicKey } = useWallet();
  const { initializeGame, updateScore, completeLevel, gameAccount } = useSolana();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    isGameOver: false,
    isPaused: false
  });

  useEffect(() => {
    if (publicKey && gameAccount) {
      initializeGame();
    }
  }, [publicKey, gameAccount]);

  const handleMatch = (points: number) => {
    const newScore = gameState.score + points;
    setGameState(prev => ({ ...prev, score: newScore }));
    updateScore(newScore);
  };

  const handleLevelComplete = () => {
    setGameState(prev => ({ ...prev, level: prev.level + 1 }));
    completeLevel();
  };

  if (!publicKey) {
    return (
      <div className="game-container">
        <h2>Connect your wallet to play</h2>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>Level {gameState.level}</h2>
        <p>Score: {gameState.score}</p>
      </div>
      <div className="game-board">
        {/* Game board implementation */}
      </div>
      <div className="game-controls">
        <button onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}>
          {gameState.isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default Game; 