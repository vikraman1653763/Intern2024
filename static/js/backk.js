//otp.js//
function sendOTP() {
    const { isValid, emailValue,usernameValue } = validateInputs();
    
    if (!isValid) {
        return;
    }

    const otpValue = Math.floor(Math.random() * 1000000); // Generate and set OTP value

    let emailbody = `
        <h2>Your OTP is </h2><h1>${otpValue}</h1>
    `;

    // Store OTP value in localStorage
    localStorage.setItem('otpValue', otpValue);

    Email.send({
        SecureToken: "5fcffd7d-0f66-480e-9fcc-bddfcee79d28",
        To: emailValue,
        From: "vikraman1653763@gmail.com",
        Subject: "this is one time password. please dont share it with others.",
        Body: emailbody
    }).then(
        message => {
            if (message === "OK") {
                alert("OTP sent to your email " + emailValue);
                window.location.href = 'success.html';
            }
        }
    ).catch(error => {
        console.error("Error sending email:", error);
        alert("Error sending OTP email. Please try again.");
    });
}

const otpValue = localStorage.getItem('otpValue');

function sendUserData(emailValue) {
    // Send user data to Flask for saving
    fetch('/verify_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: usernameValue,
            lastname: sessionStorage.getItem('lastname'),
            email: emailValue,
            password: sessionStorage.getItem('password'),
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // Optionally, redirect to a success page
            window.location.href = 'success.html';
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error sending user data:', error);
        alert('Error sending user data. Please try again.');
    });
}


function verifyOTP() {
    const otpInput = document.getElementById('otp_inp');
    
    if (otpInput) {
        // Now check whether the entered OTP is valid
        if (otpInput.value == localStorage.getItem('otpValue')) {
            // Optional alert or other actions
            localStorage.removeItem('otpValue');
            const emailValue = localStorage.getItem('email');
            const usernameValue = localStorage.getItem('username');
            const lastnameValue = localStorage.getItem('lastname');
            const passwordValue = localStorage.getItem('password');
            console.log('email:', emailValue, usernameValue, lastnameValue, passwordValue);
            alert('savedd'); 
            // Call sendUserData with user details
            sendUserData(emailValue, usernameValue, lastnameValue, passwordValue);
        } else {
            alert("Invalid OTP");
        }
    } else {
        console.error("Error: Could not find element with id 'otp_inp'");
    }
}
//form.js
const form = document.getElementById('form');
const username = document.getElementById('username');
const lastname = document.getElementById('lastname');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');
let otpSent = false;
let firstErrorMessage = null;

const signUpButton = document.getElementById('sign');

form.addEventListener('submit', e => {
    e.preventDefault();

    const { isValid} = validateInputs();
    if (isValid && !otpSent) {
     
        sendOTP();
        otpSent = true;
    }
});

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    if (errorDisplay) {
        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
        showCustomAlert(message);
    }
};

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    if (errorDisplay) {
        errorDisplay.innerText = ''; // Clear the error message
        inputControl.classList.add('success');
        inputControl.classList.remove('error');
    }
};



const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validateInputs = () => {
    const usernameValue = username.value.trim();
    const lastnameValue = lastname.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const password2Value = password2.value.trim();
    let isValid = true;
    let firstErrorMessage = null;

    if (usernameValue === '') {
        setError(username, 'Username is required');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Username is required';
        }
        isValid = false;
    } else {
        setSuccess(username);
        localStorage.setItem('username', usernameValue);
    }

    if (lastnameValue === '') {
        setError(lastname, 'Last name is required');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Last name is required';
        }
        isValid = false;
    } else {
        setSuccess(lastname);
        localStorage.setItem('lastname',lastnameValue);

    }

    if (emailValue === '') {
        setError(email, 'Email is required');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Email is required';
        }
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Please provide a valid email';
        }
        isValid = false;
    } else {
        setSuccess(email);
        localStorage.setItem('email',emailValue);
    }

    if (passwordValue === '') {
        setError(password, 'Password is required');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Password is required';
        }
        isValid = false;
    } else if (passwordValue.length < 1) {
        setError(password, 'Password must be at least 8 characters.');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Password must be at least 8 characters';
        }
        isValid = false;
    } else {
        setSuccess(password);
    }

    if (password2Value === '') {
        setError(password2, 'Please confirm your password');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Please confirm your password';
        }
        isValid = false;
    } else if (password2Value !== passwordValue) {
        setError(password2, "Passwords don't match");
        if (!firstErrorMessage) {
            firstErrorMessage = "Passwords don't match";
        }
        isValid = false;
    } else {
        setSuccess(password2);
        localStorage.setItem('password', password2Value);
    }

    if (!isValid && firstErrorMessage) {
        alert(firstErrorMessage);
    }
    
    return { isValid, emailValue };
};


function sendUserData(emailValue, usernameValue, lastnameValue, passwordValue) {
    // Send user data to Flask for saving
    fetch('/verify_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: usernameValue,
            lastname: lastnameValue,
            email: emailValue,
            password: passwordValue,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // Optionally, redirect to a success page
            window.location.href = 'success.html';
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error sending user data:', error);
        alert('Error sending user data. Please try again.');
    });
}