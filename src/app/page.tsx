"use client";

import { useState } from "react";
import { GameUI } from "@/components/game/game-ui";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  if (gameStarted) {
    return <GameUI />;
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <div className="flex items-center space-x-4">
          <Logo className="h-24 w-24 text-primary" />
          <div>
            <h1 className="font-headline text-6xl md:text-8xl font-bold text-foreground">
              Lexical Duel
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mt-2">The ultimate two-player word challenge.</p>
          </div>
        </div>

        <div className="bg-card p-8 rounded-lg border shadow-lg max-w-md w-full">
          <h2 className="font-headline text-2xl font-semibold mb-4 text-center">Welcome, Challenger!</h2>
          <p className="text-muted-foreground mb-6">
            Engage in a battle of wits and vocabulary. Place your tiles, form words, and outscore your opponent on the classic 15x15 board. Are you ready to prove your lexical prowess?
          </p>
          <Button
            onClick={() => setGameStarted(true)}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
          >
            Start New Game
          </Button>
        </div>
      </div>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>Lexical Duel - A modern take on a classic word game.</p>
      </footer>
    </main>
  );
}
