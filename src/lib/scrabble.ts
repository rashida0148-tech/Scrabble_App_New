import { dictionary } from './dictionary';

// All type definitions for the Scrabble game
export type Tile = { letter: string; value: number };
export type MoveTile = { tile: Tile, x: number, y: number };
export type Square = { tile: Tile | null; multiplier: number; multiplierType: 'letter' | 'word' | null; x: number, y: number, label: string | null };
export type Board = Square[][];
export type Player = { id: number; name: string; rack: Tile[]; score: number; timeLeft: number };
export type GameState = {
  board: Board;
  tileBag: Tile[];
  players: Player[];
  currentPlayerId: number;
  gameStatus: 'waiting' | 'active' | 'finished';
  turnHistory: any[];
  // For client-side state not part of the core game state
  selectedSquare?: { x: number; y: number } | null;
  direction?: 'horizontal' | 'vertical';
  currentMove?: MoveTile[];
};

// Game Constants
export const BOARD_SIZE = 15;

export const TILE_DISTRIBUTION: Record<string, { value: number; count: number }> = {
  'A': { value: 1, count: 9 }, 'B': { value: 3, count: 2 }, 'C': { value: 3, count: 2 },
  'D': { value: 2, count: 4 }, 'E': { value: 1, count: 12 }, 'F': { value: 4, count: 2 },
  'G': { value: 2, count: 3 }, 'H': { value: 4, count: 2 }, 'I': { value: 1, count: 9 },
  'J': { value: 8, count: 1 }, 'K': { value: 5, count: 1 }, 'L': { value: 1, count: 4 },
  'M': { value: 3, count: 2 }, 'N': { value: 1, count: 6 }, 'O': { value: 1, count: 8 },
  'P': { value: 3, count: 2 }, 'Q': { value: 10, count: 1 }, 'R': { value: 1, count: 6 },
  'S': { value: 1, count: 4 }, 'T': { value: 1, count: 6 }, 'U': { value: 1, count: 4 },
  'V': { value: 4, count: 2 }, 'W': { value: 4, count: 2 }, 'X': { value: 8, count: 1 },
  'Y': { value: 4, count: 2 }, 'Z': { value: 10, count: 1 },
  // 'BLANK': { value: 0, count: 2 } // Blank tiles logic is complex, omitting for now.
};

export const PREMIUM_SQUARES: { pos: [number, number][], multiplier: number, type: 'word' | 'letter', label: string }[] = [
    { pos: [[0,0], [0,7], [0,14], [7,0], [7,14], [14,0], [14,7], [14,14]], multiplier: 3, type: 'word', label: 'TW' },
    { pos: [[1,1], [2,2], [3,3], [4,4], [1,13], [2,12], [3,11], [4,10], [10,4], [11,3], [12,2], [13,1], [13,13], [12,12], [11,11], [10,10]], multiplier: 2, type: 'word', label: 'DW' },
    { pos: [[1,5], [1,9], [5,1], [5,5], [5,9], [5,13], [9,1], [9,5], [9,9], [9,13], [13,5], [13,9]], multiplier: 3, type: 'letter', label: 'TL' },
    { pos: [[0,3], [0,11], [2,6], [2,8], [3,0], [3,7], [3,14], [6,2], [6,6], [6,8], [6,12], [7,3], [7,11], [8,2], [8,6], [8,8], [8,12], [11,0], [11,7], [11,14], [12,6], [12,8], [14,3], [14,11]], multiplier: 2, type: 'letter', label: 'DL' },
];

// Utility Functions
export const createTileBag = (): Tile[] => {
  const bag: Tile[] = [];
  for (const letter in TILE_DISTRIBUTION) {
    const tileInfo = TILE_DISTRIBUTION[letter];
    for (let i = 0; i < tileInfo.count; i++) {
      bag.push({ letter, value: tileInfo.value });
    }
  }
  return bag;
};

export const createInitialBoard = (): Board => {
  const board = Array(BOARD_SIZE).fill(null).map((_, y) => 
    Array(BOARD_SIZE).fill(null).map((_, x) => ({
      tile: null,
      multiplier: 1,
      multiplierType: null,
      x,
      y,
      label: null,
    }))
  );

  PREMIUM_SQUARES.forEach(premium => {
    premium.pos.forEach(([x, y]) => {
      board[y][x].multiplier = premium.multiplier;
      board[y][x].multiplierType = premium.type;
      board[y][x].label = premium.label;
    });
  });
  
  // Center star is a DW
  board[7][7] = { ...board[7][7], multiplier: 2, multiplierType: 'word', label: '★' };

  return board;
};

// Word validation and score calculation
export const calculateScore = (move: MoveTile[], board: Board): { score: number, wordsInfo: {word: string, valid: boolean}[] } => {
    if (move.length === 0) return { score: 0, wordsInfo: [] };

    // Create a temporary board with the new move to analyze words
    const tempBoard: (Tile | null)[][] = board.map(row => row.map(sq => sq.tile));
    move.forEach(m => {
        tempBoard[m.y][m.x] = m.tile;
    });
    
    const words: { word: string, tiles: { tile: Tile, x: number, y: number }[] }[] = [];
    const mainWordTiles: { tile: Tile, x: number, y: number }[] = [];

    const isHorizontal = move.length > 1 ? move[0].y === move[1].y : (
        move.length === 1 && (
            (move[0].x > 0 && tempBoard[move[0].y][move[0].x - 1]) ||
            (move[0].x < BOARD_SIZE - 1 && tempBoard[move[0].y][move[0].x + 1])
        )
    );
    
    if (move.length > 1) { // A multi-tile move forms one main word
      if (isHorizontal) {
          let startX = Math.min(...move.map(m => m.x));
          while(startX > 0 && tempBoard[move[0].y][startX - 1]) {
              startX--;
          }
          let x = startX;
          let mainWord = '';
          while(x < BOARD_SIZE && tempBoard[move[0].y][x]) {
              const tile = tempBoard[move[0].y][x]!;
              mainWord += tile.letter;
              mainWordTiles.push({tile, x, y: move[0].y});
              x++;
          }
          if (mainWord.length > 1) {
              words.push({ word: mainWord, tiles: mainWordTiles });
          }
      } else { // Vertical
          let startY = Math.min(...move.map(m => m.y));
          while(startY > 0 && tempBoard[startY - 1][move[0].x]) {
              startY--;
          }
          let y = startY;
          let mainWord = '';
          while(y < BOARD_SIZE && tempBoard[y][move[0].x]) {
              const tile = tempBoard[y][move[0].x]!;
              mainWord += tile.letter;
              mainWordTiles.push({tile, x: move[0].x, y});
              y++;
          }
          if (mainWord.length > 1) {
              words.push({ word: mainWord, tiles: mainWordTiles });
          }
      }
    }

    // Find perpendicular words for each tile in the move
    move.forEach(m => {
        const perpWordTiles: { tile: Tile, x: number, y: number }[] = [];
        if (isHorizontal) { // Check for vertical words
            let startY = m.y;
            while(startY > 0 && tempBoard[startY - 1][m.x]) {
                startY--;
            }
            let y = startY;
            let perpWord = '';
            while(y < BOARD_SIZE && tempBoard[y][m.x]) {
                const tile = tempBoard[y][m.x]!;
                perpWord += tile.letter;
                perpWordTiles.push({tile, x: m.x, y});
                y++;
            }
            if (perpWord.length > 1) {
                words.push({ word: perpWord, tiles: perpWordTiles });
            }
        } else { // Check for horizontal words
            let startX = m.x;
            while(startX > 0 && tempBoard[m.y][startX - 1]) {
                startX--;
            }
            let x = startX;
            let perpWord = '';
            while(x < BOARD_SIZE && tempBoard[m.y][x]) {
                const tile = tempBoard[m.y][x]!;
                perpWord += tile.letter;
                perpWordTiles.push({tile, x, y: m.y});
                x++;
            }
            if (perpWord.length > 1) {
                words.push({ word: perpWord, tiles: perpWordTiles });
            }
        }
    });

    if (words.length === 0 && move.length > 0) {
        // Handle single-letter move that extends existing words
        // This case is implicitly handled by the perpendicular check now.
        // If a single letter is placed, it must form a word with adjacent letters.
        // The above logic will find that word.
        // Let's add a failsafe for a single tile placed with no adjacent tiles on the cross-axis
        if (isHorizontal) {
             let startX = move[0].x;
            while(startX > 0 && tempBoard[move[0].y][startX - 1]) startX--;
            let x = startX;
            let currentWord = '';
            let currentTiles: MoveTile[] = [];
             while(x < BOARD_SIZE && tempBoard[move[0].y][x]) {
                const tile = tempBoard[move[0].y][x]!;
                currentWord += tile.letter;
                currentTiles.push({tile, x, y: move[0].y});
                x++;
            }
            if(currentWord.length > 1) words.push({word: currentWord, tiles: currentTiles});
        } else {
             let startY = move[0].y;
            while(startY > 0 && tempBoard[startY-1][move[0].x]) startY--;
            let y = startY;
            let currentWord = '';
            let currentTiles: MoveTile[] = [];
             while(y < BOARD_SIZE && tempBoard[y][move[0].x]) {
                const tile = tempBoard[y][move[0].x]!;
                currentWord += tile.letter;
                currentTiles.push({tile, x: move[0].x, y});
                y++;
            }
            if(currentWord.length > 1) words.push({word: currentWord, tiles: currentTiles});
        }
    }
    
    const uniqueWords = Array.from(new Set(words.map(w => w.word)))
        .map(wordStr => words.find(w => w.word === wordStr)!);

    let totalScore = 0;
    const wordsInfo = uniqueWords.map(w => ({ word: w.word, valid: dictionary.has(w.word.toUpperCase()) }));

    if (wordsInfo.length > 0 && wordsInfo.every(w => w.valid)) {
        uniqueWords.forEach(wordObj => {
            let wordScore = 0;
            let wordMultiplier = 1;

            wordObj.tiles.forEach(t => {
                const square = board[t.y][t.x];
                let letterScore = t.tile.value;
                
                // Apply multiplier only if the tile is part of the current move
                if (move.some(m => m.x === t.x && m.y === t.y)) {
                    if (square.multiplierType === 'letter') {
                        letterScore *= square.multiplier;
                    }
                    if (square.multiplierType === 'word') {
                        wordMultiplier *= square.multiplier;
                    }
                }
                wordScore += letterScore;
            });
            totalScore += wordScore * wordMultiplier;
        });

        // Bingo bonus for using all 7 tiles
        if (move.length === 7) {
            totalScore += 50;
        }
    } else {
      if(wordsInfo.length === 0 && move.length > 0) return { score: 0, wordsInfo: [{word: move.map(m => m.tile.letter).join(''), valid: false}] }; // No words formed
    }

    return { score: totalScore, wordsInfo };
};
