function sendOTP() {
    const { isValid, emailValue } = validateInputs();

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
        Subject: "this is one time password . please dont share it with others.",
        Body: emailbody
    }).then(
        message => {
            if (message === "OK") {
                alert("OTP sent to your email " + emailValue);
                window.location.href = 'success.html';
            }
        },
        error => {
            console.error("Error sending email:", error);
        }
    );
}

const otpValue = localStorage.getItem('otpValue');

function verifyOTP() {
    const otpInput = document.getElementById('otp_inp');
    
    if (otpInput) {
        // Now check whether the entered OTP is valid
        if (otpInput.value == otpValue) {
            sendUserData();
            
        } else {
            alert("Invalid OTP");
        }
    } else {
        console.error("Error: Could not find element with id 'otp_inp'");
    }
}