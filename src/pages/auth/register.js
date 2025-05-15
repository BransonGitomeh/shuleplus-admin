import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { API } from "../../utils/requests"; // Ensure this path is correct
import Data from "../../utils/data"; // Ensure this path is correct

const StaffForm = ({ type, onAddStaff, tempStaff, setTempStaff, error, schoolId }) => { // Accept schoolId
    const handleChange = (e) => {
        // Extract the necessary properties from the event object synchronously
        const { name, value } = e.target;
        setTempStaff(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddStaff(type, schoolId); // Pass schoolId to onAddStaff
    };

    return (
        <form onSubmit={handleSubmit} className="mb-3 p-3 border rounded bg-light shadow-sm">
            <h5 className="mb-3 text-secondary">Add New {type}</h5>
            {error && <div className="alert alert-danger py-1 px-2" style={{fontSize: '0.9em'}}>{error}</div>}
            <div className="form-row align-items-end">
                <div className="form-group col-sm-12 col-md-4 mb-2">
                    <label htmlFor={`staffName-${type}`} className="sr-only">Full Name</label>
                    <input type="text" name="name" id={`staffName-${type}`} className="form-control form-control-sm" placeholder="Full Name" value={tempStaff.name} onChange={handleChange} required />
                </div>
                <div className="form-group col-sm-6 col-md-3 mb-2">
                    <label htmlFor={`staffPhone-${type}`} className="sr-only">Phone</label>
                    <input type="tel" name="phone" id={`staffPhone-${type}`} className="form-control form-control-sm" placeholder="Phone (07...)" value={tempStaff.phone} onChange={handleChange} required pattern="[0-9]{10,15}" title="Phone number should be 10-15 digits"/>
                </div>
                <div className="form-group col-sm-6 col-md-4 mb-2">
                     <label htmlFor={`staffEmail-${type}`} className="sr-only">Email</label>
                    <input type="email" name="email" id={`staffEmail-${type}`} className="form-control form-control-sm" placeholder="Email (Optional)" value={tempStaff.email} onChange={handleChange} />
                </div>
                <div className="form-group col-sm-12 col-md-1 mb-2">
                    <button type="submit" className="btn btn-sm btn-block text-white" style={{ backgroundColor: 'var(--brand-color-darker)' }}>Add</button>
                </div>
            </div>
        </form>
    );
};


const StaffTable = ({ type, staffList, onRemoveStaff }) => (
    <div className="table-responsive mb-4" style={{maxHeight: '200px', overflowY: 'auto'}}>
        <table className="table table-sm table-striped table-hover">
            <thead className="thead-light sticky-top bg-white">
                <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {staffList.length === 0 ? (
                    <tr><td colSpan="4" className="text-center p-3 text-muted">No {type}s added yet.</td></tr>
                ) : (
                    staffList.map((staff, index) => (
                        <tr key={`${type}-${index}`}>
                            <td>{staff.names || staff.name}</td>
                            <td>{staff.phone}</td>
                            <td>{staff.email || '-'}</td>
                            <td><button className="btn btn-outline-danger btn-sm py-0 px-1" onClick={() => onRemoveStaff(type, index)}>Remove</button></td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);
// --- End Helper Components ---


const Register = () => {
    const history = useHistory();

    // Step 1: School and Admin Registration
    const [currentStep, setCurrentStep] = useState(1);
    const [schoolName, setSchoolName] = useState("");
    const [schoolAddress, setSchoolAddress] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPhone, setAdminPhone] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    // Step 2: Staff Invitation
    const [activeStaffTab, setActiveStaffTab] = useState('drivers');
    const [tempStaffMember, setTempStaffMember] = useState({ name: '', phone: '', email: '' });
    const [staffFormError, setStaffFormError] = useState('');

    const [driversToInvite, setDriversToInvite] = useState([]);
    const [teachersToInvite, setTeachersToInvite] = useState([]);
    const [adminsToInvite, setAdminsToInvite] = useState([]);

    // General state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdSchoolId, setCreatedSchoolId] = useState(null);
    
    // State to hold registration response data (token, user, schoolId) temporarily
    const [registrationData, setRegistrationData] = useState(null);


    // CSS for branding and layout enhancements
    const brandColor = "rgb(238, 158, 61)";
    const CustomStyles = () => (
        <style>{`
            :root {
                --brand-color: ${brandColor};
                --brand-color-darker: rgb(218, 138, 41); /* Darker shade for hovers/accents */
                --brand-color-lighter: rgb(242, 178, 81); /* Lighter shade */
                --info-text-color: #fff; /* White text for info panel */
                --info-text-opacity: 0.9;
            }
            body {
                background-color: #eef1f5; /* Softer page background */
                font-family: 'Roboto', 'Segoe UI', sans-serif;
                line-height: 1.6;
            }
            .register-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.5rem; /* Consistent padding */
            }
            .register-card {
                background-color: #fff;
                border-radius: 12px; /* Slightly softer radius */
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); /* Softer shadow */
                overflow: hidden;
                display: flex;
                flex-direction: column-reverse; /* Info panel on top on mobile */
                width: 100%;
                max-width: 1100px; /* Max width for the card */
            }
            .form-panel {
                padding: 2rem; 
                overflow-y: auto; 
                max-height: 90vh; /* Ensure it doesn't take full viewport height */
            }
            .info-panel {
                background: linear-gradient(135deg, var(--brand-color) 0%, var(--brand-color-darker) 100%);
                color: var(--info-text-color);
                padding: 2.5rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .text-logo {
                font-family: 'Poppins', 'Segoe UI', sans-serif; /* A nice font for logo */
                font-size: 2.2rem;
                font-weight: 700;
                color: var(--brand-color);
                margin-bottom: 0; /* Reset margin if used in info panel */
            }
            .info-panel .text-logo { /* Specific style for logo in info panel */
                 color: var(--info-text-color);
                 margin-bottom: 1.5rem;
                 text-align: left;
            }

            .info-panel h1 {
                font-size: 2.2rem; /* Adjusted for better balance */
                font-weight: 600;
                margin-bottom: 1rem;
                line-height: 1.3;
                color: var(--info-text-color);
            }
            .info-panel p, .info-panel li {
                font-size: 1rem;
                line-height: 1.7;
                opacity: var(--info-text-opacity);
                color: var(--info-text-color);
            }
            .info-panel ul {
                list-style-type: none;
                padding-left: 0;
            }
            .info-panel ul li::before {
                content: '✓';
                margin-right: 10px;
                font-weight: bold;
                color: var(--brand-color-lighter); /* Lighter checkmark for contrast */
            }
            .form-title {
                color: var(--brand-color);
                font-weight: 600;
                font-size: 1.8rem; /* Slightly smaller for balance */
                border-bottom: 2px solid var(--brand-color);
                padding-bottom: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .form-section-title {
                color: #333; /* Darker for better readability */
                font-size: 1.15rem;
                font-weight: 500;
                margin-top: 1.5rem;
                margin-bottom: 1rem;
            }
            .btn-brand {
                background-color: var(--brand-color);
                border-color: var(--brand-color);
                color: white;
                font-weight: 500;
                padding: 0.65rem 1.25rem; /* Adjusted padding */
                transition: background-color 0.2s ease-in-out;
            }
            .btn-brand:hover, .btn-brand:focus {
                background-color: var(--brand-color-darker);
                border-color: var(--brand-color-darker);
                color: white;
            }
            .nav-tabs .nav-link.active {
                color: var(--brand-color);
                border-color: #dee2e6 #dee2e6 var(--brand-color) !important;
                font-weight: 500;
                background-color: #fff; /* Ensure active tab bg is white */
            }
            .nav-tabs .nav-link {
                color: #555; /* Darker inactive tab text */
            }
            .nav-tabs .nav-link:hover {
                border-color: #e9ecef #e9ecef #dee2e6;
                color: var(--brand-color-darker);
            }
            .kt-link {
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
            .alert-danger {
                background-color: #f8d7da;
                border-color: #f5c6cb;
                color: #721c24;
            }
            .info-footer {
                margin-top: auto; /* Pushes footer to bottom */
                padding-top: 1.5rem; 
                font-size: 0.85rem; 
                opacity: 0.8;
                text-align: center; /* Center footer text */
            }
            .info-footer a {
                color: var(--info-text-color);
                font-weight: bold;
                text-decoration: none;
            }
            .info-footer a:hover {
                text-decoration: underline;
            }

            /* Mobile specific adjustments */
            @media (max-width: 991.98px) { /* Bootstrap lg breakpoint */
                .info-panel {
                    padding: 2rem 1.5rem; /* Less padding on mobile */
                    text-align: center; /* Center text on mobile */
                }
                .info-panel .text-logo {
                    text-align: center; /* Center logo on mobile */
                    font-size: 2rem;
                }
                .info-panel h1 {
                    font-size: 1.8rem;
                }
                .form-panel {
                    padding: 1.5rem;
                    max-height: none; /* Allow full scroll on mobile if needed */
                }
                .form-title {
                    font-size: 1.6rem;
                }
                 .register-card {
                    flex-direction: column; /* Ensure info panel remains on top on mobile */
                }
            }
            @media (min-width: 992px) { /* lg and up */
                .register-card {
                    flex-direction: row; /* Side-by-side layout */
                }
            }

        `}</style>
    );

    const handleSchoolRegistration = async (event) => {
        event.preventDefault();
        setError("");
        if (!schoolName || !schoolAddress || !adminName || !adminEmail || !adminPhone || !adminPassword) {
            setError("All fields for school and admin registration are required.");
            return;
        }
        if (adminPassword.length < 6) {
            setError("Admin password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            const payload = { name: schoolName, phone: adminPhone, email: adminEmail, address: schoolAddress };
            // This initial registration call usually doesn't require an auth token
            const res = await axios.post(`${API}/auth/register`, payload);
            const { token, data } = res.data;

            if (!token || !data || !data.admin || !data.admin.school || !data.admin.user) {
                throw new Error("Registration response was incomplete. Please contact support.");
            }

            // Store token and user data in component state, NOT localStorage yet
            setRegistrationData({
                token,
                user: data.admin.user,
                schoolId: data.admin.school // Assuming data.admin.school is the school ID
            });
            setCreatedSchoolId(data.admin.school); // For display purposes in Step 2

            // DO NOT call Data.init() or set localStorage here
            setCurrentStep(2);
            setError("");
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred during registration.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaffMember = (type, schoolId) => { // Accept schoolId
        setStaffFormError('');
        const { name, phone, email } = tempStaffMember;

        if (!name.trim() || !phone.trim()) {
            setStaffFormError(`Name and Phone are required for ${type}.`);
            return;
        }
         if (!/^\d{10,15}$/.test(phone.replace(/\s+/g, ''))) {
            setStaffFormError(`Please enter a valid phone number (10-15 digits) for ${type}.`);
            return;
        }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStaffFormError(`Please enter a valid email for ${type} or leave it blank.`);
            return;
        }

        const newStaff = { names: name, name, phone, email: email || null, school: schoolId }; // Add schoolId

        if (type === 'Driver') setDriversToInvite(prev => [...prev, newStaff]);
        else if (type === 'Teacher') setTeachersToInvite(prev => [...prev, newStaff]);
        else if (type === 'Admin') setAdminsToInvite(prev => [...prev, newStaff]);

        setTempStaffMember({ name: '', phone: '', email: '' });
    };

    const handleRemoveStaffMember = (type, index) => {
        if (type === 'Driver') setDriversToInvite(prev => prev.filter((_, i) => i !== index));
        else if (type === 'Teacher') setTeachersToInvite(prev => prev.filter((_, i) => i !== index));
        else if (type === 'Admin') setAdminsToInvite(prev => prev.filter((_, i) => i !== index));
    };

    const proceedToDashboard = async (inviteStaff = false) => {
        setLoading(true);
        setError("");

        if (!registrationData || !registrationData.token) {
            setError("Critical registration data is missing. Please try registering again from Step 1.");
            setLoading(false);
            setCurrentStep(1); // Force back to step 1
            return;
        }

        try {
            console.log("Set localStorage items NOW, just before needing them")
            localStorage.setItem("authorization", registrationData.token);
            localStorage.setItem("user", JSON.stringify(registrationData.user));
            localStorage.setItem("school", registrationData.schoolId); // Ensure this is the correct value/format

            // Delay briefly to allow localStorage to be written
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check that local storage has been set successfully
            if (!localStorage.getItem("authorization") || !localStorage.getItem("user") || !localStorage.getItem("school")) {
                setError("Failed to set local storage items. Please try registering again from Step 1.");
                setLoading(false);
                setCurrentStep(1); // Force back to step 1
                return;
            }

            // 2. Initialize Data (which should pick up the token from localStorage to configure API calls)
            await Data.init(); 

            // 3. If inviting staff, make the API calls
            // These Data.create methods will now use the token via the initialized Data module
            if (inviteStaff) {
                const schoolId = registrationData.schoolId; // Get schoolId
                for (const driver of driversToInvite) await Data.drivers.create({...driver, school: schoolId}); // Pass schoolId
                for (const teacher of teachersToInvite) await Data.teachers.create({...teacher, school: schoolId}); // Pass schoolId
                for (const admin of adminsToInvite) await Data.admins.create({...admin, school: schoolId}); // Pass schoolId
            }
            
            // 4. Navigate to the dashboard
            history.push('/trips/all');

        } catch (err) {
            console.error("Error proceeding to dashboard:", err);
            // Clear localStorage if final step failed? Or allow retry?
            // For now, just show error. User might be partially logged in.
            // localStorage.removeItem("authorization");
            // localStorage.removeItem("user");
            // localStorage.removeItem("school");
            const errorMessage = err.response?.data?.message || err.message || "An error occurred while inviting staff or finalizing setup.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <>
            <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                    <h1 className="text-logo">Shule Plus</h1>
                </Link>
            </div>
            <h3 className="form-title">Step 1: Register Your School & Admin</h3>
            <p className="text-muted mb-4">Provide school details and create your administrator account.</p>
            
            <form id="schoolAdminRegisterForm" onSubmit={handleSchoolRegistration} autoComplete="off">
                {error && <div className="alert alert-danger">{error}</div>}

                <h5 className="form-section-title">School Details</h5>
                <div className="form-group">
                    <input onChange={(e) => setSchoolName(e.target.value)} value={schoolName} className="form-control" type="text" placeholder="Official School Name" name="schoolName" required />
                </div>
                <div className="form-group">
                    <input onChange={(e) => setSchoolAddress(e.target.value)} value={schoolAddress} className="form-control" type="text" placeholder="School's Address (e.g., P.O Box 123, Town)" name="schoolAddress" required />
                </div>

                <h5 className="form-section-title">Your Administrator Details</h5>
                <div className="form-group">
                    <input onChange={(e) => setAdminName(e.target.value)} value={adminName} className="form-control" type="text" placeholder="Your Full Name" name="adminName" required />
                </div>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <input onChange={(e) => setAdminEmail(e.target.value)} value={adminEmail} className="form-control" type="email" placeholder="Your Email (for login)" name="adminEmail" required />
                    </div>
                    <div className="form-group col-md-6">
                        <input onChange={(e) => setAdminPhone(e.target.value)} value={adminPhone} className="form-control" type="tel" placeholder="Your Phone (07...)" name="adminPhone" required pattern="[0-9]{10,15}" title="Phone number should be 10-15 digits"/>
                    </div>
                </div>
                <div className="form-group">
                    <input onChange={(e) => setAdminPassword(e.target.value)} value={adminPassword} className="form-control" type="password" placeholder="Create Password (min. 6 characters)" name="adminPassword" required />
                </div>

                <button type="submit" className="btn btn-brand btn-block btn-lg mt-4" disabled={loading}>
                    {loading ? "Registering..." : "Register & Proceed to Invite Staff"}
                </button>
            </form>
            <div className="mt-4 text-center">
                <Link to="/login" className="kt-link">Already have an account? Login</Link>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
         <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                    <h1 className="text-logo">Shule Plus</h1>
                </Link>
            </div>
            <h3 className="form-title">Step 2: Invite Your Team (Optional)</h3>
            <p className="text-muted mb-3">
                Add key personnel for your school.
                {createdSchoolId && <span> School ID: <strong>{createdSchoolId}</strong>.</span>}
                You can skip this and add them later.
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <a className={`nav-link ${activeStaffTab === 'drivers' ? 'active' : ''}`} href="#!" onClick={() => {setActiveStaffTab('drivers'); setStaffFormError('');}}>Drivers</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeStaffTab === 'teachers' ? 'active' : ''}`} href="#!" onClick={() => {setActiveStaffTab('teachers'); setStaffFormError('');}}>Teachers</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeStaffTab === 'admins' ? 'active' : ''}`} href="#!" onClick={() => {setActiveStaffTab('admins'); setStaffFormError('');}}>More Admins</a>
                </li>
            </ul>

            {activeStaffTab === 'drivers' && (
                <>
                    <StaffForm type="Driver" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} schoolId={createdSchoolId} /> {/* Pass createdSchoolId here */}
                    <StaffTable type="Driver" staffList={driversToInvite} onRemoveStaff={handleRemoveStaffMember} />
                </>
            )}
             {activeStaffTab === 'teachers' && (
                <>
                    <StaffForm type="Teacher" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} schoolId={createdSchoolId} /> {/* Pass createdSchoolId here */}
                    <StaffTable type="Teacher" staffList={teachersToInvite} onRemoveStaff={handleRemoveStaffMember} />
                </>
            )}
             {activeStaffTab === 'admins' && (
                <>
                    <StaffForm type="Admin" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} schoolId={createdSchoolId} /> {/* Pass createdSchoolId here */}
                    <StaffTable type="Admin" staffList={adminsToInvite} onRemoveStaff={handleRemoveStaffMember} />
                </>
            )}

            <div className="d-flex flex-column flex-sm-row justify-content-between mt-4">
                <button className="btn btn-outline-secondary mb-2 mb-sm-0" onClick={() => proceedToDashboard(false)} disabled={loading}>
                    {loading && !driversToInvite.length && !teachersToInvite.length && !adminsToInvite.length ? "Processing..." : "Skip & Go to Dashboard"}
                </button>
                <button 
                    className="btn btn-brand" 
                    onClick={() => proceedToDashboard(true)} 
                    disabled={loading || (driversToInvite.length === 0 && teachersToInvite.length === 0 && adminsToInvite.length === 0)}
                >
                    {loading && (driversToInvite.length > 0 || teachersToInvite.length > 0 || adminsToInvite.length > 0) ? "Inviting..." : "Invite & Go to Dashboard"}
                </button>
            </div>
            <div className="mt-3">
                <button className="btn btn-link pl-0 kt-link" onClick={() => {
                    setError(''); // Clear any errors from step 2 when going back
                    setCurrentStep(1);
                    // Note: registrationData will persist, but user has to re-submit step 1 if they went back.
                    // Or, clear registrationData if you want them to fully restart.
                    // setRegistrationData(null); 
                }}>
                    ← Back to School Registration
                </button>
            </div>
        </>
    );

    return (
        <>
            <CustomStyles />
            <div className="register-container">
                <div className="register-card">
                    <div className="col-lg-7 form-panel order-lg-1">
                        {currentStep === 1 ? renderStep1() : renderStep2()}
                    </div>
                    <div className="col-lg-5 info-panel order-lg-2"> {/* Removed inline style for color */}
                        <div>
                             <h1 className="text-logo" style={{color: 'var(--info-text-color)'}}>Shule Plus</h1> {/* Ensured logo uses info text color */}
                            <h1>The Ultimate Platform for Learning & Learner Management.</h1>
                            <p className="mb-4">Join Shule Plus today and transform your school's operations. Get started instantly—it's free, with no payment required upfront!</p>
                            <ul className="mb-4">
                                <li>Streamlined Student & Staff Management</li>
                                <li>Real-time Bus Tracking & Transportation Logistics</li>
                                <li>Comprehensive Digital Curriculum Access</li>
                                <li>Seamless Parent-School Communication</li>
                                <li>Powerful Reporting & Analytics</li>
                            </ul>
                            <p><strong>Ready to elevate your school?</strong> Complete the simple steps to gain immediate access to your powerful Shule Plus dashboard.</p>
                            <div className="info-footer"> {/* Removed inline style for color */}
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
};

export default Register;