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
