# **App Name**: Shifting Maze

## Core Features:

- Grid Display: Display a 3x3 grid of tiles.
- Tile Toggling: Allow users to toggle individual tiles between red and green states via click.
- Adjacent Toggle: After each tile toggle, use an LLM tool to randomly choose and toggle one adjacent tile.
- Rule Mutation: After each tile toggle, use an LLM tool to mutate the game rules, such as changing the affected tiles, direction of toggle, or toggle behavior.
- Rule Change Notification: Provide a visual indicator or messaging to the user about rule changes, to signal that the nature of the game has changed.
- Reset Game: Provide reset button that allows user to restart the game with the initial rules.
- Move counter: Track number of moves the user has made.

## Style Guidelines:

- Primary color: Purple (#800080) to evoke a sense of mystery and the shifting nature of the game.
- Background color: Light gray (#E0E0E0), for a clean, neutral backdrop that keeps the focus on the puzzle.
- Accent color: Cyan (#00FFFF) to highlight interactive elements and indicate state changes.
- Body and headline font: 'Inter' (sans-serif), offering a modern, neutral, readable style appropriate to both headlines and body text.
- Simple, geometric icons for the reset button and other interactive elements, if applicable.
- Center the grid on the screen, ensuring it remains the focal point. Keep all supplementary controls (reset button, move counter) minimal and unobtrusive.
- Use subtle transitions and animations when tiles toggle or rules change to provide visual feedback without being distracting.