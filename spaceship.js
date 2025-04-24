function showSection(sectionId) {
    // get all sections
    const sections = document.querySelectorAll('.content-section');

    // hide all sections
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // show selected 
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

let gameOver = false; // Flag to track game over state

// show only the welcome section on page load
document.addEventListener('DOMContentLoaded', () => {
    showSection('welcome');
});

// array for signed-up users
const signedUpUsers = [
    { username: "p", password: "testuser" } // default user
];

//  year and day dropdowns
document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('year');
    const daySelect = document.getElementById('day');

    // years 1950 to current year
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // days 1 to 31
    for (let day = 1; day <= 31; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }

    // handle form submission
    const signUpForm = document.getElementById('sign-up-form');
    signUpForm.addEventListener('submit', (event) => {
        event.preventDefault(); // prevent form from refreshing the page

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const passwordVerification = document.getElementById('password-verification').value;
        const name = document.getElementById('name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const year = document.getElementById('year').value;
        const month = document.getElementById('month').value;
        const day = document.getElementById('day').value;

        // validation checks
        if (!username || !password || !passwordVerification || !name || !lastName || !email || !year || !month || !day) {
            alert('All fields must be filled!');
            return;
        }

        if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
            alert('Password must be at least 8 characters long and include both letters and numbers.');
            return;
        }

        if (/\d/.test(name) || /\d/.test(lastName)) {
            alert('Name and Last Name cannot include numbers.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (password !== passwordVerification) {
            alert('Passwords do not match!');
            return;
        }

        if (signedUpUsers.some(user => user.username === username)) {
            alert('This username is already taken. Please choose a different one.');
            return;
        }

        if (signedUpUsers.some(user => user.email === email)) {
            alert('This email is already registered. Please use a different email.');
            return;
        }

        // save user
        signedUpUsers.push({
            username,
            password,
            name,
            lastName,
            email,
            birthday: `${year}-${month}-${day}`
        });

        alert('Sign-up successful!');
        console.log('Signed-up users:', signedUpUsers);

        // clear the form
        signUpForm.reset();
    });

    // handle login form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // prevent form from refreshing the page

        const loginUsername = document.getElementById('login-username').value.trim();
        const loginPassword = document.getElementById('login-password').value;

        // check user exists in the users array
        const user = signedUpUsers.find(user => user.username === loginUsername && user.password === loginPassword);

        if (user) {
            // successful login
            document.getElementById('login-error').style.display = 'none';
            resetScoreboard(); // reset the scoreboard
            currentPlayer = user.username; // set the current player
            showSection('configuration'); // show game screen
        } else {
            // unsuccessful login
            document.getElementById('login-error').style.display = 'block';
        }
    });
});


// open the about 
function openAboutDialog() {
    const aboutModal = document.getElementById('game-dialog');
    aboutModal.showModal(); 
}

// close the about 
function closeDialog() {
    const aboutModal = document.getElementById('game-dialog');
    aboutModal.close(); 
}

// closing the dialog
document.addEventListener('DOMContentLoaded', () => {
    const gameDialog = document.getElementById('game-dialog');
    const closeDialogButton = document.getElementById('close-dialog');

    //  close button
    closeDialogButton.addEventListener('click', closeDialog);

    // close clicking outside of it
    gameDialog.addEventListener('click', (event) => {
        if (event.target === gameDialog) {
            closeDialog();
        }
    });

    // close when pressing the escape 
    gameDialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && gameDialog.open) {
            closeDialog();
        }
    });
});


// handle configuration form 
document.addEventListener('DOMContentLoaded', () => {
    const configurationForm = document.getElementById('configuration-form');
    const gameCanvas = document.getElementById('game-canvas');

    configurationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const shootKey = document.getElementById('shoot-key').value
        const gameTime = parseInt(document.getElementById('game-time').value, 10);

        // Validate shooting key
        if (!/^[a-zA-Z]$/.test(shootKey) && shootKey !== ' ') {
            alert('Please enter a valid shooting key (a single letter or the spacebar).');
            return;
        }

        // validate game time
        if (gameTime < 2 || gameTime > 10) {
            alert('Game time must be between 2 and 10 minutes.');
            return;
        }

        console.log(`Shooting Key: ${shootKey}`);
        console.log(`Game Time: ${gameTime} minutes`);

        // move to game 
        showSection('game-screen');
        startGame(shootKey, gameTime);
    });

    // start the game
    function startGame(shootKey, gameTime) {
        const ctx = gameCanvas.getContext('2d');
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // display game configuration on the canvas
        ctx.font = '20px Arial';
        ctx.fillText(`Shooting Key: ${shootKey}`, 10, 30);
        ctx.fillText(`Game Time: ${gameTime} minutes`, 10, 60);

        // add your game logic here
        console.log('Game started!');
    }
});


// handle the game screen
document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById('game-canvas');
    const ctx = gameCanvas.getContext('2d');
    const canvasWidth = gameCanvas.width;
    const canvasHeight = gameCanvas.height;

    // Load assets
    const backgroundMusic = new Audio('assets/bg_music.mp3');
    backgroundMusic.volume = 0.5; // Set volume to 50%
    backgroundMusic.loop = true;

    const shootSound = new Audio('assets/hero_sound.mp3');
    const explosionSound = new Audio('assets/enemy_dies_sound.mp3');
    const heroDiesSound = new Audio('assets/hero_dies_sound.mp3');

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/bg.jpeg';

    const heroImage = new Image();
    heroImage.src = 'assets/hero.png';

    const enemyImages = [
        'assets/enemy1.png', // Row 1
        'assets/enemy2.png', // Row 2
        'assets/enemy3.png', // Row 3
        'assets/enemy4.png', // Row 4
    ];

    function startGame(shootKey, gameTime) {
        backgroundMusic.play();
    
        // Game variables
        const player = {
            x: canvasWidth / 2 - 25,
            y: canvasHeight - 60,
            width: 50,
            height: 50,
            lives: 3,
            score: 0,
        };
    
        const enemies = [];
        const enemyRows = 4;
        const enemyCols = 5;
        const enemyWidth = 60;
        const enemyHeight = 60;
        const enemyPadding = 20;
        const enemyOffsetTop = 50;
        const enemyOffsetLeft = 50;
        let enemyDirection = 1; // 1 for right, -1 for left
        let enemySpeed = 1;
        let bulletSpeed = 5;
        const maxSpeedMultiplier = 4; // Maximum speed multiplier for enemies
        let speedMultiplier = 1; // Initial speed multiplier for enemies
    
        const bullets = [];
        const enemyBullets = [];
        let lastEnemyBulletTime = 0;
    
        // Add a gameOver flag
        let gameOver = false;
    
        // Timer for game time
        const startTime = Date.now();
        const gameDuration = gameTime * 60 * 1000; // Convert minutes to milliseconds
    
        // Create enemies
        for (let row = 0; row < enemyRows; row++) {
            for (let col = 0; col < enemyCols; col++) {
                const enemyImage = new Image();
                enemyImage.src = enemyImages[row];
                enemies.push({
                    x: enemyOffsetLeft + col * (enemyWidth + enemyPadding),
                    y: enemyOffsetTop + row * (enemyHeight + enemyPadding),
                    width: enemyWidth,
                    height: enemyHeight,
                    image: enemyImage,
                    points: (4 - row) * 5, // Points based on row (Row 4 = 5 points, Row 1 = 20 points)
                });
            }
        }

                // Increase speed every 5 seconds, up to 4 times
        let speedIncrements = 0; // Track the number of speed increases
        const maxSpeedIncrements = 4; // Maximum number of speed increases
        const speedIncreaseInterval = 5000; // Fixed interval of 5 seconds

        const speedIncreaseTimer = setInterval(() => {
            if (speedIncrements < maxSpeedIncrements) {
                speedMultiplier += 1; // Increase speed multiplier
                enemySpeed = 0.8 * speedMultiplier; // Update enemy speed
                bulletSpeed = 1.8 * speedMultiplier; // Update bullet speed
                speedIncrements++; // Increment the counter
                console.log(`Speed increased! Multiplier: ${speedMultiplier}`);
            } else {
                clearInterval(speedIncreaseTimer); // Stop the timer after 4 increments
            }
        }, speedIncreaseInterval);
    
        // Handle player movement
        const keys = {};
        document.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault(); // Prevent arrow keys from scrolling the page
            }
            keys[e.key] = true;
        });

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});
    
        // Handle shooting
        document.addEventListener('keydown', (e) => {
            if (e.key === shootKey && bullets.length < 1) {
                bullets.push({
                    x: player.x + player.width / 2 - 2.5,
                    y: player.y,
                    width: 5,
                    height: 10,
                    color: 'yellow',
                });
                shootSound.play();
            }
        });
    
        // Game loop
        function gameLoop() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime; 
            if (gameOver) return; // Stop the game loop if the game is over
    
            // Check if time is up
            if (elapsedTime >= gameDuration) {
                backgroundMusic.pause();
                const message = player.score < 100
                    ? `You can do better! Your score: ${player.score}`
                    : 'Winner!';
                gameOver = true; // Set gameOver flag to true
                showScoreboard(player.score, message); // Show the scoreboard with the final score and message
                return;
            }

            // Check if all lives are lost
            if (player.lives === 0) {
                backgroundMusic.pause();
                const message = 'You Lost!';
                gameOver = true; // Set gameOver flag to true
                showScoreboard(player.score, message); // Show the scoreboard with the final score and message
                return;
            }
    
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
            // Draw background
            ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    
            // Draw player
            ctx.drawImage(heroImage, player.x, player.y, player.width, player.height);
    
            // Move player
            if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
            if (keys['ArrowRight'] && player.x < canvasWidth - player.width) player.x += 5;
            if (keys['ArrowUp'] && player.y > canvasHeight * 0.6) player.y -= 5;
            if (keys['ArrowDown'] && player.y < canvasHeight - player.height) player.y += 5;
    
            // Draw enemies
            enemies.forEach((enemy) => {
                ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
            });
    
            // Move enemies
            let switchDirection = false;
            enemies.forEach((enemy) => {
                enemy.x += enemySpeed * enemyDirection;
                if (enemy.x + enemy.width > canvasWidth || enemy.x < 0) {
                    switchDirection = true;
                }
            });
            if (switchDirection) {
                enemyDirection *= -1;
                enemies.forEach((enemy) => {
                    enemy.y += 10; // Move down when switching direction
                });
            }

            // Check collision between player and enemies
            enemies.forEach((enemy) => {
                const hitboxMargin = 12; // Reduce the hitbox size by 10 pixels on all sides
                if (
                    player.x + hitboxMargin < enemy.x + enemy.width - hitboxMargin &&
                    player.x + player.width - hitboxMargin > enemy.x + hitboxMargin &&
                    player.y + hitboxMargin < enemy.y + enemy.height - hitboxMargin &&
                    player.y + player.height - hitboxMargin > enemy.y + hitboxMargin
                ) {
                    // Collision detected
                    player.lives -= 1; // Decrease lives
                    heroDiesSound.play();
                    player.x = canvasWidth / 2 - player.width / 2; // Center horizontally at the bottom
                    player.y = canvasHeight - 60; // Reset player position to bottom

                    if (player.lives === 0) {
                        backgroundMusic.pause();
                        const message = 'You Lost!';
                        gameOver = true; // Set gameOver flag to true
                        showScoreboard(player.score, message); // Show the scoreboard with the final score and message
                        return;
                    }
                }
            });
    
            // Draw and move bullets
            bullets.forEach((bullet, index) => {
                bullet.y -= bulletSpeed;
                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
                // Remove bullet if it goes off-screen
                if (bullet.y < 0) {
                    bullets.splice(index, 1);
                }
    
                // Check collision with enemies
                enemies.forEach((enemy, enemyIndex) => {
                    if (
                        bullet.x < enemy.x + enemy.width &&
                        bullet.x + bullet.width > enemy.x &&
                        bullet.y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y
                    ) {
                        bullets.splice(index, 1); // Remove bullet
                        enemies.splice(enemyIndex, 1); // Remove enemy
                        player.score += enemy.points; // Add points
                        explosionSound.play();
                    }
                });
            });
    
            // Enemy shooting
            if (
                enemyBullets.length === 0 || // No bullets on screen
                enemyBullets[enemyBullets.length - 1].y > canvasHeight * 0.75 // Last bullet has traveled 3/4 of the canvas
            ) {
                const shootingEnemy = enemies[Math.floor(Math.random() * enemies.length)];
                if (shootingEnemy) {
                    enemyBullets.push({
                        x: shootingEnemy.x + shootingEnemy.width / 2 - 2.5,
                        y: shootingEnemy.y + shootingEnemy.height,
                        width: 10,
                        height: 20,
                        color: 'purple',
                    });
                    lastEnemyBulletTime = Date.now();
                }
            }

            // Check win condition (all enemies destroyed)
            if (enemies.length === 0) {
                backgroundMusic.pause();
                const message = 'Champion!';
                gameOver = true; // Set gameOver flag to true
                showScoreboard(player.score, message); // Show the scoreboard with the final score and message
                return;
            }

            // Draw and move enemy bullets
            enemyBullets.forEach((bullet, index) => {
                bullet.y += bulletSpeed;
                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
                // Remove bullet if it goes off-screen
                if (bullet.y > canvasHeight) {
                    enemyBullets.splice(index, 1);
                }
    
                // Check collision with player
                if (
                    bullet.x < player.x + player.width &&
                    bullet.x + bullet.width > player.x &&
                    bullet.y < player.y + player.height &&
                    bullet.y + bullet.height > player.y
                ) {
                    enemyBullets.splice(index, 1); // Remove bullet
                    player.lives -= 1; // Decrease lives
                    heroDiesSound.play();
                    player.x = canvasWidth / 2 - player.width / 2; // Center horizontally at the bottom
                    player.y = canvasHeight - 60; // Reset player position to bottom
    
                    if (player.lives === 0) {
                        backgroundMusic.pause();
                        const message = 'You Lost!';
                        gameOver = true; // Set gameOver flag to true
                        showScoreboard(player.score, message); // Show the scoreboard with the final score and message
                        return;
                    }
                }
            });
    
            // Draw score, lives, and remaining time
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${player.score}`, 10, 20);
            ctx.fillText(`Lives: ${player.lives}`, 10, 50);
            const remainingTime = Math.ceil((gameDuration - elapsedTime) / 1000);
            ctx.fillText(`Time: ${remainingTime}s`, 10, 80);
    
            // Loop the game
            requestAnimationFrame(gameLoop);
        }
    
        gameLoop();
    }

    // Handle configuration form submission
    const configurationForm = document.getElementById('configuration-form');
    configurationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const shootKey = document.getElementById('shoot-key').value;
        const gameTime = parseInt(document.getElementById('game-time').value, 10);

        if (!shootKey || gameTime < 2 || gameTime > 10) {
            alert('Invalid configuration. Please check your inputs.');
            return;
        }

        showSection('game-screen');
        startGame(shootKey, gameTime);
    });
});

let currentPlayer = null; // Variable to store the current player
let gameHistory = []; // Array to store game history

function showScoreboard(finalScore = null, message = '') {
    const scoreboardList = document.getElementById('scoreboard-list');
    const gameOverMessage = document.getElementById('game-over-message');
    scoreboardList.innerHTML = ''; // Clear the scoreboard
    gameOverMessage.textContent = message; // Set the game-over message

    // Add the current game's score to the history if provided
    if (finalScore !== null) {
        gameHistory.push({ score: finalScore, isCurrent: true });
    }

    // Display the game history
    gameHistory.forEach((game, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Game ${index + 1}: ${game.score}`;
        if (game.isCurrent) {
            listItem.style.color = 'red'; // Highlight the most recent game
        }
        scoreboardList.appendChild(listItem);
    });

    // Show the scoreboard section
    showSection('scoreboard');
}

function resetScoreboard() {
    gameHistory = []; // Clear the game history
    currentPlayer = null; // Reset the current player
}

document.getElementById('new-game-button').addEventListener('click', () => {
    if (!gameOver) {
        // If the game is mid-game, do not save the score
        alert('Starting a new game. Current game score will not be saved.');
    } else {
        // If the game is over, save the score
        const finalScore = gameHistory[gameHistory.length - 1]?.score || 0;
        showScoreboard(finalScore); // Save the score to the scoreboard
    }

    // Reset game state
    resetGameState();

    // Show the configuration screen
    showSection('configuration');
});

function resetGameState() {
    // Reset player state
    player = {
        x: canvasWidth / 2 - 25,
        y: canvasHeight - 60,
        width: 50,
        height: 50,
        lives: 3,
        score: 0,
    };

    // Clear enemies and bullets
    enemies.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;

    // Reset speed and timers
    enemySpeed = 1;
    bulletSpeed = 5;
    speedMultiplier = 1;
    speedIncrements = 0;

    // Stop background music
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    // Reset gameOver flag
    gameOver = false;

    console.log('Game state reset. Ready for a new game.');
}

