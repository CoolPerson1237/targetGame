    // Game variables
        let score = 0;
        let gameContainer;
        let scoreText, difficultyText, timeText, gameOverText;
        let rings = [];
        let gameActive = false;
        let gameTimer;
        let spawnTimer;
        let timeRemaining = 0;

        // Difficulty settings
        const difficulties = {
            easy: {
                name: "Easy",
                ringSpeed: 5000,      // Slow rotation (5 seconds)
                spawnRate: 3000,      // New ring every 3 seconds
                points: 10,           // 10 points per ring
                roundTime: 60,        // 60 seconds total
                ringLifetime: 8000    // Rings last 8 seconds
            },
            medium: {
                name: "Medium",
                ringSpeed: 2500,      // Medium rotation (2.5 seconds)
                spawnRate: 2000,      // New ring every 2 seconds
                points: 15,           // 15 points per ring
                roundTime: 45,        // 45 seconds total
                ringLifetime: 6000    // Rings last 6 seconds
            },
            hard: {
                name: "Hard",
                ringSpeed: 1000,      // Fast rotation (1 second)
                spawnRate: 1500,      // New ring every 1.5 seconds
                points: 25,           // 25 points per ring
                roundTime: 30,        // 30 seconds total
                ringLifetime: 4000    // Rings last 4 seconds
            }
        };

        let currentDifficulty = difficulties.easy;

        // Initialize game when scene loads
        document.addEventListener('DOMContentLoaded', function() {
            gameContainer = document.querySelector('#gameContainer');
            scoreText = document.querySelector('#scoreText');
            difficultyText = document.querySelector('#difficultyText');
            timeText = document.querySelector('#timeText');
            gameOverText = document.querySelector('#gameOverText');
            
            showDifficultyMenu();
        });

        function showDifficultyMenu() {
            document.querySelector('#difficultyMenu').setAttribute('visible', 'true');
            gameActive = false;
        }

        function hideDifficultyMenu() {
            document.querySelector('#difficultyMenu').setAttribute('visible', 'false');
        }

        function startGame(difficulty) {
            currentDifficulty = difficulties[difficulty];
            hideDifficultyMenu();
            
            // Reset game state
            score = 0;
            timeRemaining = currentDifficulty.roundTime;
            gameActive = true;
            
            // Clear existing rings
            rings.forEach(ring => removeRing(ring));
            rings = [];
            
            // Update UI
            updateScore();
            updateDifficulty();
            updateTimer();
            gameOverText.setAttribute('visible', 'false');
            
            // Start game timers
            startGameTimer();
            startSpawning();
        }

        function startGameTimer() {
            gameTimer = setInterval(() => {
                timeRemaining--;
                updateTimer();
                
                if (timeRemaining <= 0) {
                    endGame();
                }
            }, 1000);
        }

        function startSpawning() {
            spawnRing(); // Spawn first ring immediately
            spawnTimer = setInterval(spawnRing, currentDifficulty.spawnRate);
        }

        function endGame() {
            gameActive = false;
            clearInterval(gameTimer);
            clearInterval(spawnTimer);
            
            // Clear remaining rings
            rings.forEach(ring => removeRing(ring));
            rings = [];
            
            // Show game over message
            gameOverText.setAttribute('value', `Game Over! Final Score: ${score}`);
            gameOverText.setAttribute('visible', 'true');
            
            // Show difficulty menu again after 3 seconds
            setTimeout(() => {
                gameOverText.setAttribute('visible', 'false');
                showDifficultyMenu();
            }, 3000);
        }

        function spawnRing() {
            if (!gameActive) return;
            
            // Create ring element
            const ring = document.createElement('a-entity');
            ring.setAttribute('mixin', 'ring');
            
            // Add rotation animation based on difficulty
            ring.setAttribute('animation', {
                property: 'rotation',
                to: '0 360 0',
                loop: true,
                dur: currentDifficulty.ringSpeed
            });
            
            // Random position around the player
            const angle = Math.random() * Math.PI * 2;
            const distance = 4 + Math.random() * 6;
            const height = -1 + Math.random() * 4;
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            ring.setAttribute('position', `${x} ${height} ${z}`);
            
            // Make ring clickable
            ring.setAttribute('cursor-listener', '');
            ring.classList.add('clickable');
            
            // Add click event
            ring.addEventListener('click', function() {
                collectRing(ring);
            });
            
            // Add ring to scene and tracking array
            gameContainer.appendChild(ring);
            rings.push(ring);
            
            // Remove ring after lifetime expires
            setTimeout(() => {
                if (ring.parentNode) {
                    removeRing(ring);
                }
            }, currentDifficulty.ringLifetime);
        }

        function collectRing(ring) {
            if (!gameActive) return;
            
            // Increase score based on difficulty
            score += currentDifficulty.points;
            updateScore();
            
            // Play collection animation
            ring.setAttribute('animation__collect', {
                property: 'scale',
                to: '0.1 0.1 0.1',
                dur: 200
            });
            
            // Change color briefly
            ring.setAttribute('material', 'color: #ffff00');
            
            // Remove ring after animation
            setTimeout(() => {
                removeRing(ring);
            }, 200);
        }

        function removeRing(ring) {
            if (ring.parentNode) {
                ring.parentNode.removeChild(ring);
            }
            
            // Remove from tracking array
            const index = rings.indexOf(ring);
            if (index > -1) {
                rings.splice(index, 1);
            }
        }

        function updateScore() {
            scoreText.setAttribute('value', `Score: ${score}`);
        }

        function updateDifficulty() {
            difficultyText.setAttribute('value', `Difficulty: ${currentDifficulty.name}`);
        }

        function updateTimer() {
            timeText.setAttribute('value', `Time: ${timeRemaining}s`);
            
            // Change color based on time remaining
            if (timeRemaining <= 10) {
                timeText.setAttribute('color', 'red');
            } else if (timeRemaining <= 20) {
                timeText.setAttribute('color', 'orange');
            } else {
                timeText.setAttribute('color', 'cyan');
            }
        }

        // Component to make elements respond to cursor
        AFRAME.registerComponent('cursor-listener', {
            init: function () {
                this.el.addEventListener('mouseenter', function (evt) {
                    if (evt.target.classList.contains('clickable')) {
                        evt.target.setAttribute('material', 'color: #ffaa00');
                    } else {
                        // For buttons
                        evt.target.setAttribute('scale', '1.1 1.1 1.1');
                    }
                });
                
                this.el.addEventListener('mouseleave', function (evt) {
                    if (evt.target.classList.contains('clickable')) {
                        evt.target.setAttribute('material', 'color: #00ff88');
                    } else {
                        // For buttons
                        evt.target.setAttribute('scale', '1 1 1');
                    }
                });
            }
        });

        // Component for difficulty selection
        AFRAME.registerComponent('difficulty-selector', {
            schema: {
                level: {type: 'string'}
            },
            init: function () {
                this.el.addEventListener('click', () => {
                    startGame(this.data.level);
                });
            }
        });
