function showSection(sectionId) {
    // get all sections
    const sections = document.querySelectorAll('.content-section');

    // hide all sections
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // show the selected section
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
            showSection('game'); // show game screen
        } else {
            // unsuccessful login
            document.getElementById('login-error').style.display = 'block';
        }
    });
});