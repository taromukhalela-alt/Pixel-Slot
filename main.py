import json
import random
import threading
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


MAX_LINES = 3
MAX_BET = 100
MIN_BET = 1
ROWS = 3
COLS = 3

SYMBOL_COUNT = {
    "A": 2,
    "B": 4,
    "C": 6,
    "D": 8,
}

SYMBOL_VALUE = {
    "A": 35,
    "B": 25,
    "C": 15,
    "D": 5,
}

WEB_DIR = Path(__file__).parent / "web"


def check_winnings(columns, lines, bet, values):
    winnings = 0
    winning_lines = []
    for line in range(lines):
        symbol = columns[0][line]
        for column in columns:
            if symbol != column[line]:
                break
        else:
            winnings += values[symbol] * bet
            winning_lines.append(line + 1)
    return winnings, winning_lines


def get_slot_machine_spin(rows, cols, symbols):
    all_symbols = []
    for symbol, count in symbols.items():
        for _ in range(count):
            all_symbols.append(symbol)

    columns = []
    for _ in range(cols):
        column = []
        current_symbols = all_symbols[:]
        for _ in range(rows):
            value = random.choice(current_symbols)
            current_symbols.remove(value)
            column.append(value)
        columns.append(column)
    return columns


class SlotMachineSession:
    def __init__(self):
        self.lock = threading.Lock()
        self.balance = 250
        self.last_spin = [["A"] * ROWS for _ in range(COLS)]
        self.last_win = 0
        self.last_net = 0
        self.winning_lines = []
        self.status = "Ready for a fresh spin."

    def snapshot(self):
        return {
            "balance": self.balance,
            "lastSpin": self.last_spin,
            "lastWin": self.last_win,
            "lastNet": self.last_net,
            "winningLines": self.winning_lines,
            "status": self.status,
            "limits": {
                "minBet": MIN_BET,
                "maxBet": MAX_BET,
                "maxLines": MAX_LINES,
            },
        }

    def add_funds(self, amount):
        with self.lock:
            if amount <= 0:
                raise ValueError("Deposit amount must be greater than zero.")
            self.balance += amount
            self.status = f"Added R{amount}. Balance is now R{self.balance}."
            return self.snapshot()

    def spin(self, lines, bet):
        with self.lock:
            if not 1 <= lines <= MAX_LINES:
                raise ValueError(f"Lines must be between 1 and {MAX_LINES}.")
            max_bet_for_round = min(MAX_BET, self.balance // lines) if self.balance > 0 else 0
            if max_bet_for_round < MIN_BET:
                raise ValueError(f"You need at least R{MIN_BET * lines} to play {lines} lines.")
            if not MIN_BET <= bet <= max_bet_for_round:
                raise ValueError(
                    f"Bet amount must be between R{MIN_BET} and R{max_bet_for_round} for {lines} lines."
                )

            total_bet = lines * bet
            if total_bet > self.balance:
                raise ValueError(f"Total bet R{total_bet} is higher than your balance R{self.balance}.")

            columns = get_slot_machine_spin(ROWS, COLS, SYMBOL_COUNT)
            winnings, winning_lines = check_winnings(columns, lines, bet, SYMBOL_VALUE)
            net = winnings - total_bet

            self.balance += net
            self.last_spin = columns
            self.last_win = winnings
            self.last_net = net
            self.winning_lines = winning_lines
            if winnings:
                self.status = f"You won R{winnings}. Net change: R{net}."
            else:
                self.status = f"No line match this round. Net change: R{net}."

            state = self.snapshot()
            state["bet"] = {
                "lines": lines,
                "betPerLine": bet,
                "total": total_bet,
            }
            return state


SESSION = SlotMachineSession()


class SlotMachineHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/state":
            self._send_json(SESSION.snapshot())
            return
        if parsed.path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path not in {"/api/deposit", "/api/spin"}:
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")
            return

        try:
            payload = self._read_json()
            if parsed.path == "/api/deposit":
                state = SESSION.add_funds(int(payload.get("amount", 0)))
            else:
                state = SESSION.spin(
                    lines=int(payload.get("lines", 0)),
                    bet=int(payload.get("bet", 0)),
                )
        except ValueError as exc:
            self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
            return
        except json.JSONDecodeError:
            self._send_json({"error": "Request body must be valid JSON."}, status=HTTPStatus.BAD_REQUEST)
            return

        self._send_json(state)

    def log_message(self, format, *args):
        return

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b"{}"
        return json.loads(body.decode("utf-8"))

    def _send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 8000), SlotMachineHandler)
    print("Serving Pixel Slot Studio at http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
