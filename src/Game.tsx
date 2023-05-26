import React, { useEffect, useState } from 'react';
import './Game.css';

type Cell = {
    row: number;
    col: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborCount: number;
};

type Board = Cell[][];

const Game: React.FC = () => {
    const [board, setBoard] = useState<Board>([]);
    const [gameOver, setGameOver] = useState(true);
    const [gameWon, setGameWon] = useState(false);
    const [gameTimer, setGameTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (gameOver || gameWon) return;
            setGameTimer((prevTime) => prevTime + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const generateBoard = (rows: number, cols: number, mines: number) => {
        const newBoard = [];

        // Implement board generation logic
        for (let row = 0; row < rows; row++) {
            const newRow: Cell[] = [];
            for (let col = 0; col < cols; col++) {
                newRow.push({
                    row,
                    col,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborCount: 0,
                });
            }
            newBoard.push(newRow);
        }

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);
            if (!newBoard[randomRow][randomCol].isMine) {
                newBoard[randomRow][randomCol].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbor counts
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let neighborCount = 0;
                for (let i = -1; i <= 1; i++) {
                    const neighborRow = row + i;
                    if (neighborRow < 0 || neighborRow >= rows) continue;
                    for (let j = -1; j <= 1; j++) {
                        const neighborCol = col + j;
                        if (neighborCol < 0 || neighborCol >= cols) continue;
                        if (i === 0 && j === 0) continue;
                        if (newBoard[neighborRow][neighborCol].isMine) neighborCount++;
                    }
                }
                newBoard[row][col].neighborCount = neighborCount;
            }
        }

        setBoard(newBoard);
    };

    const revealAllNeighbors = (row: number, col: number) => {
        for (let i = -1; i <= 1; i++) {
            const neighborRow = row + i;
            if (neighborRow < 0 || neighborRow >= board.length) continue;
            for (let j = -1; j <= 1; j++) {
                const neighborCol = col + j;
                if (neighborCol < 0 || neighborCol >= board[0].length) continue;
                if (i === 0 && j === 0) continue;
                if (!board[neighborRow][neighborCol].isRevealed) {
                    board[neighborRow][neighborCol].isRevealed = true;
                    if (board[neighborRow][neighborCol].neighborCount === 0) {
                        revealAllNeighbors(neighborRow, neighborCol);
                    }
                }
            }
        }
    };

    const handleCellClick = (row: number, col: number) => {
        if (gameOver) return;
        if (board[row][col].isFlagged) return;

        board[row][col].isRevealed = true;

        // Check if game is over
        if (board[row][col].isMine) {
            setGameOver(true);
            // Reveal all mines
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[0].length; col++) {
                    if (board[row][col].isMine) {
                        board[row][col].isRevealed = true;
                    }
                }
            }
            return;
        }

        // Check if cell is empty
        if (board[row][col].neighborCount === 0) {
            // Reveal all neighbors
            revealAllNeighbors(row, col);
        }

        setBoard([...board]);

        // Check if game is won
        let isGameWon = true;
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[0].length; col++) {
                if (!board[row][col].isRevealed && !board[row][col].isMine) {
                    isGameWon = false;
                }
            }
        }
        if (isGameWon) {
            setGameOver(true);
            setGameWon(true);
        }
    };

    const handleCellFlag = (row: number, col: number) => {
        if (gameOver) return;

        board[row][col].isFlagged = !board[row][col].isFlagged;
        setBoard([...board]);
    };

    const handleNewGame = () => {
        setGameOver(false);
        setGameWon(false);
        setGameTimer(0);
        generateBoard(10, 10, 10);
    };

    return (
        <div>
            <div style={{ marginBottom: 10 }}>
                <div>
                    <h1>Minesweeper</h1>
                    <button onClick={handleNewGame}>New easy game</button>
                </div>
            </div>
            <div>
                {board && board.map((row, rowIndex) =>
                    <div className="cell-row" key={rowIndex}>
                        {row.map((cell, colIndex) =>
                            <div
                                key={rowIndex * row.length + colIndex}
                                className={["cell",
                                    cell.isRevealed && "isRevealed",
                                    cell.isRevealed && cell.isMine && "isMine",
                                    cell.isFlagged && "isFlagged"
                                ].filter(s => !!s).join(' ')}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    handleCellFlag(rowIndex, colIndex);
                                }}
                                tabIndex={rowIndex * row.length + colIndex}
                            >
                                {cell.isRevealed ? (
                                    cell.isMine ? (
                                        <span role="img" aria-label="mine">
                                            💣
                                        </span>
                                    ) : (
                                        cell.neighborCount
                                    )
                                ) : cell.isFlagged ? (
                                    <span role="img" aria-label="flag">
                                        🚩
                                    </span>
                                ) : null}
                            </div>

                        )}
                    </div>
                )}

            </div>
            <div>
                <div>
                    {gameOver && <h2>Game over!</h2>}
                    {gameWon && <h2>You won!</h2>}
                    {gameTimer > 0 && <p>Time: {gameTimer}s</p>}
                </div>
            </div>
            <div>
                <div >
                    <h3>How to play</h3>
                    <p>
                        Click on a cell to reveal it. If it is a mine, you lose. If it is empty, it will reveal all of its neighbors.
                        Right click on a cell to flag it. Flag all of the mines to win.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Game;