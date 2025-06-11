import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { matchThree } from '../types/match_three';

interface SolanaContextType {
  connection: Connection | null;
  program: Program<matchThree> | null;
  gameAccount: PublicKey | null;
  initializeGame: () => Promise<void>;
  updateScore: (score: number) => Promise<void>;
  completeLevel: () => Promise<void>;
}

const SolanaContext = createContext<SolanaContextType | null>(null);

export const SolanaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [program, setProgram] = useState<Program<matchThree> | null>(null);
  const [gameAccount, setGameAccount] = useState<PublicKey | null>(null);

  useEffect(() => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const newConnection = new Connection(endpoint, 'confirmed');
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (publicKey && connection) {
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction: signTransaction!,
          signAllTransactions: signAllTransactions!,
        },
        { commitment: 'confirmed' }
      );

      // Initialize program
      const programId = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
      const newProgram = new Program(IDL, programId, provider);
      setProgram(newProgram);

      // Find game account
      const [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('game'), publicKey.toBuffer()],
        programId
      );
      setGameAccount(gamePda);
    }
  }, [publicKey, connection]);

  const initializeGame = async () => {
    if (!program || !publicKey || !gameAccount) return;

    try {
      await program.methods
        .initializeGame()
        .accounts({
          game: gameAccount,
          player: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  };

  const updateScore = async (score: number) => {
    if (!program || !publicKey || !gameAccount) return;

    try {
      await program.methods
        .updateScore(new BN(score))
        .accounts({
          game: gameAccount,
          player: publicKey,
        })
        .rpc();
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const completeLevel = async () => {
    if (!program || !publicKey || !gameAccount) return;

    try {
      await program.methods
        .completeLevel()
        .accounts({
          game: gameAccount,
          player: publicKey,
        })
        .rpc();
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  return (
    <SolanaContext.Provider
      value={{
        connection,
        program,
        gameAccount,
        initializeGame,
        updateScore,
        completeLevel,
      }}
    >
      {children}
    </SolanaContext.Provider>
  );
};

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}; 