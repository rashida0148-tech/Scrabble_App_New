"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import { GameBoard } from "./board";
import { PlayerRack } from "./rack";
import { GameControls } from "./controls";
import type { GameState, Tile, Square, MoveTile, Player } from "@/lib/scrabble";
import { createInitialBoard, createTileBag, TILE_DISTRIBUTION, BOARD_SIZE, calculateScore, PREMIUM_SQUARES } from "@/lib/scrabble";
import { useToast } from "@/hooks/use-toast";
import { suggestMoveAction } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const initialGameState: GameState = {
  board: createInitialBoard(),
  tileBag: [],
  players: [
    { id: 1, name: 'Player 1', rack: [], score: 0, timeLeft: 600 },
    { id: 2, name: 'Player 2', rack: [], score: 0, timeLeft: 600 },
  ],
  currentPlayerId: 1,
  gameStatus: 'active',
  turnHistory: [],
};

type GameAction =
  | { type: 'INITIALIZE_GAME' }
  | { type: 'SET_SELECTED_SQUARE'; payload: { x: number; y: number } | null }
  | { type: 'SET_DIRECTION'; payload: 'horizontal' | 'vertical' }
  | { type: 'ADD_TILE_TO_MOVE'; payload: { tile: Tile; x: number; y: number } }
  | { type: 'REMOVE_LAST_TILE_FROM_MOVE' }
  | { type: 'CLEAR_MOVE' }
  | { type: 'SUBMIT_MOVE' }
  | { type: 'PASS_TURN' }
  | { type: 'SHUFFLE_RACK' }
  | { type: 'DECREMENT_TIMER' };


function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      let newTileBag = createTileBag();
      const players = state.players.map(p => ({ ...p, rack: [] }));

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 7; j++) {
          const tileIndex = Math.floor(Math.random() * newTileBag.length);
          players[i].rack.push(newTileBag.splice(tileIndex, 1)[0]);
        }
      }

      return {
        ...state,
        tileBag: newTileBag,
        players,
        board: createInitialBoard(),
        currentPlayerId: 1,
        gameStatus: 'active',
        turnHistory: [],
      };
    }
    
    case 'SUBMIT_MOVE': {
        if (state.currentMove.length === 0) return state;

        // Basic validation
        const isFirstMove = state.turnHistory.length === 0;
        if (isFirstMove && !state.currentMove.some(m => m.x === 7 && m.y === 7)) {
            // This should be handled with a toast in the component
            return state;
        }

        const { score, wordsInfo } = calculateScore(state.currentMove, state.board);
        if (score === 0 || wordsInfo.some(w => !w.valid)) {
            // Invalid move
            return state;
        }

        let newBoard = JSON.parse(JSON.stringify(state.board));
        state.currentMove.forEach(move => {
            newBoard[move.y][move.x].tile = move.tile;
        });

        const newPlayers = [...state.players];
        const playerIndex = newPlayers.findIndex(p => p.id === state.currentPlayerId);
        if (playerIndex === -1) return state;

        newPlayers[playerIndex].score += score;
        
        let newTileBag = [...state.tileBag];
        const tilesToDraw = state.currentMove.length;
        const newRack = newPlayers[playerIndex].rack.filter(rackTile => 
            !state.currentMove.some(moveTile => moveTile.tile === rackTile)
        );

        for (let i = 0; i < tilesToDraw && newTileBag.length > 0; i++) {
            const tileIndex = Math.floor(Math.random() * newTileBag.length);
            newRack.push(newTileBag.splice(tileIndex, 1)[0]);
        }
        
        newPlayers[playerIndex].rack = newRack;

        return {
            ...state,
            board: newBoard,
            players: newPlayers,
            tileBag: newTileBag,
            turnHistory: [...state.turnHistory, { playerId: state.currentPlayerId, move: state.currentMove, score }],
            currentPlayerId: state.currentPlayerId === 1 ? 2 : 1,
            currentMove: [],
            selectedSquare: null,
            direction: 'horizontal',
        };
    }

    case 'PASS_TURN': {
        return {
            ...state,
            currentPlayerId: state.currentPlayerId === 1 ? 2 : 1,
        }
    }
    
    case 'SHUFFLE_RACK': {
        const newPlayers = [...state.players];
        const playerIndex = newPlayers.findIndex(p => p.id === state.currentPlayerId);
        if (playerIndex === -1) return state;

        const shuffledRack = [...newPlayers[playerIndex].rack].sort(() => Math.random() - 0.5);
        newPlayers[playerIndex].rack = shuffledRack;

        return { ...state, players: newPlayers };
    }

    case 'DECREMENT_TIMER': {
      if(state.gameStatus !== 'active') return state;
      const newPlayers = state.players.map(p => {
        if (p.id === state.currentPlayerId && p.timeLeft > 0) {
          return { ...p, timeLeft: p.timeLeft - 1 };
        }
        return p;
      });

      const playerTimedOut = newPlayers.find(p => p.id === state.currentPlayerId && p.timeLeft === 0);
      if (playerTimedOut) {
        return { ...state, players: newPlayers, gameStatus: 'finished' };
      }

      return { ...state, players: newPlayers };
    }


    default:
      return state;
  }
}

export function GameUI() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [selectedSquare, setSelectedSquare] = useState<{x: number, y: number} | null>(null);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [currentMove, setCurrentMove] = useState<MoveTile[]>([]);
  const { toast } = useToast();
  const [isSubmittingHint, setIsSubmittingHint] = useState(false);
  const [hint, setHint] = useState<{move: string, reasoning: string} | null>(null);

  const dispatch = (action: GameAction) => {
    // A simplified synchronous reducer for state updates
    const newState = gameReducer(gameState, action);
    if(action.type === 'INITIALIZE_GAME') {
        setCurrentMove([]);
        setSelectedSquare(null);
    }
    setGameState(newState);
  };

  useEffect(() => {
    dispatch({ type: 'INITIALIZE_GAME' });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prevState => {
        if(prevState.gameStatus !== 'active') {
            clearInterval(timer);
            return prevState;
        }
        const newPlayers = prevState.players.map(p => 
            (p.id === prevState.currentPlayerId && p.timeLeft > 0) ? { ...p, timeLeft: p.timeLeft - 1 } : p
        );
        return {...prevState, players: newPlayers};
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.currentPlayerId, gameState.gameStatus]);

  const handleSquareClick = (square: Square) => {
    if (square.tile) return; // Cannot select occupied square to start a move
    // if a move is in progress, you can only click empty squares adjacent to your move
    if (currentMove.length > 0) {
       const lastMove = currentMove[currentMove.length - 1];
        if (direction === 'horizontal' && square.y === lastMove.y && square.x > lastMove.x) {
             setSelectedSquare({x: square.x, y: square.y});
        } else if (direction === 'vertical' && square.x === lastMove.x && square.y > lastMove.y) {
             setSelectedSquare({x: square.x, y: square.y});
        }
        return;
    }
    setSelectedSquare({x: square.x, y: square.y});
    setDirection('horizontal'); // Default to horizontal
  };
  
  const handleSubmitMove = useCallback(() => {
    if (currentMove.length === 0) {
        toast({ title: "No move", description: "Place some tiles before submitting.", variant: "destructive" });
        return;
    }

    const isFirstMove = gameState.turnHistory.length === 0;
    if (isFirstMove && !currentMove.some(m => m.x === 7 && m.y === 7)) {
        toast({ title: "Invalid first move", description: "The first move must cover the center star.", variant: "destructive" });
        return;
    }

    if (!isFirstMove) {
        const isConnected = currentMove.some(move => {
            const { x, y } = move;
            const neighbors = [
                {nx: x, ny: y - 1},
                {nx: x, ny: y + 1},
                {nx: x - 1, ny: y},
                {nx: x + 1, ny: y},
            ];
            return neighbors.some(({nx, ny}) => 
                nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && gameState.board[ny][nx].tile
            );
        });

        if (!isConnected) {
            toast({ title: "Invalid move", description: "Your word must connect to tiles already on the board.", variant: "destructive" });
            return;
        }
    }

    const { score, wordsInfo } = calculateScore(currentMove, gameState.board);

    if (score === 0 || wordsInfo.some(w => !w.valid)) {
        const invalidWords = wordsInfo.filter(w => !w.valid).map(w => w.word).join(', ');
        toast({ title: "Invalid Word(s)", description: `The following words are not in the dictionary: ${invalidWords}`, variant: "destructive" });
        setCurrentMove([]);
        setSelectedSquare(null);
        return;
    }

    const wordsFormatted = wordsInfo.map(w => `${w.word} (${w.valid ? 'valid' : 'invalid'})`).join(', ');
    toast({ title: "Move Submitted!", description: `You scored ${score} points for: ${wordsFormatted}` });

    let newBoard = JSON.parse(JSON.stringify(gameState.board));
    currentMove.forEach(move => {
        newBoard[move.y][move.x].tile = move.tile;
    });

    const newPlayers = [...gameState.players];
    const playerIndex = newPlayers.findIndex(p => p.id === gameState.currentPlayerId);
    
    newPlayers[playerIndex].score += score;
    
    let newTileBag = [...gameState.tileBag];
    const tilesToDraw = currentMove.length;

    const rackCopy = [...newPlayers[playerIndex].rack];
    const newRack: Tile[] = [];
    
    const usedIndices: Set<number> = new Set();
    currentMove.forEach(m => {
        const indexInRack = rackCopy.findIndex((t, i) => !usedIndices.has(i) && t.letter === m.tile.letter);
        if(indexInRack !== -1) usedIndices.add(indexInRack);
    });

    rackCopy.forEach((t, i) => {
        if(!usedIndices.has(i)) newRack.push(t);
    })

    for (let i = 0; i < tilesToDraw && newTileBag.length > 0; i++) {
        const tileIndex = Math.floor(Math.random() * newTileBag.length);
        newRack.push(newTileBag.splice(tileIndex, 1)[0]);
    }
    
    newPlayers[playerIndex].rack = newRack;

    setGameState({
        ...gameState,
        board: newBoard,
        players: newPlayers,
        tileBag: newTileBag,
        turnHistory: [...gameState.turnHistory, { playerId: gameState.currentPlayerId, move: currentMove, score }],
        currentPlayerId: gameState.currentPlayerId === 1 ? 2 : 1,
    });

    setCurrentMove([]);
    setSelectedSquare(null);
  }, [currentMove, gameState, toast]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitMove();
      return;
    }

    if (!selectedSquare) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newCurrentMove = currentMove.slice(0, -1);
       if (newCurrentMove.length === 0) {
        setSelectedSquare(null);
       }
      setCurrentMove(newCurrentMove);
      return;
    }
    
    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      if (!currentPlayer) return;

      const tileInRackIndex = currentPlayer.rack.findIndex((t, i) => t.letter === letter && !currentMove.some(m => m.tile === t));
      
      if (tileInRackIndex === -1) {
        toast({ title: "Tile not in rack", description: `You do not have the letter '${letter}' available.`, variant: 'destructive' });
        return;
      }
      const tileInRack = currentPlayer.rack[tileInRackIndex];


      let nextX = selectedSquare.x;
      let nextY = selectedSquare.y;

      if (currentMove.length > 0) {
        const lastMove = currentMove[currentMove.length - 1];
        
        if (currentMove.length === 1 && direction === 'vertical') {
          // If only one tile is placed, and we switch to vertical
          nextX = lastMove.x;
          nextY = lastMove.y + 1;
        } else {
            nextX = direction === 'horizontal' ? lastMove.x + 1 : lastMove.x;
            nextY = direction === 'vertical' ? lastMove.y + 1 : lastMove.y;
        }
      }
      
      // Auto-skip occupied squares
      while (nextX < BOARD_SIZE && nextY < BOARD_SIZE && (gameState.board[nextY][nextX].tile || currentMove.some(m => m.x === nextX && m.y === nextY))) {
          if (direction === 'horizontal') nextX++;
          else nextY++;
      }

      if (nextX >= BOARD_SIZE || nextY >= BOARD_SIZE) {
        toast({ title: "Word off board", description: "Your word extends beyond the board.", variant: 'destructive' });
        return;
      }

      setCurrentMove(prev => [...prev, { tile: tileInRack, x: nextX, y: nextY }]);
    }
    
    if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowDown') { 
        e.preventDefault();
        if(currentMove.length > 1) return;
        if(currentMove.length === 1){
            if (e.key === 'ArrowRight' || (e.key === 'Tab' && direction === 'vertical')) {
                setDirection('horizontal');
            } else if (e.key === 'ArrowDown' || (e.key === 'Tab' && direction === 'horizontal')) {
                setDirection('vertical');
            }
        } else {
            setDirection(d => d === 'horizontal' ? 'vertical' : 'horizontal');
        }
    }

  }, [selectedSquare, gameState, direction, currentMove, toast, handleSubmitMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const handlePass = () => {
    setGameState(prev => ({
        ...prev,
        currentPlayerId: prev.currentPlayerId === 1 ? 2 : 1,
    }));
    setCurrentMove([]);
    setSelectedSquare(null);
    toast({title: "Turn Passed", description: `It's now Player ${gameState.currentPlayerId === 1 ? 2 : 1}'s turn.`})
  }

  const handleShuffle = () => {
      const newPlayers = [...gameState.players];
      const playerIndex = newPlayers.findIndex(p => p.id === gameState.currentPlayerId);
      const shuffledRack = [...newPlayers[playerIndex].rack].sort(() => Math.random() - 0.5);
      newPlayers[playerIndex].rack = shuffledRack;
      setGameState({...gameState, players: newPlayers});
      toast({title: "Rack Shuffled!"});
  }
  
  const handleGetHint = async () => {
      setIsSubmittingHint(true);
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
      if(!currentPlayer) return;

      const boardState = gameState.board.map(row => row.map(cell => cell.tile?.letter || '_').join('')).join('\n');
      const playerRack = currentPlayer.rack.map(t => t.letter).join('');
      
      const result = await suggestMoveAction({
          boardState,
          playerRack,
          availableLetters: "", // Simplified for this version
          dictionary: "", // Simplified for this version
      });
      setIsSubmittingHint(false);

      if (result) {
        setHint(result);
      } else {
        toast({ title: "Hint Error", description: "Could not get a hint at this time.", variant: "destructive" });
      }
  }


  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);

  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full lg:w-2/3 flex flex-col items-center gap-6">
        <GameBoard
          board={gameState.board}
          currentMove={currentMove}
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
        />
        {currentPlayer && <PlayerRack rack={currentPlayer.rack} />}
      </div>
      <div className="w-full lg:w-1/3">
        <GameControls
          players={gameState.players}
          currentPlayerId={gameState.currentPlayerId}
          tilesLeft={gameState.tileBag.length}
          onShuffle={handleShuffle}
          onPass={handlePass}
          onSubmit={handleSubmitMove}
          onGetHint={handleGetHint}
          isSubmittingHint={isSubmittingHint}
        />
      </div>
      <AlertDialog open={!!hint} onOpenChange={() => setHint(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">AI Move Suggestion</AlertDialogTitle>
            <AlertDialogDescription>
              Here's a suggestion from our expert AI to help you out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-4 rounded-md space-y-4">
            <div>
              <h4 className="font-bold">Suggested Move:</h4>
              <p className="font-mono text-lg text-primary">{hint?.move}</p>
            </div>
             <div>
              <h4 className="font-bold">Reasoning:</h4>
              <p>{hint?.reasoning}</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setHint(null)}>Got it, thanks!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
