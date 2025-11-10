const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');
const playerSelect = document.getElementById('playerSelect');

let board = ['', '', '', '', '', '', '', '', ''];
let human = 'X';
let ai = 'O';
let gameOver = false;

function renderBoard(){
  boardEl.innerHTML = '';
  board.forEach((cell, idx) => {
    const div = document.createElement('div');
    div.className = 'cell' + (cell ? ' disabled' : '');
    div.dataset.idx = idx;
    div.textContent = cell;
    div.addEventListener('click', onCellClick);
    boardEl.appendChild(div);
  });
}

function onCellClick(e){
  if (gameOver) return;
  const idx = parseInt(e.currentTarget.dataset.idx);

  if (board[idx] !== '') return;

  board[idx] = human;
  renderBoard();

  const winner = checkWinnerClient(board);
  if (winner){
    endGame(winner);
    return;
  }

  fetch('/ai_move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board })
  })
  .then(r => r.json())
  .then(data => {
    setTimeout(() => {
      if (data.move !== null && data.move !== undefined){
        board[data.move] = ai;
        renderBoard();
        const winner2 = checkWinnerClient(board);
        if (winner2) endGame(winner2);
      } else if (data.winner){
        endGame(data.winner);
      }
    }, Math.random() * 300 + 100);
  })
  .catch(err => {
    console.error(err);
    messageEl.textContent = 'Server error';
  });
}

function checkWinnerClient(b){
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b1,c] of combos){
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  if (!b.includes('')) return 'Tie';
  return null;
}

function endGame(winner){
  gameOver = true;
  if (winner === 'Tie') messageEl.textContent = `It's a tie!`;
  else if (winner === human) messageEl.textContent = `You won! 🎉`;
  else messageEl.textContent = `AI wins - better luck next time.`;
}

restartBtn.addEventListener('click', () => {
  resetGame();
});

playerSelect.addEventListener('change', () => {
  human = playerSelect.value;
  ai = (human === 'X') ? 'O' : 'X';
  resetGame();
});

function resetGame(){
  board = ['', '', '', '', '', '', '', '', ''];
  gameOver = false;
  messageEl.textContent = '';
  renderBoard();

if (human === 'O'){
  fetch('/ai_move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board })
  })
  .then(r => r.json())
  .then(data => {
    setTimeout(() => {
      if (data.move !== null && data.move !== undefined){
        board[data.move] = ai;
        renderBoard();
      }
    }, Math.random() * 300 + 100);
  });
}

}

renderBoard();
