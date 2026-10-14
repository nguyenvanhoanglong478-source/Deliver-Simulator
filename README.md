# Be The Driver (Deliver Simulator)

A retro 8-bit motorbike delivery-driver simulation that runs entirely in the browser. No install, no framework: plain HTML, CSS and JavaScript built into a single file.

**Goal:** save 100 million VND within 24 in-game months while still paying your monthly living costs.

## How to play

Open `index.html` in a browser. Progress is saved in `localStorage`.

- **Orders:** each turn offers 3 orders (food or goods, near / medium / far, optionally rush). Far orders pay more but cost stamina, fuel and time. Re-rolling the offers costs 8 seconds.
- **Mini-games:** catch falling packages (20 s), dodge obstacles on a 3-lane road (tap a lane, use ◀ ▶ or the arrow keys), or play **Route Rush**: a route of 5 turns (◀ ▲ ▶) is shown for 3 seconds, then the bike drives itself and you must steer the right way at each junction before it arrives. Wrong or missed turns cost 2 s; with the GPS upgrade the next 3 turns stay visible, and peak hours and rush orders shorten the time per junction. Rush orders get less time.
- **Driving speed:** slow (fewer accidents, extra time), normal, or fast (quicker, but riskier and more likely to be fined). Older bikes break down more often.
- **Day cycle:** a game day runs from 06:00 to 22:00 (300 real seconds). Peak hours (11-13h and 17-19h) pay more but traffic jams are twice as likely.
- **Upgrades with trade-offs:** the two delivery bags and the two engines are mutually exclusive; GPS and insurance carry monthly fees.
- **Milestones:** saving 25 / 50 / 75 million pays a bonus and unlocks new upgrades.
- **Month end:** a bonus based on completed orders and star rating. The end screen shows where your money went.
- **Resources:** manage stamina, fuel and bike durability. Refuel with a slider; the price depends on the percentage added.
- **Savings:** deposited money earns 0.2% interest per day.
- **Tutorial:** a short 5-card guide appears on the first start and from the pause menu. Switching to another browser tab pauses the game automatically.
- **Pause:** use the ⏸ button (bottom left) or press `P` / `Esc`. The day clock and mini-game timers stop and resume without losing time.
- **Driver profile:** click the avatar to edit your name, hobbies and hat colour, and to see your star rating and customer reviews. Cancelled orders produce no review.
- **Reviews:** when the game runs inside Claude (as an artifact), each review can be written by Claude based on your hobbies. Everywhere else, 56 built-in reviews are used.
- **Music:** the start screen loops one track; in game, 4 tracks play in a playlist that advances and wraps around automatically. Browsers need a first tap before audio can play. The speaker button (bottom right) opens sound settings: music on/off, previous/next track and volume (remembered between sessions).

## Project structure

- `index.html`: the packaged game, one self-contained file.
- `src/`: source files (`style.css`, `icons.js`, `audio.js`, `profile.js`, `logic.js`, `render.js`, `bike.png`, `music.mp3`, `track1-4.mp3`).
- `build.py`: assembles `src/` into `index.html` (`python3 build.py`).
- `tests/`: browser tests using Playwright (`pip install playwright && playwright install chromium`). Run each file separately:
  `python3 tests/test_gameplay.py`, `test_save_load.py`, `test_features.py`, `test_audio.py`, `test_pause.py`, `test_ux.py`, `test_route.py`.
- `CHANGELOG.md`: history of changes and current settings.

Fonts (VT323, Press Start 2P) are loaded from Google Fonts; offline, the game falls back to a monospace font.

## Music credits

Tracks were supplied by the project owner and compressed to 64-80 kbps so they can be embedded in `index.html`. Start screen: "8-Bit Retro Game Music" (MoodMode). In game: "Waiting Time" (Lesiakower), "8-Bit Retro" (Mondamusic), "Game 8-Bit On" (MoodMode), "I Love My 8-Bit Game Console" (DJARTMUSIC).
