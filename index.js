document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const size = 4;
    let papan = [];
    let current = 0;
    const currentScoreElem = document.getElementById('current');
    let highScore = localStorage.getItem('2048-highScore') || 0;
    const highScoreElem = document.getElementById('skor-tinggi');
    highScoreElem.textContent = highScore;

    const gameOverElem = document.getElementById('game-over');

    function updateScore(value) {
        current += value;
        currentScoreElem.textContent = current;
        if (current > highScore) {
            highScore = current;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore);
        }
    }
    function restartGame() {
        current = 0;
        currentScoreElem.textContent = '0';
        gameOverElem.style.display = 'none';
        initializeGame();
    }

    function initializeGame() {
        papan = [...Array(size)].map(e => Array(size).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    function renderBoard() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const kotak = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = kotak.dataset.value;
                const currentValue = papan[i][j];
                if (currentValue !== 0) {
                    kotak.dataset.value = currentValue;
                    kotak.textContent = currentValue;
                    if (currentValue !== parseInt(prevValue) && !kotak.classList.contains('new-tile')) {
                        kotak.classList.add('merged-tile');
                    }
                } else {
                    kotak.textContent = '';
                    delete kotak.dataset.value;
                    kotak.classList.remove('merged-tile', 'new-tile');
                }
            }
        }

        setTimeout(() => {
            const cells = document.querySelectorAll('.grid-kotak');
            cells.forEach(kotak => {
                kotak.classList.remove('merged-tile', 'new-tile');
            });
        }, 300);
    }

    function placeRandom() {
        const available = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (papan[i][j] === 0) {
                    available.push({ x: i, y: j });
                }
            }
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)];
            papan[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const kotak = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            kotak.classList.add('new-tile');
        }
    }

    function move(direction) {
        let hasChanged = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < size; j++) {
                const column = [...Array(size)].map((_, i) => papan[i][j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++) {
                    if (papan[i][j] !== newColumn[i]) {
                        hasChanged = true;
                        papan[i][j] = newColumn[i];
                    }
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < size; i++) {
                const row = papan[i];
                const newRow = transform(row, direction === 'ArrowLeft');
                if (row.join(',') !== newRow.join(',')) {
                    hasChanged = true;
                    papan[i] = newRow;
                }
            }
        }
        if (hasChanged) {
            placeRandom();
            renderBoard();
            checkGameOver();
        }
    }

    function transform(line, moveTowardsStart) {
        let newLine = line.filter(kotak => kotak !== 0);
        if (!moveTowardsStart) {
            newLine.reverse();
        }
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                updateScore(newLine[i]); 
                newLine.splice(i + 1, 1);
            }
        }
        while (newLine.length < size) {
            newLine.push(0);
        }
        if (!moveTowardsStart) {
            newLine.reverse();
        }
        return newLine;
    }

    function checkGameOver() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (papan[i][j] === 0) {
                    return;
                }
                if (j < size - 1 && papan[i][j] === papan[i][j + 1]) {
                    return;
                }
                if (i < size - 1 && papan[i][j] === papan[i + 1][j]) {
                    return;
                }
            }
        }
        gameOverElem.style.display = 'flex';
    }
    document.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            move(event.key);
        }
    });
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    initializeGame();

});