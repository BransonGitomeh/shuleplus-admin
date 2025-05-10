import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { API } from "../../utils/requests"; // Ensure this path is correct
import Data from "../../utils/data"; // Ensure this path is correct

// --- Helper Components for Staff Invitation (Step 2) ---
const StaffForm = ({ type, onAddStaff, tempStaff, setTempStaff, error }) => {
    const handleChange = (e) => {
        setTempStaff(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddStaff(type);
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
                    <button type="submit" className="btn btn-sm btn-block text-white" style={{ backgroundColor: 'var(--brand-color)' }}>Add</button>
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

    // CSS for branding and layout enhancements
    const brandColor = "rgb(238, 158, 61)";
    const CustomStyles = () => (
        <style>{`
            :root {
                --brand-color: ${brandColor};
                --brand-color-darker: rgb(218, 138, 41);
            }
            body {
                background-color: #f4f7f6; /* Light gray page background */
                font-family: 'Roboto', 'Segoe UI', sans-serif;
            }
            .register-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem 1rem;
            }
            .register-card {
                background-color: #fff;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                display: flex;
                width: 100%;
                max-width: 1200px; /* Max width for the card */
            }
            .form-panel {
                padding: 2.5rem 3rem; /* More padding */
                overflow-y: auto; /* Scroll if content overflows */
                max-height: 90vh; /* Limit height to allow scrolling */
            }
            .info-panel {
                background-color: var(--brand-color);
                color: white;
                padding: 3rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .info-panel h1 {
                font-size: 2.8rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                line-height: 1.2;
            }
            .info-panel p, .info-panel li {
                font-size: 1.05rem;
                line-height: 1.7;
                opacity: 0.95;
            }
            .info-panel ul {
                list-style-type: none;
                padding-left: 0;
            }
            .info-panel ul li::before {
                content: '✓';
                margin-right: 10px;
                font-weight: bold;
            }
            .form-title {
                color: var(--brand-color);
                font-weight: 600;
                border-bottom: 2px solid var(--brand-color);
                padding-bottom: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .form-section-title {
                color: #444;
                font-size: 1.2rem;
                font-weight: 500;
                margin-top: 1.5rem;
                margin-bottom: 1rem;
            }
            .btn-brand {
                background-color: var(--brand-color);
                border-color: var(--brand-color);
                color: white;
                font-weight: 500;
                padding: 0.75rem 1.5rem;
            }
            .btn-brand:hover {
                background-color: var(--brand-color-darker);
                border-color: var(--brand-color-darker);
                color: white;
            }
            .nav-tabs .nav-link.active {
                color: var(--brand-color);
                border-color: #dee2e6 #dee2e6 var(--brand-color) !important;
                font-weight: 500;
            }
            .nav-tabs .nav-link {
                color: #6c757d;
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
            const payload = { schoolName, schoolAddress, adminName, adminEmail, adminPhone, adminPassword };
            const res = await axios.post(`${API}/auth/register`, payload);
            const { token, user, school } = res.data;

            if (!token || !user || !school || !school.id) {
                throw new Error("Registration response was incomplete. Please contact support.");
            }

            localStorage.setItem("authorization", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("school", school.id);
            setCreatedSchoolId(school.id);

            await Data.init();
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

    const handleAddStaffMember = (type) => {
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

        const newStaff = { names: name, name, phone, email: email || null };

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

        try {
            if (inviteStaff) {
                for (const driver of driversToInvite) await Data.drivers.create(driver);
                for (const teacher of teachersToInvite) await Data.teachers.create(teacher);
                for (const admin of adminsToInvite) await Data.admins.create(admin);
            }
            await Data.init();
            history.push('/trips/all');
        } catch (err) {
            console.error("Error proceeding to dashboard:", err);
            const errorMessage = err.response?.data?.message || err.message || "An error occurred while inviting staff or loading data.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <>
            <div className="text-center mb-4">
                <Link to="/">
                    <img src="/shulepluslogo.png" alt="Shule Plus Logo" style={{height: '50px', filter: 'brightness(0) invert(1)', mixBlendMode: 'difference' }} />
                    {/* Assuming you want the logo visible on the form side. Adjust styling as needed */}
                </Link>
            </div>
            <h2 className="form-title">Step 1: Register Your School & Admin</h2>
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

                <button type="submit" className="btn btn-brand btn-block mt-4" disabled={loading}>
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
            <h2 className="form-title">Step 2: Invite Your Team (Optional)</h2>
            <p className="text-muted mb-3">Add key personnel for School ID: <strong>{createdSchoolId}</strong>. You can skip this and add them later.</p>

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

            {/* Render StaffForm and StaffTable based on activeStaffTab */}
            {activeStaffTab === 'drivers' && (
                <>
                    <StaffForm type="Driver" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} />
                    <StaffTable type="Driver" staffList={driversToInvite} onRemoveStaff={handleRemoveStaffMember} />
                </>
            )}
             {activeStaffTab === 'teachers' && (
                <>
                    <StaffForm type="Teacher" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} />
                    <StaffTable type="Teacher" staffList={teachersToInvite} onRemoveStaff={handleRemoveStaffMember} />
                </>
            )}
             {activeStaffTab === 'admins' && (
                <>
                    <StaffForm type="Admin" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} />
                    <StaffTable type="Admin" staffList={adminsToInvite} onRemoveStaff={handleRemoveStaffMember} />
                </>
            )}


            <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary" onClick={() => proceedToDashboard(false)} disabled={loading}>
                    {loading ? "Processing..." : "Skip & Go to Dashboard"}
                </button>
                <button className="btn btn-brand" onClick={() => proceedToDashboard(true)} disabled={loading}>
                    {loading ? "Inviting..." : "Invite Added Staff & Go to Dashboard"}
                </button>
            </div>
            <div className="mt-3">
                <button className="btn btn-link pl-0 kt-link" onClick={() => setCurrentStep(1)}>
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
                    <div className="col-lg-7 form-panel"> {/* Form Panel (Left) */}
                        {currentStep === 1 ? renderStep1() : renderStep2()}
                    </div>
                    <div className="col-lg-5 info-panel d-none d-lg-flex"> {/* Info Panel (Right) - Hidden on smaller screens */}
                        <div>
                             {/* <img src="res/mipmap-xhdpi/ic_launcher.png" alt="Shule Plus Logo" style={{height: '60px', marginBottom: '2rem'}} /> */}
                             {/* Replace /shulepluslogo.png with your actual logo path */}
                            <h1>The Ultimate Platform for Learning & Learner Management.</h1>
                            <p className="mb-4">Join Shule Plus today and transform your school's operations. Get started instantly—it's free, with no payment required upfront!</p>
                            <ul className="mb-4">
                                <li>Streamlined Student & Staff Management</li>
                                <li>Real-time Bus Tracking & Transportation Logistics</li>
                                <li>Comprehensive Digital Curriculum Access</li>
                                <li>Seamless Parent-School Communication</li>
                                <li>Powerful Reporting & Analytics</li>
                            </ul>
                            <p><strong>Ready to elevate your school?</strong> Complete the simple steps on the left to gain immediate access to your powerful Shule Plus dashboard.</p>
                            <div style={{marginTop: 'auto', paddingTop: '20px', fontSize: '0.9em', opacity: 0.8}}>
                                © {new Date().getFullYear()} Shule Plus. All Rights Reserved.
                                <br/>
                                Need help? <a href="mailto:shuleplusadmin@gmail.com" style={{color: 'white', fontWeight: 'bold'}}>Contact Support</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;