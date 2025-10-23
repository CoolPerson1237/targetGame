// Game variables
        let score = 0;
        let gameContainer;
        let scoreText;
        let rings = [];

        // Initialize game when scene loads
        document.addEventListener('DOMContentLoaded', function() {
            gameContainer = document.querySelector('#gameContainer');
            scoreText = document.querySelector('#scoreText');
            
            // Start spawning rings
            spawnRing();
            
            // Spawn a new ring every 3 seconds
            setInterval(spawnRing, 3000);
        });

        function spawnRing() {
            // Create ring element
            const ring = document.createElement('a-entity');
            ring.setAttribute('mixin', 'ring');
            
            // Random position around the player (but not too close or far)
            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = 4 + Math.random() * 6; // Distance between 4-10 units
            const height = -1 + Math.random() * 4; // Height between -1 and 3
            
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
            
            // Remove ring after 8 seconds if not collected
            setTimeout(() => {
                if (ring.parentNode) {
                    removeRing(ring);
                }
            }, 8000);
        }

        function collectRing(ring) {
            // Increase score
            score += 10;
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

        // Component to make elements respond to cursor
        AFRAME.registerComponent('cursor-listener', {
            init: function () {
                this.el.addEventListener('mouseenter', function (evt) {
                    evt.target.setAttribute('material', 'color: #ffaa00');
                });
                
                this.el.addEventListener('mouseleave', function (evt) {
                    evt.target.setAttribute('material', 'color: #00ff88');
                });
            }
        });
