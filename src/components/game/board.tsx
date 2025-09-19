"use client";

import type { Board, Square, MoveTile } from "@/lib/scrabble";
import { cn } from "@/lib/utils";
import { Tile } from "@/components/game/tile";
import { Star } from "lucide-react";

type GameBoardProps = {
  board: Board;
  currentMove: MoveTile[];
  selectedSquare: { x: number; y: number } | null;
  onSquareClick: (square: Square) => void;
};

export function GameBoard({ board, currentMove, selectedSquare, onSquareClick }: GameBoardProps) {
  const isSquareInCurrentMove = (x: number, y: number) => {
    return currentMove.some(move => move.x === x && move.y === y);
  }

  const getTileForSquare = (square: Square) => {
    const moveTile = currentMove.find(move => move.x === square.x && move.y === square.y);
    if (moveTile) {
      return moveTile.tile;
    }
    return square.tile;
  }

  const getPremiumSquareClasses = (square: Square) => {
    if (square.x === 7 && square.y === 7) return "bg-primary/80";
    switch (square.multiplierType) {
      case 'word':
        return square.multiplier === 3 ? "bg-red-500/80" : "bg-pink-400/80";
      case 'letter':
        return square.multiplier === 3 ? "bg-blue-600/80" : "bg-blue-300/80";
      default:
        return "bg-secondary";
    }
  };
  
  const getPremiumSquareLabel = (square: Square) => {
    if (square.tile) return null;
    if (square.x === 7 && square.y === 7) return <Star className="h-6 w-6 text-primary-foreground/70" />;
    switch (square.multiplierType) {
      case 'word':
        return square.multiplier === 3 ? "TW" : "DW";
      case 'letter':
        return square.multiplier === 3 ? "TL" : "DL";
      default:
        return null;
    }
  };

  return (
    <div className="aspect-square w-full max-w-full grid grid-cols-15 rounded-md border-4 border-card p-1.5 bg-card shadow-lg">
      {board.map((row, y) =>
        row.map((square, x) => {
          const tile = getTileForSquare(square);
          const inMove = isSquareInCurrentMove(x, y);
          
          return (
            <div
              key={`${x}-${y}`}
              onClick={() => onSquareClick(square)}
              className={cn(
                "aspect-square flex items-center justify-center relative select-none rounded-[2px] transition-all",
                tile ? "bg-primary" : getPremiumSquareClasses(square),
                !tile && "hover:bg-opacity-100 hover:scale-105 cursor-pointer",
                selectedSquare?.x === x && selectedSquare?.y === y && "ring-4 ring-accent ring-inset z-10"
              )}
            >
              {tile ? (
                <Tile
                  tile={tile}
                  variant={inMove ? 'move' : 'board'}
                  data-x={x}
                  data-y={y}
                />
              ) : (
                <span className="font-headline text-xs md:text-sm font-bold text-primary-foreground/50">
                  {getPremiumSquareLabel(square)}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// Add this to tailwind.config.ts content if not present
// For the JIT compiler to recognize the grid-cols-15 class
// content: ['./src/**/*.{js,ts,jsx,tsx}'],
// theme: {
//   extend: {
//     gridTemplateColumns: {
//       '15': 'repeat(15, minmax(0, 1fr))',
//     }
//   }
// }
