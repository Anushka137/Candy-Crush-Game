document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const scoreDisplay = document.getElementById('score');
    const movesDisplay = document.getElementById('moves');
    const newGameButton = document.getElementById('new-game');
    
    const width = 8;
    const candyColors = ['🍎', '🍇', '🍊', '🍋', '🍒', '🍓'];
    
    let score = 0;
    let moves = 0;
    let candies = [];
    let draggedCandy = null;
    let replacedCandy = null;
    
    // Create board
    function createBoard() {
        candies = [];
        board.innerHTML = '';
        score = 0;
        moves = 0;
        scoreDisplay.textContent = score;
        movesDisplay.textContent = moves;

        board.style.display = "grid";
        board.style.gridTemplateColumns = "repeat(8, 50px)";
        board.style.gridTemplateRows = "repeat(8, 50px)";
        

        
        for (let i = 0; i < width * width; i++) {
            const candy = document.createElement('div');
            candy.classList.add('candy');
            
            // Ensure no matches at the beginning
            let randomColor;
            do {
                randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
            } while (
                // Check horizontal matches
                (i % width > 1 && 
                 candies[i-1]?.textContent === randomColor && 
                 candies[i-2]?.textContent === randomColor) ||
                // Check vertical matches
                (i >= width * 2 && 
                 candies[i-width]?.textContent === randomColor && 
                 candies[i-width*2]?.textContent === randomColor)
            );
            
            candy.textContent = randomColor;
            candy.setAttribute('data-id', i);
            candy.setAttribute('draggable', true);
            
            // Drag events
            candy.addEventListener('dragstart', dragStart);
            candy.addEventListener('dragend', dragEnd);
            candy.addEventListener('dragover', dragOver);
            candy.addEventListener('dragenter', dragEnter);
            candy.addEventListener('dragleave', dragLeave);
            candy.addEventListener('drop', dragDrop);
            
            // Touch events for mobile
            candy.addEventListener('touchstart', touchStart);
            candy.addEventListener('touchmove', touchMove);
            candy.addEventListener('touchend', touchEnd);
            
            board.appendChild(candy);
            candies.push(candy);
        }
    }
    
    // Touch handlers for mobile
    let touchStartX, touchStartY;
    let touchedCandy;
    
    function touchStart(e) {
        e.preventDefault();
        touchedCandy = this;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    
    function touchMove(e) {
        e.preventDefault();
    }
    
    function touchEnd(e) {
        e.preventDefault();
        if (!touchedCandy) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Determine swipe direction
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // Get the id of the touched candy
        const candyId = parseInt(touchedCandy.getAttribute('data-id'));
        
        // Determine the target candy based on swipe direction
        let targetId;
        switch (direction) {
            case 'right':
                targetId = candyId + 1;
                if (candyId % width === width - 1) return; // Right edge
                break;
            case 'left':
                targetId = candyId - 1;
                if (candyId % width === 0) return; // Left edge
                break;
            case 'down':
                targetId = candyId + width;
                if (candyId + width >= width * width) return; // Bottom edge
                break;
            case 'up':
                targetId = candyId - width;
                if (candyId - width < 0) return; // Top edge
                break;
        }
        
        // Find the target candy
        const targetCandy = document.querySelector(`[data-id="${targetId}"]`);
        if (!targetCandy) return;
        
        // Simulate drag and drop
        draggedCandy = touchedCandy;
        replacedCandy = targetCandy;
        
        // Swap candies
        swapCandies();
        
        // Check for matches after swap
        setTimeout(() => {
            checkForMatches();
        }, 300);
        
        touchedCandy = null;
    }
    
    // Drag and drop functions
    function dragStart() {
        draggedCandy = this;
        this.classList.add('dragged');
    }
    
    function dragOver(e) {
        e.preventDefault();
    }
    
    function dragEnter(e) {
        e.preventDefault();
    }
    
    function dragLeave() {
        // Optional: Add visual feedback here
    }
    
    function dragDrop() {
        replacedCandy = this;
    }
    
    function dragEnd() {
        this.classList.remove('dragged');
        
        // Check if the move is valid (adjacent only)
        if (isValidMove()) {
            swapCandies();
            moves++;
            movesDisplay.textContent = moves;
            setTimeout(() => {
                checkForMatches();
            }, 300);
        }
        
        draggedCandy = null;
        replacedCandy = null;
    }
    
    function isValidMove() {
        if (!draggedCandy || !replacedCandy) return false;
        
        const draggedId = parseInt(draggedCandy.getAttribute('data-id'));
        const replacedId = parseInt(replacedCandy.getAttribute('data-id'));
        
        const validMoves = [
            draggedId + 1,       // right
            draggedId - 1,       // left
            draggedId + width,   // down
            draggedId - width    // up
        ];
        
        // Check if candy is at edge
        if (draggedId % width === 0 && replacedId === draggedId - 1) return false; // Left edge
        if (draggedId % width === width - 1 && replacedId === draggedId + 1) return false; // Right edge
        
        return validMoves.includes(replacedId);
    }
    
    function swapCandies() {
        if (!draggedCandy || !replacedCandy) return;
        
        // Swap the content
        const tempContent = draggedCandy.textContent;
        draggedCandy.textContent = replacedCandy.textContent;
        replacedCandy.textContent = tempContent;
    }
    
    // Check for matches
    function checkForMatches() {
        let isMatched = false;
        
        // Check for row matches
        for (let row = 0; row < width; row++) {
            for (let col = 0; col < width - 2; col++) {
                const currentIndex = row * width + col;
                const candy1 = candies[currentIndex];
                const candy2 = candies[currentIndex + 1];
                const candy3 = candies[currentIndex + 2];
                
                if (candy1.textContent === candy2.textContent && 
                    candy1.textContent === candy3.textContent && 
                    candy1.textContent !== '') {
                    
                    candy1.classList.add('matched');
                    candy2.classList.add('matched');
                    candy3.classList.add('matched');
                    
                    score += 30;
                    isMatched = true;
                }
            }
        }
        
        // Check for column matches
        for (let col = 0; col < width; col++) {
            for (let row = 0; row < width - 2; row++) {
                const currentIndex = row * width + col;
                const candy1 = candies[currentIndex];
                const candy2 = candies[currentIndex + width];
                const candy3 = candies[currentIndex + width * 2];
                
                if (candy1.textContent === candy2.textContent && 
                    candy1.textContent === candy3.textContent && 
                    candy1.textContent !== '') {
                    
                    candy1.classList.add('matched');
                    candy2.classList.add('matched');
                    candy3.classList.add('matched');
                    
                    score += 30;
                    isMatched = true;
                }
            }
        }
        
        // Update score
        scoreDisplay.textContent = score;
        
        // Process matched candies after a short delay
        setTimeout(() => {
            document.querySelectorAll('.matched').forEach(candy => {
                candy.classList.remove('matched');
                candy.textContent = '';
            });
            
            // Drop candies and fill in new ones
            moveDown();
            
            // Continue checking for cascading matches
            if (isMatched) {
                setTimeout(() => {
                    checkForMatches();
                }, 500);
            }
        }, 300);
    }
    
    // Drop candies and fill in new ones
    function moveDown() {
        // Check for empty cells from bottom to top
        for (let i = width * width - 1; i >= 0; i--) {
            // If a cell in the first row is empty, fill it with a new candy
            if (i < width && candies[i].textContent === '') {
                candies[i].textContent = candyColors[Math.floor(Math.random() * candyColors.length)];
            }
            
            // If a cell is empty, pull down candies from above
            if (candies[i].textContent === '' && i >= width) {
                // Find the first non-empty cell above
                let j = i - width;
                while (j >= 0) {
                    if (candies[j].textContent !== '') {
                        candies[i].textContent = candies[j].textContent;
                        candies[j].textContent = '';
                        break;
                    }
                    j -= width;
                }
                
                // If all cells above are empty, fill with a new candy
                if (candies[i].textContent === '') {
                    candies[i].textContent = candyColors[Math.floor(Math.random() * candyColors.length)];
                }
            }
        }
    }
    
    // New game button
    newGameButton.addEventListener('click', createBoard);
    
    // Initialize the game
    createBoard();
});