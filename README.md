# Python Slot Machine

A simple command-line slot machine game built in Python. Players deposit funds, choose how many lines to bet on, place a per-line wager, and spin a 3x3 slot machine to try to win based on matching symbols across active lines.

## Features

- Command-line gameplay with interactive prompts
- Adjustable betting across 1 to 3 lines
- Balance tracking across multiple rounds
- Weighted symbol pool for varied spin outcomes
- Payout calculation based on symbol value and active betting lines

## How It Works

The game starts by asking the player to deposit money. On each round, the player:

1. Chooses how many lines to bet on
2. Sets a bet amount per line
3. Spins the slot machine
4. Receives winnings if matching symbols appear across a selected line

The game continues until the player quits, and the final balance is shown at the end.

## Tech Stack

- Python 3
- Standard library only (`random`)

## Project Structure

```text
.
├── main.py
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or newer recommended

### Run Locally

```bash
python main.py
```

If your system uses `python3` instead of `python`, run:

```bash
python3 main.py
```

## Gameplay Rules

- The slot machine uses a 3x3 grid
- You can bet on 1 to 3 lines
- The minimum bet per line is `R1`
- The maximum bet per line is `R100`
- A winning line is one where all symbols match across the row
- Winnings are calculated as:

```text
symbol value x bet per line
```

### Symbol Values

| Symbol | Count | Value |
| --- | ---: | ---: |
| A | 2 | 5 |
| B | 4 | 4 |
| C | 6 | 3 |
| D | 8 | 2 |

## Example

```text
Current balance is R100
Press enter to spin(q to quit).
Enter the number of lines to bet on (1-3)3
What would you like to bet? R10
You are betting R10 on 3 lines. Total is equal to:  R30
A | B | D
A | B | C
A | B | D
You won R50
You won on: 1
```

## Notes

- This project is a console-based learning project and does not include a graphical user interface
- No third-party packages are required

## Future Improvements

- Add automated tests
- Separate game logic from input/output for easier maintenance
- Package the project for cleaner distribution
- Add configurable symbols, payouts, and machine dimensions

## License

This project is licensed under the MIT License. See the [LICENSE](/home/valtos/python%20project/LICENSE) file for details.
