import React from "react";
import './login.css'; // Assuming this contains necessary base styles for kt- classes if not covered by Bootstrap
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../../utils/requests"; // Ensure API points to your base URL
import Data from "../../utils/data";

// Assuming toastr is globally available as window.toastr
const toastr = window.toastr;

// Keep toastr options as they are
if (toastr) {
    toastr.options = {
        closeButton: true,
        debug: false,
        newestOnTop: false,
        progressBar: true, // Enabled for better feedback
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
} else {
    console.warn("Toastr not found. Notifications will not be displayed.");
}


const PHONE_REGEX = /^\+?\d{7,}$/;

class Login extends React.Component {
    state = {
        user: "",
        password: "",
        otpCode: "",
        showOtpInput: false,
        isOtpSent: false,
        userInputLooksLikePhone: false,
        isLoading: false,
        error: ""
    };

    validator = null;

    componentDidMount() {
        if (localStorage.getItem("authorization")) {
            return this.props.history.push({ pathname: '/trips/all' });
        }
        if (window.$ && window.$.fn.validate) {
            this.setupValidator();
        } else {
            console.error("jQuery or jQuery Validate not found.");
        }
    }

    componentWillUnmount() {
        if (this.validator) {
            this.validator.destroy();
        }
    }

    setupValidator = () => {
        const _this = this;
        setTimeout(() => {
            if (!window.$("#loginForm").length) { // Changed ID to loginForm
                console.warn("Login form not found for validation setup.");
                return;
            }
            this.validator = window.$("#loginForm").validate({ // Changed ID
                errorClass: "is-invalid", // Bootstrap class for invalid
                validClass: "is-valid",   // Bootstrap class for valid
                errorElement: "div",
                errorPlacement: function(error, element) { // Custom placement for Bootstrap
                    error.addClass("invalid-feedback");
                    if (element.parent(".input-group").length) {
                         error.insertAfter(element.parent(".input-group"));
                    } else {
                         error.insertAfter(element);
                    }
                },
                highlight: function (element) {
                    window.$(element).addClass("is-invalid").removeClass("is-valid");
                },
                unhighlight: function (element) {
                    window.$(element).removeClass("is-invalid").addClass("is-valid");
                },
                submitHandler: (form, event) => {
                    event.preventDefault();
                    if (this.state.isLoading) return;
                    if (this.state.showOtpInput) {
                        this.handleVerifyOtp();
                    } else {
                        this.handlePasswordLogin();
                    }
                },
                rules: {
                    username: { required: true },
                    password: { required: () => !this.state.showOtpInput },
                    otpCode: {
                        required: () => this.state.showOtpInput,
                        digits: true,
                        minlength: 5,
                        maxlength: 5
                    }
                },
                messages: {
                    username: "Please enter your username, email, or phone number",
                    password: { required: "Please enter your password" },
                    otpCode: {
                        required: "Please enter the OTP code",
                        digits: "OTP must be digits",
                        minlength: "OTP must be {0} digits",
                        maxlength: "OTP must be {0} digits"
                    }
                }
            });
        }, 100); // Increased delay slightly for DOM readiness
    }

    handleUserInputChange = (e) => {
        const value = e.target.value;
        const looksLikePhone = PHONE_REGEX.test(value);
        this.setState({ user: value, userInputLooksLikePhone: looksLikePhone, error: "" });
    };

    handlePasswordChange = (e) => {
        this.setState({ password: e.target.value, error: "" });
    };

    handleOtpCodeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 5) {
             this.setState({ otpCode: value, error: "" });
        }
    };

    handlePasswordLogin = async () => {
        const { user, password } = this.state;
        if (!user || !password) {
            this.setState({ error: "Username/Email and Password are required." });
            return;
        }
        this.setState({ isLoading: true, error: "" });
        try {
            const res = await axios.post(`${API}/auth/login`, { user, password });
            const { token, data: userData } = res.data;
            if (!token || !userData) throw new Error("Invalid response from server.");
            this.handleLoginSuccess(token, userData);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Login failed. Check credentials.";
            this.setState({ error: errorMsg, isLoading: false });
            toastr && toastr.error("Login Failed", errorMsg);
        }
    };

    handleSendOtp = async () => {
        const { user } = this.state;
        if (!user || !PHONE_REGEX.test(user)) {
            this.setState({ error: "Please enter a valid phone number for OTP." });
            toastr && toastr.warning("Invalid Input", "Please enter a valid phone number.");
            return;
        }
        this.setState({ isLoading: true, error: "" });
        try {
            const res = await axios.post(`${API}/auth/otp/send`, { user });
            if (res.data && (res.data.success || res.status < 300)) {
                toastr && toastr.success("OTP Sent", "Verification code sent to your phone.");
                this.setState({ showOtpInput: true, isOtpSent: true, isLoading: false, password: "", otpCode: "" });
                setTimeout(() => {
                    const otpInput = document.getElementById("otpCodeInput");
                    if (otpInput) otpInput.focus();
                }, 100);
            } else {
                throw new Error(res.data?.message || "Failed to send OTP code.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Could not send OTP.";
            this.setState({ error: errorMsg, isLoading: false, isOtpSent: false, showOtpInput: false });
            toastr && toastr.error("OTP Send Failed", errorMsg);
        }
    };

    handleVerifyOtp = async () => {
        const { user, otpCode } = this.state;
        if (!user || !otpCode || otpCode.length !== 5) {
            this.setState({ error: "Please enter the 5-digit OTP code." });
            toastr && toastr.warning("Invalid OTP", "Please enter the 5-digit OTP code.");
            return;
        }
        this.setState({ isLoading: true, error: "" });
        try {
            const res = await axios.post(`${API}/auth/verify/sms`, { user, password: otpCode });
            const { token, user: userData } = res.data;
            if (!token || !userData) throw new Error("Invalid response from server.");
            toastr && toastr.success("Verification Successful!", "You are now logged in.");
            setTimeout(() => this.handleLoginSuccess(token, userData), 1000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "OTP verification failed.";
            this.setState({ error: errorMsg, isLoading: false });
            toastr && toastr.error("OTP Verification Failed", errorMsg);
        }
    };

    handleLoginSuccess = (token, userData) => {
        localStorage.setItem("authorization", token);
        localStorage.setItem("user", JSON.stringify(userData));
        Data.init();
        this.props.history.push({ pathname: '/trips/all' });
        this.setState({ user: "", password: "", otpCode: "", showOtpInput: false, isOtpSent: false, userInputLooksLikePhone: false, isLoading: false, error: "" });
    };

    resetToPasswordMode = () => {
        this.setState({ showOtpInput: false, isOtpSent: false, otpCode: "", error: "" });
    }

    // CSS for branding and layout enhancements
    CustomStyles = () => {
        const brandColor = "rgb(238, 158, 61)";
        return (
        <style>{`
            :root {
                --brand-color: ${brandColor};
                --brand-color-darker: rgb(218, 138, 41);
                --brand-color-lighter: rgb(242, 178, 81);
                --info-text-color: #fff;
                --info-text-opacity: 0.9;
            }
            body {
                background-color: #eef1f5;
                font-family: 'Roboto', 'Segoe UI', sans-serif;
                line-height: 1.6;
            }
            .login-page-container { /* Changed class name */
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
            }
            .login-card { /* Changed class name */
                background-color: #fff;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                display: flex;
                flex-direction: column-reverse; /* Info panel on top on mobile */
                width: 100%;
                max-width: 900px; /* Adjusted max width for login */
            }
            .login-form-panel { /* Changed class name */
                padding: 2rem; 
            }
            .login-info-panel { /* Changed class name */
                background: linear-gradient(135deg, var(--brand-color) 0%, var(--brand-color-darker) 100%);
                color: var(--info-text-color);
                padding: 2.5rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                min-height: 300px; /* Ensure some height on mobile */
            }
            .text-logo {
                font-family: 'Poppins', 'Segoe UI', sans-serif;
                font-size: 2.2rem;
                font-weight: 700;
                color: var(--brand-color);
                margin-bottom: 0;
            }
            .login-info-panel .text-logo {
                 color: var(--info-text-color);
                 margin-bottom: 1.5rem;
                 text-align: left;
            }
            .login-info-panel h1 {
                font-size: 2rem;
                font-weight: 600;
                margin-bottom: 1rem;
                line-height: 1.3;
                color: var(--info-text-color);
            }
            .login-info-panel p {
                font-size: 1rem;
                line-height: 1.7;
                opacity: var(--info-text-opacity);
                color: var(--info-text-color);
            }
            .login-form-title { /* Changed class name */
                color: var(--brand-color);
                font-weight: 600;
                font-size: 1.8rem;
                padding-bottom: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .btn-brand {
                background-color: var(--brand-color);
                border-color: var(--brand-color);
                color: white;
                font-weight: 500;
                padding: 0.65rem 1.25rem;
                transition: background-color 0.2s ease-in-out;
            }
            .btn-brand:hover, .btn-brand:focus {
                background-color: var(--brand-color-darker);
                border-color: var(--brand-color-darker);
                color: white;
            }
            .kt-link { /* Keep kt-link for consistency if used elsewhere */
                color: var(--brand-color);
                font-weight: 500;
            }
            .kt-link:hover {
                color: var(--brand-color-darker);
                text-decoration: underline;
            }
            .form-control:focus {
                border-color: var(--brand-color);
                box-shadow: 0 0 0 0.2rem rgba(238, 158, 61, 0.25);
            }
            .login-info-footer { /* Changed class name */
                margin-top: auto;
                padding-top: 1.5rem; 
                font-size: 0.85rem; 
                opacity: 0.8;
                text-align: center;
            }
            .login-info-footer a {
                color: var(--info-text-color);
                font-weight: bold;
                text-decoration: none;
            }
            .btn-otp-send {
                border-left: none;
                border-color: #ced4da; /* Match default bootstrap input border */
                background-color: #e9ecef; /* Light grey for distinction */
                color: #495057;
                font-size: 0.875rem;
            }
            .btn-otp-send:hover {
                background-color: #dde2e6;
            }
            .input-group > .form-control:not(:last-child) { /* Ensure no rounded corners on left for OTP button */
                 border-top-right-radius: 0;
                 border-bottom-right-radius: 0;
            }
            .input-group > .input-group-append > .btn {
                 border-top-left-radius: 0;
                 border-bottom-left-radius: 0;
            }

            /* Mobile specific adjustments */
            @media (max-width: 991.98px) {
                .login-info-panel { padding: 2rem 1.5rem; text-align: center; }
                .login-info-panel .text-logo { text-align: center; font-size: 2rem; }
                .login-info-panel h1 { font-size: 1.8rem; }
                .login-form-panel { padding: 1.5rem; }
                .login-form-title { font-size: 1.6rem; }
                 .login-card { flex-direction: column; }
            }
            @media (min-width: 992px) { /* lg and up */
                .login-card { flex-direction: row; }
            }
        `}</style>
        );
    }


    render() {
        const { user, password, otpCode, showOtpInput, userInputLooksLikePhone, isLoading, error } = this.state;

        return (
            <>
                <this.CustomStyles />
                <div className="login-page-container">
                    <div className="login-card">
                        <div className="col-lg-7 login-form-panel order-lg-2"> {/* Form on Right on Desktop */}
                            <div className="text-center mb-4">
                                <Link to="/" className="text-decoration-none">
                                    <h1 className="text-logo">Shule Plus</h1>
                                </Link>
                            </div>
                            <h3 className="login-form-title text-center">Sign In To Your Account</h3>
                            
                            <form id="loginForm" onSubmit={(e) => e.preventDefault()} autoComplete="off">
                                {error && (
                                    <div className="alert alert-danger text-center" role="alert">
                                        {error}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="username">Username, Email, or Phone</label>
                                    <div className="input-group">
                                        <input
                                            value={user}
                                            onChange={this.handleUserInputChange}
                                            className="form-control"
                                            type="text"
                                            id="username"
                                            placeholder="Enter here"
                                            name="username"
                                            autoComplete="username"
                                            required
                                            disabled={isLoading}
                                        />
                                        {userInputLooksLikePhone && !showOtpInput && (
                                            <div className="input-group-append">
                                                <button
                                                    type="button"
                                                    onClick={this.handleSendOtp}
                                                    className="btn btn-otp-send"
                                                    disabled={isLoading || !user}
                                                >
                                                    {isLoading && this.state.user === user ? 'Sending...' : 'Send OTP'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!showOtpInput ? (
                                    <div className="form-group">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            value={password}
                                            onChange={this.handlePasswordChange}
                                            className="form-control"
                                            type="password"
                                            id="password"
                                            placeholder="Enter your password"
                                            name="password"
                                            autoComplete="current-password"
                                            required={!showOtpInput}
                                            disabled={isLoading}
                                        />
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label htmlFor="otpCodeInput">Enter 5-Digit OTP Code</label>
                                        <input
                                            id="otpCodeInput"
                                            value={otpCode}
                                            onChange={this.handleOtpCodeChange}
                                            className="form-control"
                                            type="text"
                                            placeholder="XXXXX"
                                            name="otpCode"
                                            autoComplete="one-time-code"
                                            required={showOtpInput}
                                            disabled={isLoading}
                                            maxLength={5}
                                            pattern="\d{5}"
                                            inputMode="numeric"
                                        />
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
                                    {!showOtpInput ? (
                                        <Link to="/recover" className="kt-link">Forgot Password?</Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={this.resetToPasswordMode}
                                            className="btn btn-link kt-link p-0"
                                            disabled={isLoading}
                                        >
                                            Use Password Instead?
                                        </button>
                                    )}
                                </div>
                                
                                <button
                                    type="submit"
                                    className="btn btn-brand btn-block btn-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (showOtpInput ? 'Verify OTP' : 'Sign In')}
                                </button>
                                 <div className="mt-4 text-center">
                                    Don't have an account? <Link to="/register" className="kt-link">Register Here</Link>
                                </div>
                            </form>
                        </div>

                        <div className="col-lg-5 login-info-panel order-lg-1"> {/* Info on Left on Desktop */}
                            <div>
                                <h1 className="text-logo">Shule Plus</h1>
                                <h1>Welcome Back!</h1>
                                <p className="mb-4">
                                    Access your school's dashboard to manage learning, transportation, and communication seamlessly.
                                </p>
                                <p>
                                    Shule Plus empowers educators and administrators with the tools they need for a smarter, more efficient school environment.
                                </p>
                                 <div className="login-info-footer">
                                    © {new Date().getFullYear()} Shule Plus. All Rights Reserved.
                                    <br/>
                                    Need help? <a href="mailto:shuleplusadmin@gmail.com">Contact Support</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Login;