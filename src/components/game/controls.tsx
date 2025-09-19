"use client";

import type { Player } from "@/lib/scrabble";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shuffle, SkipForward, Send, Lightbulb, Repeat } from "lucide-react";

type GameControlsProps = {
  players: Player[];
  currentPlayerId: number;
  tilesLeft: number;
  onShuffle: () => void;
  onPass: () => void;
  onSubmit: () => void;
  onGetHint: () => void;
  isSubmittingHint: boolean;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function GameControls({
  players,
  currentPlayerId,
  tilesLeft,
  onShuffle,
  onPass,
  onSubmit,
  onGetHint,
  isSubmittingHint,
}: GameControlsProps) {
  return (
    <Card className="w-full h-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-center text-3xl">Game Info</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-[calc(100%-4.5rem)]">
        <div>
          <div className="grid grid-cols-2 gap-4 text-center mb-6">
            {players.map(player => (
              <div key={player.id} className={`p-4 rounded-lg border-2 ${player.id === currentPlayerId ? 'border-accent bg-accent/10' : 'border-transparent'}`}>
                <h3 className="font-bold text-lg text-foreground">{player.name}</h3>
                <p className="text-4xl font-mono font-bold text-primary">{player.score}</p>
                <p className="text-sm text-muted-foreground font-mono">{formatTime(player.timeLeft)}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-muted-foreground">Tiles in Bag</p>
            <p className="text-4xl font-mono font-bold text-foreground">{tilesLeft}</p>
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center text-muted-foreground">Actions</h3>
            <Button onClick={onSubmit} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Send className="mr-2 h-4 w-4" /> Submit Word
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={onShuffle} variant="secondary">
                <Shuffle className="mr-2 h-4 w-4" /> Shuffle
              </Button>
              <Button onClick={onPass} variant="secondary">
                <SkipForward className="mr-2 h-4 w-4" /> Pass
              </Button>
              {/* Feature: Exchange tiles. For now, it's just a placeholder button. */}
               <Button variant="secondary" disabled>
                <Repeat className="mr-2 h-4 w-4" /> Exchange
              </Button>
               <Button onClick={onGetHint} variant="outline" disabled={isSubmittingHint}>
                <Lightbulb className="mr-2 h-4 w-4" /> {isSubmittingHint ? 'Thinking...' : 'Get Hint'}
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
              Lexical Duel v1.0
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
