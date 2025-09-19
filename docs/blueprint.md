# **App Name**: Lexical Duel

## Core Features:

- Game Server: A central server manages the game state: the board, tile bag, player racks, scores, and timer, while enforcing all core Scrabble rules, and handling multiple concurrent games. This does not require a database, as the application will reset all the game data when the server shuts down.
- Real-Time Updates: Uses server-sent events (SSE) to ensure the client-side interfaces of the 2 players are kept in sync.
- Move Validation: Client-side validations and warnings will inform the user if the turn is invalid due to invalid tile, word off board, or missing starting point. Server uses dictionary CSW24.txt to assess move validity.
- AI Opponent: The server will include a simple AI bot that plays valid moves within 30 seconds using a set of tools including word lists and move generators. Support multiple concurrent games against the bot.
- Board Interaction: Client can click on the board to select the starting square and toggle the word direction. User can also type letters from the rack to place tiles, including blank tile assignment via Shift+Letter; Auto-skip occupied squares.
- Rack Management: Users will have the option to drag-and-drop tiles on the rack and to shuffle the rack. They can also exchange tiles by typing 'X' or via a button.
- Game Timer: Implement server-side timer, displaying remaining time on client-side, synced with the server; when a player’s time expires, they automatically lose.

## Style Guidelines:

- Primary color: Warm tan (#E0C9A6) evokes a classic, tactile feel, like the wooden Scrabble tiles. This hue is associated with history, tradition, and comfort.
- Background color: Light tan (#F5F0E1), similar to the primary color but much lighter and more desaturated, provides a subtle, warm backdrop that doesn't distract from the game.
- Accent color: Muted olive green (#A3B18A) to highlight interactive elements like buttons and selected tiles; analogous to tan but provides enough contrast for visibility.
- Font pairing: 'Playfair' (serif) for headings and titles to convey elegance and readability; 'PT Sans' (sans-serif) for body text to maintain clarity in-game information and instructions.
- Use minimalist, outlined icons for actions like shuffling the rack or exchanging tiles. Ensure icons are intuitive and blend well with the overall warm, inviting design.
- Visually divide the interface into three sections: the game board, each player's tile rack, and a side panel for scores and actions. This keeps the main elements organized and immediately accessible.
- Use subtle, brief transitions and fades when tiles are placed or moved to acknowledge each action. Tile placements and scoring events on the game board are smoothly animated to avoid distracting the user.