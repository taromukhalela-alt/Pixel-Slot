# Pixel Slot Studio

I built Pixel Slot Studio as a Flask-powered web slots game with persistent accounts, difficulty-based progression, leaderboards, and polished player profiles. I wanted it to feel playful and fast in the browser while still keeping all important game logic on the server.

I also made this on a 4GB RAM Intel Celeron Mercer Windows tablet that is actually running Arch Linux with the ML4W dotfiles, which is a big part of why I kept the stack lightweight and practical.

## What I Built

- A browser-based 3x3 slot machine with smooth reel animation
- Secure registration, login, logout, and session-based authentication
- Persistent SQLite storage for users, spins, profiles, cosmetics, and rankings
- Three locked-in difficulty classes: Easy, Medium, and Hard
- A unified leaderboard system with Easy, Medium, Hard, and Global boards
- A profile system with editable identity, badges, unlocks, and custom uploads
- A creator page that introduces me, Taro Mukhalela, and links out to my platforms

## Difficulty System

### Easy

- Starts with a high cap and a fixed `A` chance of `1 in 1000`
- Winning can raise the cap
- Losing reduces the deposit cap by half of the total amount bet

### Medium

- Starts with a `R1000` max deposit limit
- Uses a pity mechanic that improves `A` odds over time when spins lose
- Resets pity odds when the deposit cap increases
- Applies a `1.2x` boost to cap growth during win streaks

### Hard

- Starts and stays capped at `R200`
- Uses a fixed `A` chance of `1 in 10`
- Consecutive `A` rows unlock the special banner status
- Bankruptcy applies a leaderboard score penalty based on rank position

## Leaderboards

I rank players by:

`total deposit score + (wins / total games)`

The app exposes four leaderboard views:

- Global
- Easy
- Medium
- Hard

Each board shows the top 100 players with their deposit score, lucky ratio, unlucky ratio, and computed leaderboard score.

## Profiles

- Editable display name and bio
- Custom avatar uploads
- Custom banner uploads
- Preset skins, banners, and profile avatars
- Top 10 global unlocks for elite cosmetics
- Server-calculated badges for luck, unlucky runs, long-term play, hard mode, rank, and `A` streaks

## Tech Stack

- Python 3
- Flask
- SQLite
- Vanilla HTML
- Vanilla CSS
- Vanilla JavaScript

## Project Structure

```text
.
├── .venv
├── main.py
├── README.md
├── slots.db
└── web
    ├── app.js
    ├── creator.html
    ├── index.html
    ├── leaderboard.html
    ├── leaderboard.js
    ├── profile.html
    ├── profile.js
    ├── styles.css
    ├── theme.js
    └── uploads
```

## Running It Locally

I run it like this:

```bash
.venv/bin/python main.py
```

Then I open:

```text
http://127.0.0.1:8000
```

## Notes

- All money values in the game are fictional play money, not real currency.
- All RNG, odds, cap checks, balance updates, and leaderboard scoring happen on the server.
- The database is stored locally in `slots.db`.
- Uploaded profile images are stored in `web/uploads`.

## License

This project is licensed under the MIT License. See [LICENSE](/home/valtos/python%20project/LICENSE).
