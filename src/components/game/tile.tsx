"use client";

import type { Tile as TileType } from "@/lib/scrabble";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const tileVariants = cva(
  "flex flex-col items-center justify-center font-bold rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] transition-all select-none",
  {
    variants: {
      variant: {
        rack: "w-10 h-10 md:w-12 md:h-12 bg-primary cursor-grab active:cursor-grabbing",
        board: "w-full h-full aspect-square bg-primary",
        move: "w-full h-full aspect-square bg-accent text-accent-foreground animate-in fade-in zoom-in-50",
      },
    },
    defaultVariants: {
      variant: "board",
    },
  }
);


export interface TileProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tileVariants> {
  tile: TileType;
}

export function Tile({ tile, variant, className, ...props }: TileProps) {
  return (
    <div className={cn(tileVariants({ variant }), className)} {...props}>
      <span className="text-xl md:text-2xl leading-none">{tile.letter}</span>
      <span className="text-[10px] md:text-xs leading-none absolute bottom-1 right-1">{tile.value}</span>
    </div>
  );
}
