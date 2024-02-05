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

    const isValid = validateInputs();
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

const showCustomAlert = message => {
    const customAlert = document.getElementById('customAlert');
    const customAlertMessage = document.getElementById('customAlertMessage');

    customAlertMessage.innerText = message;
    customAlert.style.display = 'flex';

    const closeButton = document.getElementById('customAlertCloseButton');
    closeButton.addEventListener('click', hideCustomAlert);
};

const hideCustomAlert = () => {
    const customAlert = document.getElementById('customAlert');
    customAlert.style.display = 'none';
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
    }

    if (lastnameValue === '') {
        setError(lastname, 'Last name is required');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Last name is required';
        }
        isValid = false;
    } else {
        setSuccess(lastname);
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
    }

    if (passwordValue === '') {
        setError(password, 'Password is required');
        if (!firstErrorMessage) {
            firstErrorMessage = 'Password is required';
        }
        isValid = false;
    } else if (passwordValue.length < 8) {
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
    }

    if (!isValid && firstErrorMessage) {
        alert(firstErrorMessage);
    }

    return isValid;
};
// ... (your existing code)

function sendUserData() {
    const { isValid, emailValue } = validateInputs();

    if (!isValid) {
        return;
    }

    // Assuming otpValue is already stored in localStorage
    const otpValue = localStorage.getItem('otpValue');

    // Send user data to Flask for saving
    fetch('/verify_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username.value,
            lastname: lastname.value,
            email: emailValue,
            password: password.value,
            otp: otpValue,
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
            alert('Error sending user data');
        });
}

function verifyOTP() {
    const otpInput = document.getElementById('otp_inp');

    if (otpInput) {
        // Now check whether the entered OTP is valid
        if (otpInput.value == otpValue) {
            sendUserData(); 
            console.log(username.value);
            alert('saveddddddddddddd');// Send user data to Flask after OTP verification
        } else {
            alert('Invalid OTP');
        }
    } else {
        console.error("Error: Could not find element with id 'otp_inp'");
    }
}

