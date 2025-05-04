import React from "react";
import './login.css';
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../../utils/requests"; // Ensure API points to your base URL
import Data from "../../utils/data";

// Assuming toastr is globally available as window.toastr
const toastr = window.toastr;

// Keep toastr options as they are
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: "toast-bottom-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

// Basic phone number regex (adjust if needed for specific country codes/formats)
// This one is simpler: starts with optional +, then digits, minimum ~7 digits
const PHONE_REGEX = /^\+?\d{7,}$/;
// More specific Kenyan-like format (if you need it)
// const PHONE_REGEX_KENYA = /^(\+?254|0)?(7(?:(?:[0-9][0-9])|(?:[4][0-1]))[0-9]{6})$/;

class Login extends React.Component {
    state = {
        user: "", // Can be username, email, or phone number
        password: "", // Only for password login
        otpCode: "", // Only for OTP code input
        showOtpInput: false, // Controls visibility of OTP input field
        isOtpSent: false, // Tracks if OTP send request was successful
        userInputLooksLikePhone: false, // Flag based on user input format
        isLoading: false, // General loading state for API calls
        error: "" // Error message display
    };

    validator = null; // To hold the jQuery validator instance

    componentDidMount() {
        // Redirect if already logged in
        if (localStorage.getItem("authorization")) {
            return this.props.history.push({
                pathname: '/trips/all' // Adjust redirect path if necessary
            });
        }

        // Initialize jQuery Validator if $ is available
        if (window.$ && window.$.fn.validate) {
            this.setupValidator();
        } else {
            console.error("jQuery or jQuery Validate not found. Form validation might not work as expected.");
        }
    }

    componentWillUnmount() {
        // Clean up validator if it exists
        if (this.validator) {
            this.validator.destroy();
        }
    }

    setupValidator = () => {
        const _this = this; // Capture component instance

        // Delay setup slightly if needed to ensure DOM is ready
        setTimeout(() => {
            if (!window.$("#login").length) {
                console.warn("Login form not found for validation setup.");
                return;
            }

            this.validator = window.$("#login").validate({
                errorClass: "invalid-feedback",
                errorElement: "div",

                highlight: function (element) {
                    window.$(element).addClass("is-invalid");
                },

                unhighlight: function (element) {
                    window.$(element).removeClass("is-invalid");
                },

                // Custom submit handler based on login mode (OTP or Password)
                submitHandler: (form, event) => {
                    event.preventDefault();
                    if (this.state.isLoading) return; // Prevent double submit

                    if (this.state.showOtpInput) {
                        // If OTP input is visible, we are verifying OTP
                        this.handleVerifyOtp();
                    } else {
                        // Otherwise, we are attempting password login
                        this.handlePasswordLogin();
                    }
                },
                // Define rules - adjust required based on visible fields
                rules: {
                    username: {
                        required: true
                    },
                    password: {
                        // Only required if OTP input is NOT visible
                        required: () => !this.state.showOtpInput
                    },
                    otpCode: {
                        // Only required if OTP input IS visible
                        required: () => this.state.showOtpInput,
                        digits: true, // Assuming OTP is numeric
                        minlength: 5, // Assuming 5 digits, adjust if needed
                        maxlength: 5 // Assuming 5 digits, adjust if needed
                    }
                },
                messages: {
                    username: "Please enter your username, email, or phone number",
                    password: {
                        required: "Please enter your password"
                    },
                    otpCode: {
                        required: "Please enter the OTP code sent to your phone",
                        digits: "OTP must contain only digits",
                        minlength: "OTP must be {0} digits long",
                        maxlength: "OTP must be {0} digits long"
                    }
                }
            });
        }, 0); // Small delay
    }

    // Handles changes in the 'user' input field
    handleUserInputChange = (e) => {
        const value = e.target.value;
        const looksLikePhone = PHONE_REGEX.test(value); // Test against the regex

        this.setState({
            user: value,
            userInputLooksLikePhone: looksLikePhone,
            error: "" // Clear error on input change
        });

        // If input no longer looks like phone, maybe reset OTP state? Optional.
        // if (!looksLikePhone && this.state.showOtpInput) {
        //     this.resetToPasswordMode();
        // }
    };

    // Handles changes in the 'password' input field
    handlePasswordChange = (e) => {
        this.setState({ password: e.target.value, error: "" });
    };

    // Handles changes in the 'otpCode' input field
    handleOtpCodeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
        if (value.length <= 5) { // Assuming 5 digit OTP
             this.setState({ otpCode: value, error: "" });
        }
    };

    // --- API Call Handlers ---

    // Attempt password login
    handlePasswordLogin = async () => {
        const { user, password } = this.state;

        if (!user || !password) {
            this.setState({ error: "Username/Email and Password are required." });
            return;
        }

        this.setState({ isLoading: true, error: "" });

        try {
            const res = await axios.post(`${API}/auth/login`, {
                user,
                password,
            });

            const { token, data: userData } = res.data; // Assuming 'user' instead of 'data' based on mobile code

            if (!token || !userData) {
               throw new Error("Invalid response from server during login.");
            }

            this.handleLoginSuccess(token,  userData);

        } catch (err) {
            console.error("Password Login Error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
            this.setState({ error: errorMsg, isLoading: false });
            toastr.error("Login Failed", errorMsg);

             // OPTIONAL: Check if error suggests OTP is required for this user type
             // Example: if (err.response?.data?.code === 'OTP_REQUIRED_FOR_USER') {
             //    // Automatically switch to OTP mode? Or just guide the user?
             //    // For now, just show the error and let them click "Send OTP" if available.
             // }
        }
    };

    // Request OTP code to be sent
    handleSendOtp = async () => {
        const { user } = this.state;

        if (!user || !PHONE_REGEX.test(user)) {
            this.setState({ error: "Please enter a valid phone number to receive an OTP." });
            toastr.warning("Invalid Input", "Please enter a valid phone number.");
            return;
        }

        this.setState({ isLoading: true, error: "" });

        try {
            // Use the endpoint matching the mobile app
            const res = await axios.post(`${API}/auth/otp/send`, {
                user: user // Server expects 'user' field with the phone number
            });

            // Check for a success indicator from the server
            // Adjust based on your actual API response structure
            if (res.data && (res.data.success || res.status === 200 || res.status === 201) ) {
                toastr.success("OTP Sent", "Verification code has been sent to your phone.");
                this.setState({
                    showOtpInput: true, // Show the OTP input field
                    isOtpSent: true,    // Mark OTP as sent
                    isLoading: false,
                    password: "",       // Clear password field if user switches mode
                    otpCode: "",        // Clear any previous OTP code
                });
                // Focus OTP input after a short delay
                setTimeout(() => {
                    const otpInput = document.getElementById("otpCodeInput");
                    if (otpInput) otpInput.focus();
                }, 100);
            } else {
                throw new Error(res.data?.message || "Failed to send OTP code.");
            }

        } catch (err) {
            console.error("Send OTP Error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Could not send OTP. Please try again.";
            this.setState({
                error: errorMsg,
                isLoading: false,
                isOtpSent: false,
                showOtpInput: false // Stay in password mode or reset if send failed
            });
            toastr.error("OTP Send Failed", errorMsg);
        }
    };

    // Verify the entered OTP code
    handleVerifyOtp = async () => {
        const { user, otpCode } = this.state;

        if (!user || !otpCode || otpCode.length !== 5) { // Assuming 5 digits
            this.setState({ error: "Please enter the 5-digit OTP code." });
             toastr.warning("Invalid OTP", "Please enter the 5-digit OTP code.");
            return;
        }

        this.setState({ isLoading: true, error: "" });

        try {
            // Use the endpoint matching the mobile app
            const res = await axios.post(`${API}/auth/verify/sms`, {
                user: user,       // Phone number
                password: otpCode // Server expects OTP in 'password' field for this endpoint
            });

            const { token, user: userData } = res.data; // Adjust if structure is different

            if (!token || !userData) {
                 throw new Error("Invalid response from server during OTP verification.");
            }

            toastr.success("Verification Successful", "You are now logged in.");
            // Delay login success slightly to let user see the success message
            setTimeout(() => {
                 this.handleLoginSuccess(token, userData);
            }, 1500);


        } catch (err) {
            console.error("OTP Verification Error:", err);
            const errorMsg = err.response?.data?.message || err.message || "OTP verification failed. Invalid code or expired.";
            this.setState({ error: errorMsg, isLoading: false });
             toastr.error("OTP Verification Failed", errorMsg);
             // Keep OTP input visible for retry
             // Optionally add a Resend OTP button/logic here
        }
    };

    // Common logic after successful login (Password or OTP)
    handleLoginSuccess = (token, userData) => {
        console.log(token, userData)
        localStorage.setItem("authorization", token);
        localStorage.setItem("user", JSON.stringify(userData));

        Data.init(); // Initialize any app data needed after login

        // Navigate to the dashboard/main page
        this.props.history.push({
            pathname: '/trips/all' // Adjust redirect path if necessary
        });

        // Reset state in case component isn't unmounted immediately (though redirect should handle it)
        this.setState({
            user: "", password: "", otpCode: "", showOtpInput: false,
            isOtpSent: false, userInputLooksLikePhone: false, isLoading: false, error: ""
        });
    };

    // Helper to reset state back to password mode if needed
    resetToPasswordMode = () => {
        this.setState({
            showOtpInput: false,
            isOtpSent: false,
            otpCode: "",
            error: "" // Clear specific OTP errors
        });
    }

    render() {
        const { user, password, otpCode, showOtpInput, userInputLooksLikePhone, isLoading, error } = this.state;

        return (
            <div>
                {/* Outer structure remains the same */}
                <div className="kt-grid kt-grid--ver kt-grid--root">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-login-v2" id="kt_login_v2">
                        <div className="kt-grid__item kt-grid  kt-grid--ver  kt-grid__item--fluid">
                            <div className="kt-login-v2__body">
                                <div className="kt-login-v2__wrapper">
                                    <div className="kt-login-v2__container" style={{ "marginTop": "15vh" }}> {/* Adjusted margin slightly */}
                                        <img
                                            className="text-center row mx-auto justify-content-center align-items-center flex-column"
                                            src="designs/bus_logo.png" // Make sure this path is correct relative to public/ folder
                                            style={{ "marginTop": "5vh", marginBottom: '2rem' }} // Added bottom margin
                                            width="25%" // Adjusted width
                                            alt="Logo"
                                        />

                                        <div className="kt-login-v2__title">
                                            <h3>Sign in to your account</h3>
                                        </div>

                                        {/* Use React's onSubmit, let jQuery validator handle prevention */}
                                        <form id="login" className="kt-login-v2__form kt-form" onSubmit={(e) => e.preventDefault()} autoComplete="off">
                                            {error ? (
                                                <div className="alert alert-danger" role="alert"> {/* Added role */}
                                                    <div className="alert-text">{error}</div>
                                                </div>
                                            ) : null}

                                            {/* User Input (Username/Email/Phone) */}
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <input
                                                        value={user}
                                                        onChange={this.handleUserInputChange}
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Username, Email, or Phone Number"
                                                        name="username" // Name required by jQuery Validate
                                                        autoComplete="off"
                                                        required={true} // HTML5 required
                                                        disabled={isLoading}
                                                        aria-label="Username, Email, or Phone Number" // Accessibility
                                                        style={{paddingRight:"10px"}}
                                                    />
                                                    {/* Conditionally show "Send OTP" button */}
                                                    {userInputLooksLikePhone && !showOtpInput && (
                                                        <div className="input-group-append">
                                                            <button
                                                                type="button"
                                                                onClick={this.handleSendOtp}
                                                                className="btn btn-outline-secondary btn-sm" // Adjusted style
                                                                disabled={isLoading || !user} // Disable if loading or no user input
                                                                style={{ lineHeight: 'normal', height: 'calc(2.25rem + 2px)' }} // Align height
                                                            >
                                                                {isLoading ? 'Sending...' : 'Send OTP'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Let validator handle error display */}
                                            </div>

                                            {/* Password Input OR OTP Input */}
                                            {!showOtpInput ? (
                                                <div className="form-group">
                                                    <input
                                                        value={password}
                                                        onChange={this.handlePasswordChange}
                                                        className="form-control"
                                                        type="password"
                                                        placeholder="Password"
                                                        name="password" // Name required by jQuery Validate
                                                        autoComplete="current-password"
                                                        required={true} // HTML5 required
                                                        disabled={isLoading}
                                                        aria-label="Password" // Accessibility
                                                    />
                                                     {/* Let validator handle error display */}
                                                </div>
                                            ) : (
                                                <div className="form-group">
                                                    <input
                                                        id="otpCodeInput" // Added ID for focus()
                                                        value={otpCode}
                                                        onChange={this.handleOtpCodeChange}
                                                        className="form-control"
                                                        type="text" // Use text to allow seeing input, or "tel"
                                                        placeholder="Enter 5-Digit OTP Code"
                                                        name="otpCode" // Name required by jQuery Validate
                                                        autoComplete="one-time-code"
                                                        required={true} // HTML5 required
                                                        disabled={isLoading}
                                                        maxLength={5} // Limit input length
                                                        pattern="\d{5}" // Basic pattern validation
                                                        inputMode="numeric" // Hint for numeric keyboard
                                                        aria-label="OTP Verification Code" // Accessibility
                                                    />
                                                     {/* Let validator handle error display */}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="kt-login-v2__actions">
                                                {!showOtpInput && (
                                                    <Link to="/recover" className="kt-link kt-link--brand">
                                                        Forgot Password?
                                                    </Link>
                                                )}
                                                {/* Back to password mode button (optional) */}
                                                {showOtpInput && (
                                                     <button
                                                        type="button"
                                                        onClick={this.resetToPasswordMode}
                                                        className="kt-link kt-link--brand" // Style as a link
                                                        disabled={isLoading}
                                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                    >
                                                        Use Password Instead?
                                                    </button>
                                                )}

                                                {/* Main Submit Button (handled by validator's submitHandler) */}
                                                <button
                                                    type="submit" // Let validator trigger submitHandler
                                                    className="btn btn-brand btn-elevate btn-pill btn-sm"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    ) : (
                                                        showOtpInput ? 'Verify OTP' : 'Sign In'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                        {/* Social logins removed as per focus */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sidebar remains the same */}
                <div className="kt-aside kt-aside--fixed " id="kt_aside">
                    {/* ... (keep existing sidebar structure) ... */}
                </div>
            </div>
        );
    }
}

export default Login;