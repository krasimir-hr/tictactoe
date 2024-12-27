const Gameboard = (() => {
   const board = Array(9).fill(null);

   const setCell = (index, player) => {
      console.log(`Attempting to set cell ${index} for ${player}`);
      
      if (!board[index]) {
         board[index] = player;
         return true;
      }
      return false;
   }

   const getBoard = () => board;

   const reset = () => {
      for (let i = 0; i < board.length; i++) {
         board[i] = null;
      }
   }

   return { setCell, getBoard, reset }
})();

const DisplayController = (() => {
   const gameBoardElement = document.getElementById("gameBoard");
   const statusElement = document.getElementById("status");

   const renderScores = () => {
      const scores = PlayerController.getPlayerScores();
      const playerXScoreElement = document.querySelector('.player__score.x .score');
      const playerOScoreElement = document.querySelector('.player__score.o .score');

      playerXScoreElement.textContent = scores.playerXScore;
      playerOScoreElement.textContent = scores.playerOScore;
   }

   const renderPlayerNames = () => {
      const playerNames = PlayerController.getPlayerNames();
      const playerXElement = document.querySelector('.player__x');
      const playerOElement = document.querySelector('.player__o');

      console.log(playerNames);
      
      playerXElement.textContent = playerNames.playerX;
      playerOElement.textContent = playerNames.playerO;
   }

   const renderBoard = (board) => {
      gameBoardElement.innerHTML = '';
      board.forEach((cell, index) => {
         const cellElement = document.createElement('div');
         cellElement.classList.add('cell');

         if (cell) {
            cellElement.textContent = cell;
            cellElement.classList.add(cell.toLowerCase());
            cellElement.classList.add('taken');
         }

         cellElement.dataset.index = index;
         gameBoardElement.appendChild(cellElement)
      });
      GameController.enableBoard();
   };

   const updateStatus = (message) => {
      statusElement.textContent = message;
   };

   return { renderBoard, updateStatus, renderPlayerNames, renderScores }
})();

const GameController = (() =>{
   let currentPlayer = 'x';

   const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7 ,8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
   ];

   const checkWin = (board) => {
      for (let combination of winningCombinations) {
         if (combination.every(index => board[index] === currentPlayer)) {
            return combination;
         }
      }
      return null;
   };

   const checkDraw = (board) => {
      return board.every(cell => cell !== null);
   }

   const handleCellClick = (e) => {
      const index = e.target.dataset.index;
      const board = Gameboard.getBoard();    

      if (Gameboard.setCell(index, currentPlayer)) {
         DisplayController.renderBoard(board);
         const winningCombination = checkWin(board);

         if (winningCombination) {
            const playerNames = PlayerController.getPlayerNames();
            const winner = currentPlayer === 'X' ? playerNames.playerX : playerNames.playerO;

            PlayerController.incrementPlayerScores(currentPlayer);
            DisplayController.updateStatus(`Player ${winner} wins!`)
            DisplayController.renderScores();
            disableBoard();
         } else if (checkDraw(board)) {
            DisplayController.updateStatus('It\'s a draw!');
            disableBoard();
         } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            const playerNames = PlayerController.getPlayerNames();
            const currentName = currentPlayer === 'X' ? playerNames.playerX : playerNames.playerO;

            DisplayController.updateStatus(`It's ${currentName}'s turn`)
            console.log('Current player after move:', currentPlayer);
         }
      } else {
         console.log('Cell is already filled.');
         
      }

   };

   const handleMouseEnter = (e) => {
      if (!e.target.textContent) {
         e.target.textContent = currentPlayer;
         e.target.classList.add('preview');
         e.target.classList.add(currentPlayer.toLowerCase())
      }
   }

   const handleMouseLeave = (e) => {
      if (!e.target.classList.contains('taken')) {
         e.target.textContent = '';
         e.target.classList.remove('preview');
         e.target.classList.remove(currentPlayer.toLowerCase())
      }
   }

   const disableBoard = () => {
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
         cell.removeEventListener('mouseenter', handleMouseEnter);
         cell.removeEventListener('mouseleave', handleMouseLeave);
         cell.removeEventListener('click', handleCellClick) 
      });
   };

   const enableBoard = () => {
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
         cell.addEventListener('mouseenter', handleMouseEnter);
         cell.addEventListener('mouseleave', handleMouseLeave); 
         });
      cells.forEach(cell => cell.addEventListener('click', handleCellClick));
   }

   const startGame = () => {
      Gameboard.reset();
      currentPlayer = 'X';

      const playerXInput = document.getElementById('xPlayerName').value;
      const playerOInput = document.getElementById('oPlayerName').value;

      PlayerController.setPlayerNames(playerXInput, playerOInput);
      DisplayController.renderPlayerNames();

      const playerNames = PlayerController.getPlayerNames();
      DisplayController.updateStatus(`It's ${playerNames.playerX}'s turn.`)
      DisplayController.renderBoard(Gameboard.getBoard());
      enableBoard();
   };

   const startNewGame = () => {
      Gameboard.reset();
      currentPlayer = 'O';

      const playerNames = PlayerController.getPlayerNames();
      DisplayController.updateStatus(`It's ${playerNames.playerX}'s turn.`)
      DisplayController.renderBoard(Gameboard.getBoard());
      enableBoard();
   }

   return { startGame, enableBoard, startNewGame };
})();

const PlayerController = (() => {
   let playerXName;
   let playerOname;
   let playerXScore = 0;
   let playerOScore = 0;

   const setPlayerNames = (xName, oName) => {
      playerXName = xName;
      playerOname = oName;
   };

   const getPlayerNames = () => ({
      playerX: playerXName,
      playerO: playerOname,
   });

   const getPlayerScores = () => ({
      playerXScore,
      playerOScore,
   });

   const incrementPlayerScores = (player) => {
      if (player === 'X') {
         playerXScore += 1;
      } else if (player === 'O') {
         playerOScore += 1;
      }
   };

   return { setPlayerNames, getPlayerNames, getPlayerScores, incrementPlayerScores };
})();

const AppController = (() => {
   const init = () => {
      const startButton = document.getElementById('startButton');
      startButton.addEventListener('click', (event) => {
         event.preventDefault();

         const playerXInput = document.getElementById('xPlayerName').value;
         const playerOInput = document.getElementById('oPlayerName').value;

         if (!playerXInput || !playerOInput) {
            alert("Both player names are required!");
            return
         };

         hideNamesWrapper();
         showGameWrapper();
         GameController.startGame();
      });
   };

   const hideNamesWrapper = () => {
      document.querySelector('.names__wrapper').style.display = 'none';
   }

   const showGameWrapper = () => {
      document.querySelector('.game__wrapper').style.display = 'flex';
   };

   const newGameButton = document.getElementById('newGameButton');
   newGameButton.addEventListener('click', () => {
      GameController.startNewGame();
   })

   return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
   AppController.init();
});