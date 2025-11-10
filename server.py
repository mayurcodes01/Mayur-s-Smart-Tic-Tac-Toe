
from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)


winning_combinations = [
    (0,1,2), (3,4,5), (6,7,8),
    (0,3,6), (1,4,7), (2,5,8),
    (0,4,8), (2,4,6)
]


def check_winner(board):
    for a,b,c in winning_combinations:
        if board[a] != '' and board[a] == board[b] == board[c]:
            return board[a]
    if '' not in board:
        return 'Tie'
    return None


def minimax(board, depth, is_maximizing):
    winner = check_winner(board)
    if winner == 'O':
        return 10 - depth
    elif winner == 'X':
        return depth - 10
    elif winner == 'Tie':
        return 0

    if is_maximizing:
        best_score = -math.inf
        for i in range(9):
            if board[i] == '':
                board[i] = 'O'
                score = minimax(board, depth+1, False)
                board[i] = ''
                if score > best_score:
                    best_score = score
        return best_score
    else:
        best_score = math.inf
        for i in range(9):
            if board[i] == '':
                board[i] = 'X'
                score = minimax(board, depth+1, True)
                board[i] = ''
                if score < best_score:
                    best_score = score
        return best_score


def best_move(board):
    best_score = -math.inf
    move = None
    for i in range(9):
        if board[i] == '':
            board[i] = 'O'
            score = minimax(board, 0, False)
            board[i] = ''
            if score > best_score:
                best_score = score
                move = i
    return move


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/ai_move', methods=['POST'])
def ai_move():
    data = request.get_json()
    board = data.get('board')
    if not isinstance(board, list) or len(board) != 9:
        return jsonify({'error': 'Invalid board'}), 400

    if check_winner(board) is not None:
        return jsonify({'move': None, 'winner': check_winner(board)})

    move = best_move(board)
    return jsonify({'move': move, 'winner': check_winner(board)})


if __name__ == '__main__':
    app.run(debug=True)
