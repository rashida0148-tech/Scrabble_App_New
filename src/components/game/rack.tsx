"use client";

import type { Tile as TileType } from "@/lib/scrabble";
import { Tile } from "@/components/game/tile";
import { Card, CardContent } from "@/components/ui/card";

type PlayerRackProps = {
  rack: TileType[];
};

export function PlayerRack({ rack }: PlayerRackProps) {
  return (
    <Card className="w-full shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-center items-center gap-1 md:gap-2">
          {rack.map((tile, index) => (
            <Tile key={`${tile.letter}-${index}`} tile={tile} variant="rack" />
          ))}
          {Array.from({ length: 7 - rack.length }).map((_, index) => (
             <div key={`empty-${index}`} className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
