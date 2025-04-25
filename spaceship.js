const assets = {
    backgroundMusic: new Audio('assets/bg_music.mp3'),
    shootSound: new Audio('assets/hero_sound.mp3'),
    explosionSound: new Audio('assets/enemy_dies_sound.mp3'),
    heroDiesSound: new Audio('assets/hero_dies_sound.mp3'),
    backgroundImage: new Image(),
    heroImage: new Image(),
    enemyImages: [
        'assets/enemy1.png',
        'assets/enemy2.png',
        'assets/enemy3.png',
        'assets/enemy4.png',
    ],
};

// Set image sources
assets.backgroundImage.src = 'assets/bg.jpeg';
assets.heroImage.src = 'assets/hero.png';

let gameOver = false; // Flag to track game over state
let speedIncreaseTimer; // Declare the timer globally to manage it across games
let gameLoopRunning = false; // Track whether the game loop is running
let gameHistory = []; // Array to store game history
let currentPlayer = null; // Variable to store the current player

function showSection(sectionId) {
    // Hide all sections
    $('.content-section').hide();

    // Show the selected section
    $(`#${sectionId}`).show();

    // Hide or show header, footer, and sidebar
    if (sectionId === 'game-screen') {
        $('header, footer, .sidebar').hide();
    } else {
        $('header, footer, .sidebar').show();
    }
}

// Show only the welcome section on page load
$(document).ready(() => {
    showSection('welcome');
});

// Array for signed-up users
const signedUpUsers = [
    { username: "p", password: "testuser" } // Default user
];

$('#sign-up-form').on('submit', (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    const username = $('#username').val().trim();
    const password = $('#password').val();
    const passwordVerification = $('#password-verification').val();
    const name = $('#name').val().trim();
    const lastName = $('#last-name').val().trim();
    const email = $('#email').val().trim();
    const year = $('#year').val();
    const month = $('#month').val();
    const day = $('#day').val();

    // Validation checks
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

    // Save user
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

    // Clear the form
    $('#sign-up-form')[0].reset();
});

$('#login-form').on('submit', (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    const loginUsername = $('#login-username').val().trim();
    const loginPassword = $('#login-password').val();

    // Check if user exists in the users array
    const user = signedUpUsers.find(user => user.username === loginUsername && user.password === loginPassword);

    if (user) {
        // Successful login
        $('#login-error').hide();
        resetScoreboard(); // Reset the scoreboard
        currentPlayer = user.username; // Set the current player
        showSection('configuration'); // Show configuration screen
    } else {
        // Unsuccessful login
        $('#login-error').show();
    }
});

// Handle "New Game" buttons
document.addEventListener('DOMContentLoaded', () => {
    const newGameButtonGameScreen = document.getElementById('new-game-button-game-screen');
    newGameButtonGameScreen.addEventListener('click', () => {
        const confirmNewGame = confirm('Are you sure you want to start a new game? This will reset your current game progress.');
        if (confirmNewGame) {
            showSection('configuration'); // Navigate to the configuration screen
        }
    });

    const newGameButtonScoreboard = document.getElementById('new-game-button-scoreboard');
    newGameButtonScoreboard.addEventListener('click', () => {
        showSection('configuration'); // Navigate to the configuration screen
    });
});

// Handle configuration form
document.addEventListener('DOMContentLoaded', () => {
    const configurationForm = document.getElementById('configuration-form');

    configurationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const shootKey = document.getElementById('shoot-key').value;
        const gameTime = parseInt(document.getElementById('game-time').value, 10);

        // Validate shooting key
        if (!/^[a-zA-Z]$/.test(shootKey) && shootKey !== ' ') {
            alert('Please enter a valid shooting key (a single letter or the spacebar).');
            return;
        }

        // Validate game time
        if (gameTime < 2 || gameTime > 10) {
            alert('Game time must be between 2 and 10 minutes.');
            return;
        }

        console.log(`Shooting Key: ${shootKey}`);
        console.log(`Game Time: ${gameTime} minutes`);

        // Move to game
        showSection('game-screen');
        startGame(shootKey, gameTime, assets);
    });
});

// Define canvas and its dimensions globally
const gameCanvas = document.getElementById('game-canvas');
const ctx = gameCanvas.getContext('2d');
const canvasWidth = gameCanvas.width;
const canvasHeight = gameCanvas.height;

function startGame(shootKey, gameTime, assets) {
    const { backgroundMusic, shootSound, explosionSound, heroDiesSound, backgroundImage, heroImage, enemyImages } = assets;

    // Clear any existing game state
    clearInterval(speedIncreaseTimer); // Clear the speed increase timer
    gameOver = false; // Reset the gameOver flag
    gameLoopRunning = true; // Start the game loop

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
    let heroBulletSpeed = 10; // Speed for hero bullets
    let enemyBulletSpeed = 5; // Speed for enemy bullets
    const maxSpeedMultiplier = 4; // Maximum speed multiplier for enemies
    let speedMultiplier = 1; // Initial speed multiplier for enemies

    const bullets = [];
    const enemyBullets = [];
    let lastEnemyBulletTime = 0;

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
                points: (4 - row) * 5, // Points based on row
            });
        }
    }

    // Increase speed every 5 seconds, up to the maxSpeedMultiplier
    let speedIncrements = 0; // Track the number of speed increases
    const speedIncreaseInterval = 5000; // Fixed interval of 5 seconds

    speedIncreaseTimer = setInterval(() => {
        if (speedIncrements < maxSpeedMultiplier) {
            speedMultiplier += 1;
            enemySpeed = 0.8 * speedMultiplier;
            heroBulletSpeed = 10 + speedMultiplier;
            enemyBulletSpeed = 5 + speedMultiplier;
            speedIncrements++;
            console.log(`Speed increased! Multiplier: ${speedMultiplier}`);
        } else {
            clearInterval(speedIncreaseTimer);
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

    // Enemy shooting logic
    function enemyShoot() {
        const now = Date.now();
        if (now - lastEnemyBulletTime > 1000) { // Enemies shoot every 1 second
            const shootingEnemy = enemies[Math.floor(Math.random() * enemies.length)];
            if (shootingEnemy) {
                enemyBullets.push({
                    x: shootingEnemy.x + shootingEnemy.width / 2 - 2.5,
                    y: shootingEnemy.y + shootingEnemy.height,
                    width: 7,
                    height: 10,
                    color: 'red',
                });
                lastEnemyBulletTime = now;
            }
        }
    }

    // Game loop
    function gameLoop() {
        if (gameOver || !gameLoopRunning) {
            gameLoopRunning = false; // Stop the game loop
            return;
        }

        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        // Check if time is up
        if (elapsedTime >= gameDuration) {
            backgroundMusic.pause();
            const message = player.score < 100
                ? `You can do better! Your score: ${player.score}`
                : 'Winner!';
            gameOver = true;
            clearInterval(speedIncreaseTimer);
            showScoreboard(player.score, message);
            return;
        }

        // Check if all lives are lost
        if (player.lives === 0) {
            backgroundMusic.pause();
            const message = 'You Lost!';
            gameOver = true;
            clearInterval(speedIncreaseTimer);
            showScoreboard(player.score, message);
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

        // Enemy shooting
        enemyShoot();

        // Draw and move hero bullets
        bullets.forEach((bullet, index) => {
            bullet.y -= heroBulletSpeed;
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
                    bullets.splice(index, 1);
                    enemies.splice(enemyIndex, 1);
                    player.score += enemy.points;
                    explosionSound.play();
                }
            });
        });

        // Draw and move enemy bullets
        enemyBullets.forEach((bullet, index) => {
            bullet.y += enemyBulletSpeed;
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
                enemyBullets.splice(index, 1);
                player.lives -= 1;
                heroDiesSound.play();

                // Reset player's position
                player.x = canvasWidth / 2 - player.width / 2;
                player.y = canvasHeight - player.height - 10;
            }
        });

        // Check win condition (all enemies destroyed)
        if (enemies.length === 0) {
            backgroundMusic.pause();
            const message = 'Champion!';
            gameOver = true;
            clearInterval(speedIncreaseTimer);
            showScoreboard(player.score, message);
            return;
        }

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

function showScoreboard(finalScore = null, message = '') {
    const scoreboardList = document.getElementById('scoreboard-list');
    const gameOverMessage = document.getElementById('game-over-message');
    scoreboardList.innerHTML = ''; // Clear the scoreboard
    gameOverMessage.textContent = message; // Set the game-over message

    // Add the current game's score and player name to the history if provided
    if (finalScore !== null && currentPlayer) {
        // Reset the `isCurrent` flag for all previous games
        gameHistory.forEach(game => game.isCurrent = false);

        // Add the new game with `isCurrent` set to true
        gameHistory.push({ player: currentPlayer, score: finalScore, isCurrent: true });
    }

    // Sort the game history by score in descending order
    // If scores are tied, the newest score (last added) comes first
    gameHistory.sort((a, b) => b.score - a.score || gameHistory.indexOf(b) - gameHistory.indexOf(a));

    // If there are more than 10 items, remove the lowest score (or the oldest in case of a tie)
    if (gameHistory.length > 10) {
        gameHistory.pop(); // Remove the last item
    }

    // Display the top 10 game history
    gameHistory.forEach((game, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}: ${game.player} - ${game.score}`; // Include ranking, player name, and score
        if (game.isCurrent) {
            listItem.style.color = 'red'; // Highlight the most recent game
        }
        scoreboardList.appendChild(listItem);
    });

    // Show the scoreboard section
    showSection('scoreboard');
}

function resetGameState() {
    clearInterval(speedIncreaseTimer); // Clear the speed increase timer
    gameOver = true; // Set the gameOver flag to true
    gameLoopRunning = false; // Stop the game loop
}

function resetScoreboard() {
    gameHistory = []; // Clear the game history
    currentPlayer = null; // Reset the current player
}

function openAboutDialog() {
    $('#game-dialog').show(); // Show the dialog
}

function closeDialog() {
    $('#game-dialog').hide(); // Hide the dialog
}

$(document).ready(() => {
    // Close the dialog when clicking the close button
    $('#close-dialog').on('click', closeDialog);

    // Close the dialog when clicking outside of it
    $('#game-dialog').on('click', (event) => {
        if (!$(event.target).closest('.modal-content').length) {
            closeDialog();
        }
    });

    // Close the dialog when pressing the Escape key
    $(document).on('keydown', (event) => {
        if (event.key === 'Escape' && $('#game-dialog').is(':visible')) {
            closeDialog();
        }
    });
});

function playSound(sound) {
    sound.currentTime = 0; // Reset the sound to the beginning
    sound.play();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}