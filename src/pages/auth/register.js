import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "../../utils/requests"; // Ensure this path is correct
import Data from "../../utils/data"; // Ensure this path is correct

// --- Helper Functions for Color Manipulation (from Login component) ---
const hexToRgb = (hex) => {
    if (!hex) return null;
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const getContrastColor = (hexColor) => {
    if (!hexColor) return '#ffffff';
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#ffffff';
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

const darkenColor = (hex, percent) => {
    if (!hex) return null;
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - percent / 100)));
    g = Math.max(0, Math.floor(g * (1 - percent / 100)));
    b = Math.max(0, Math.floor(b * (1 - percent / 100)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
// --- End Helper Functions ---


// --- Staff Form & Table (for Admin Registration Flow) ---
const StaffForm = ({ type, onAddStaff, tempStaff, setTempStaff, error, schoolId }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempStaff(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddStaff(type, schoolId);
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
// --- End Staff Components ---


const Register = () => {
    const history = useHistory();
    const location = useLocation();

    // Common State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(""); // General error for the current form/step

    // School/Admin Registration State
    const [currentStep, setCurrentStep] = useState(1);
    const [schoolName, setSchoolName] = useState("");
    const [schoolAddress, setSchoolAddress] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPhone, setAdminPhone] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [activeStaffTab, setActiveStaffTab] = useState('drivers');
    const [tempStaffMember, setTempStaffMember] = useState({ name: '', phone: '', email: '' });
    const [staffFormError, setStaffFormError] = useState('');
    const [driversToInvite, setDriversToInvite] = useState([]);
    const [teachersToInvite, setTeachersToInvite] = useState([]);
    const [adminsToInvite, setAdminsToInvite] = useState([]);
    const [createdSchoolId, setCreatedSchoolId] = useState(null); // For admin flow step 2
    const [registrationData, setRegistrationData] = useState(null); // For admin flow temporary data

    // Student Registration State (used if schoolId is in URL)
    const [schoolIdFromUrl, setSchoolIdFromUrl] = useState(null);
    const [schoolMeta, setSchoolMeta] = useState(null); // { name, logoUrl, themeColor }
    const [isFetchingSchoolMeta, setIsFetchingSchoolMeta] = useState(false);
    const [schoolMetaError, setSchoolMetaError] = useState(null);
    const [classes, setClasses] = useState([]);
    const [isFetchingClasses, setIsFetchingClasses] = useState(false);
    const [classesError, setClassesError] = useState(null);
    
    const [parentName, setParentName] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [studentName, setStudentName] = useState("");
    const [studentClassId, setStudentClassId] = useState(""); // Store class _id
    const [studentRoute, setStudentRoute] = useState("");


    useEffect(() => {
        console.log("Register useEffect location:", location);
        const queryParams = new URLSearchParams(location.search);
        const schoolIdQuery = queryParams.get('school');

        if (schoolIdQuery) {
            console.log("Found schoolId in query params:", schoolIdQuery);
            setSchoolIdFromUrl(schoolIdQuery);
            document.title = "Student Registration - Loading...";
            fetchSchoolMetaData(schoolIdQuery);
            fetchClassesForSchool(schoolIdQuery);
        } else {
            console.log("No schoolId in query params");
            document.title = "Register - Shule Plus";
            // Reset any student-specific states if navigating away from a student registration URL
            setSchoolIdFromUrl(null);
            setSchoolMeta(null);
            setClasses([]);
        }
    }, [location.search]);

    const fetchSchoolMetaData = async (id) => {
        setIsFetchingSchoolMeta(true);
        setSchoolMetaError(null);
        try {
            const response = await axios.get(`${API}/auth/meta`, { params: { schoolId: id } });
            setSchoolMeta(response.data);
            if (response.data && response.data.name) {
                document.title = `Student Registration - ${response.data.name}`;
            }
        } catch (err) {
            console.error("Failed to fetch school metadata:", err);
            setSchoolMetaError(err.response?.data?.error || "Could not load school details. Please check the School ID or try again later.");
            document.title = "Student Registration - Error";
        } finally {
            setIsFetchingSchoolMeta(false);
        }
    };

    const fetchClassesForSchool = async (id) => {
        setIsFetchingClasses(true);
        setClassesError(null);
        try {
            const response = await axios.get(`${API}/auth/classes`, { params: { school: id } });
            setClasses(response.data || []);
        } catch (err) {
            console.error("Failed to fetch classes:", err);
            setClassesError(err.response?.data?.error || "Could not load class information for this school.");
        } finally {
            setIsFetchingClasses(false);
        }
    };

    const CustomStyles = () => {
        const defaultBrandColor = "rgb(238, 158, 61)";
        let themeColor = defaultBrandColor;
        if (schoolIdFromUrl && schoolMeta && schoolMeta.themeColor) {
            themeColor = schoolMeta.themeColor;
        }
        const brandColorDarker = darkenColor(themeColor, 15) || "rgb(218, 138, 41)";
        const brandColorLighter = darkenColor(themeColor, -15) || "rgb(242, 178, 81)"; // Lighten
        const infoPanelTextColor = schoolIdFromUrl && schoolMeta ? getContrastColor(themeColor) : "#fff";
        const infoPanelLinkColor = infoPanelTextColor === '#000000' ? darkenColor(themeColor, 20) || brandColorDarker : '#ffffff';


        return (
        <style>{`
            :root {
                --brand-color: ${themeColor};
                --brand-color-darker: ${brandColorDarker};
                --brand-color-lighter: ${brandColorLighter};
                --info-text-color: ${infoPanelTextColor};
                --info-panel-link-color: ${infoPanelLinkColor};
                --info-text-opacity: 0.9;
            }
            /* ... (Keep all other styles from your provided CSS, they will now use these dynamic CSS variables) ... */
            body { background-color: #eef1f5; font-family: 'Roboto', 'Segoe UI', sans-serif; line-height: 1.6; }
            .register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
            .register-card { background-color: #fff; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); overflow: hidden; display: flex; flex-direction: column-reverse; width: 100%; max-width: 1100px; }
            .form-panel { padding: 2rem; overflow-y: auto; max-height: 90vh; }
            .info-panel { background: var(--brand-color); color: var(--info-text-color); padding: 2.5rem; display: flex; flex-direction: column; justify-content: center; }
            .text-logo { font-family: 'Poppins', 'Segoe UI', sans-serif; font-size: 2.2rem; font-weight: 700; color: var(--brand-color); margin-bottom: 0; }
            .info-panel .text-logo { color: var(--info-text-color); margin-bottom: 1.5rem; text-align: left; }
            .school-logo-image { max-height: 60px; margin-bottom: 1rem; display: block; }
            .info-panel .school-logo-image { filter: ${infoPanelTextColor === '#000000' ? 'none' : 'brightness(0) invert(1)'}; }


            .info-panel h1:not(.text-logo) { font-size: 2.2rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.3; color: var(--info-text-color); }
            .info-panel p, .info-panel li { font-size: 1rem; line-height: 1.7; opacity: var(--info-text-opacity); color: var(--info-text-color); }
            .info-panel ul { list-style-type: none; padding-left: 0; }
            .info-panel ul li::before { content: '✓'; margin-right: 10px; font-weight: bold; color: var(--brand-color-lighter); }
            .form-title { color: var(--brand-color); font-weight: 600; font-size: 1.8rem; border-bottom: 2px solid var(--brand-color); padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
            .form-section-title { color: #333; font-size: 1.15rem; font-weight: 500; margin-top: 1.5rem; margin-bottom: 1rem; }
            .btn-brand { background-color: var(--brand-color); border-color: var(--brand-color); color: ${getContrastColor(themeColor)}; font-weight: 500; padding: 0.65rem 1.25rem; transition: background-color 0.2s ease-in-out; }
            .btn-brand:hover, .btn-brand:focus { background-color: var(--brand-color-darker); border-color: var(--brand-color-darker); color: ${getContrastColor(brandColorDarker)}; }
            .nav-tabs .nav-link.active { color: var(--brand-color); border-color: #dee2e6 #dee2e6 var(--brand-color) !important; font-weight: 500; background-color: #fff; }
            .nav-tabs .nav-link { color: #555; }
            .nav-tabs .nav-link:hover { border-color: #e9ecef #e9ecef #dee2e6; color: var(--brand-color-darker); }
            .kt-link { color: var(--brand-color); font-weight: 500; }
            .kt-link:hover { color: var(--brand-color-darker); text-decoration: underline; }
            .form-control:focus { border-color: var(--brand-color); box-shadow: 0 0 0 0.2rem ${hexToRgb(themeColor) ? `rgba(${hexToRgb(themeColor).r}, ${hexToRgb(themeColor).g}, ${hexToRgb(themeColor).b}, 0.25)` : 'rgba(238, 158, 61, 0.25)'}; }
            .alert-danger { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; }
            .info-footer { margin-top: auto; padding-top: 1.5rem; font-size: 0.85rem; opacity: 0.8; text-align: center; }
            .info-footer a { color: var(--info-panel-link-color); font-weight: bold; text-decoration: none; }
            .info-footer a:hover { text-decoration: underline; }
            .page-loader { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 300px; }
            .page-loader .spinner-border { width: 3rem; height: 3rem; color: var(--brand-color); }

            @media (max-width: 991.98px) { 
                .info-panel { padding: 2rem 1.5rem; text-align: center; }
                .info-panel .text-logo, .info-panel .school-logo-image { text-align: center; margin-left: auto; margin-right: auto; }
                .info-panel .text-logo { font-size: 2rem; }
                .info-panel h1:not(.text-logo) { font-size: 1.8rem; }
                .form-panel { padding: 1.5rem; max-height: none; }
                .form-title { font-size: 1.6rem; }
                .register-card { flex-direction: column; }
            }
            @media (min-width: 992px) { .register-card { flex-direction: row; } .info-panel .text-logo, .info-panel .school-logo-image { text-align: left; margin-left: 0; margin-right: 0;}}
        `}</style>
        );
    };

    // --- School/Admin Registration Logic ---
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
            const payload = { name: schoolName, phone: adminPhone, email: adminEmail, address: schoolAddress, password: adminPassword }; // Added password to payload
            const res = await axios.post(`${API}/auth/register`, payload); // Assuming /auth/register handles school and initial admin
            const { token, data } = res.data;

            if (!token || !data || !data.admin || !data.admin.school || !data.admin.user) {
                 throw new Error("Registration response was incomplete. Please contact support.");
            }
            setRegistrationData({ token, user: data.admin.user, schoolId: data.admin.school });
            setCreatedSchoolId(data.admin.school);
            setCurrentStep(2);
            setError("");
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred during registration.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaffMember = (type, schoolIdForStaff) => {
        setStaffFormError('');
        const { name, phone, email } = tempStaffMember;
        if (!name.trim() || !phone.trim()) {
            setStaffFormError(`Name and Phone are required for ${type}.`); return;
        }
        if (!/^\d{10,15}$/.test(phone.replace(/\s+/g, ''))) {
            setStaffFormError(`Please enter a valid phone number (10-15 digits) for ${type}.`); return;
        }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStaffFormError(`Please enter a valid email for ${type} or leave it blank.`); return;
        }
        const newStaff = { names: name, name, phone, email: email || null, school: schoolIdForStaff };
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
            setError("Critical registration data is missing. Please restart registration.");
            setLoading(false); setCurrentStep(1); return;
        }
        try {
            localStorage.setItem("authorization", registrationData.token);
            localStorage.setItem("user", JSON.stringify(registrationData.user)); // Use user from registrationData
            localStorage.setItem("school", registrationData.schoolId);
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!localStorage.getItem("authorization") || !localStorage.getItem("user") || !localStorage.getItem("school")) {
                 throw new Error("Failed to persist session. Please try again.");
            }
            await Data.init();
            if (inviteStaff) {
                const schoolIdForStaff = registrationData.schoolId;
                for (const driver of driversToInvite) await Data.drivers.create({...driver, school: schoolIdForStaff});
                for (const teacher of teachersToInvite) await Data.teachers.create({...teacher, school: schoolIdForStaff});
                for (const admin of adminsToInvite) await Data.admins.create({...admin, school: schoolIdForStaff});
            }
            history.push('/trips/all');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "An error occurred while finalizing setup.";
            setError(errorMessage);
            // Optionally clear localStorage on final failure:
            // localStorage.removeItem("authorization"); localStorage.removeItem("user"); localStorage.removeItem("school");
        } finally {
            setLoading(false);
        }
    };
    // --- End School/Admin Registration Logic ---


    // --- Student Registration Logic ---
    const handleStudentRegistrationSubmit = async (event) => {
        event.preventDefault();
        setError(""); // Clear general error, specific errors handled by form validation
        if (!parentName || !parentPhone || !parentEmail || !studentName || !studentClassId || !studentRoute) {
            setError("All fields are required for student registration.");
            return;
        }
        if (!/^\d{10,15}$/.test(parentPhone.replace(/\s+/g, ''))) {
            setError("Please enter a valid parent phone number (10-15 digits).");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
            setError("Please enter a valid parent email address.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                school: schoolIdFromUrl,
                parent: { name: parentName, phone: parentPhone, email: parentEmail },
                student: { name: studentName, class: studentClassId, route: studentRoute }
            };
            const res = await axios.post(`${API}/auth/register/student`, payload);
            const { token, user } = res.data;

            if (!token || !user) {
                throw new Error("Student registration failed: Incomplete response from server.");
            }
            
            // Login student
            localStorage.setItem("authorization", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("school", schoolIdFromUrl); // Or user.school if backend provides it on user obj
            
            await Data.init(); // Initialize Data module with new token
            history.push('/trips/all'); // Or a student-specific dashboard path

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || "An unexpected error occurred during student registration.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    // --- End Student Registration Logic ---

    const currentSchoolDisplayName = (schoolIdFromUrl && schoolMeta?.name) ? schoolMeta.name : "Shule Plus";
    const currentSchoolLogo = (schoolIdFromUrl && schoolMeta?.logoUrl) ? schoolMeta.logoUrl : null;

    const renderSchoolAdminRegistrationStep1 = () => (
        <>
            <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none"><h1 className="text-logo">Shule Plus</h1></Link>
            </div>
            <h3 className="form-title">Step 1: Register Your School & Admin</h3>
            <p className="text-muted mb-4">Provide school details and create your administrator account.</p>
            <form id="schoolAdminRegisterForm" onSubmit={handleSchoolRegistration} autoComplete="off">
                {error && <div className="alert alert-danger">{error}</div>}
                <h5 className="form-section-title">School Details</h5>
                <div className="form-group"><input onChange={(e) => setSchoolName(e.target.value)} value={schoolName} className="form-control" type="text" placeholder="Official School Name" name="schoolName" required /></div>
                <div className="form-group"><input onChange={(e) => setSchoolAddress(e.target.value)} value={schoolAddress} className="form-control" type="text" placeholder="School's Address" name="schoolAddress" required /></div>
                <h5 className="form-section-title">Your Administrator Details</h5>
                <div className="form-group"><input onChange={(e) => setAdminName(e.target.value)} value={adminName} className="form-control" type="text" placeholder="Your Full Name" name="adminName" required /></div>
                <div className="form-row">
                    <div className="form-group col-md-6"><input onChange={(e) => setAdminEmail(e.target.value)} value={adminEmail} className="form-control" type="email" placeholder="Your Email (for login)" name="adminEmail" required /></div>
                    <div className="form-group col-md-6"><input onChange={(e) => setAdminPhone(e.target.value)} value={adminPhone} className="form-control" type="tel" placeholder="Your Phone (07...)" name="adminPhone" required pattern="[0-9]{10,15}" title="Phone number should be 10-15 digits"/></div>
                </div>
                <div className="form-group"><input onChange={(e) => setAdminPassword(e.target.value)} value={adminPassword} className="form-control" type="password" placeholder="Create Password (min. 6 characters)" name="adminPassword" required /></div>
                <button type="submit" className="btn btn-brand btn-block btn-lg mt-4" disabled={loading}>{loading ? "Registering..." : "Register & Proceed"}</button>
            </form>
            <div className="mt-4 text-center"><Link to="/" className="kt-link">Already have an account? Login</Link></div>
        </>
    );

    const renderSchoolAdminRegistrationStep2 = () => (
        <>
            <div className="text-center mb-4"><Link to="/" className="text-decoration-none"><h1 className="text-logo">Shule Plus</h1></Link></div>
            <h3 className="form-title">Step 2: Invite Your Team (Optional)</h3>
            <p className="text-muted mb-3">Add key personnel. School ID: <strong>{createdSchoolId}</strong>. You can skip this.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item"><a className={`nav-link ${activeStaffTab === 'drivers' ? 'active' : ''}`} onClick={() => {setActiveStaffTab('drivers'); setStaffFormError('');}}>Drivers</a></li>
                <li className="nav-item"><a className={`nav-link ${activeStaffTab === 'teachers' ? 'active' : ''}`} onClick={() => {setActiveStaffTab('teachers'); setStaffFormError('');}}>Teachers</a></li>
                <li className="nav-item"><a className={`nav-link ${activeStaffTab === 'admins' ? 'active' : ''}`} onClick={() => {setActiveStaffTab('admins'); setStaffFormError('');}}>More Admins</a></li>
            </ul>
            {activeStaffTab === 'drivers' && (<><StaffForm type="Driver" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} schoolId={createdSchoolId} /><StaffTable type="Driver" staffList={driversToInvite} onRemoveStaff={handleRemoveStaffMember} /></>)}
            {activeStaffTab === 'teachers' && (<><StaffForm type="Teacher" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} schoolId={createdSchoolId} /><StaffTable type="Teacher" staffList={teachersToInvite} onRemoveStaff={handleRemoveStaffMember} /></>)}
            {activeStaffTab === 'admins' && (<><StaffForm type="Admin" onAddStaff={handleAddStaffMember} tempStaff={tempStaffMember} setTempStaff={setTempStaffMember} error={staffFormError} schoolId={createdSchoolId} /><StaffTable type="Admin" staffList={adminsToInvite} onRemoveStaff={handleRemoveStaffMember} /></>)}
            <div className="d-flex flex-column flex-sm-row justify-content-between mt-4">
                <button className="btn btn-outline-secondary mb-2 mb-sm-0" onClick={() => proceedToDashboard(false)} disabled={loading}>{loading && !driversToInvite.length && !teachersToInvite.length && !adminsToInvite.length ? "Processing..." : "Skip & Go to Dashboard"}</button>
                <button className="btn btn-brand" onClick={() => proceedToDashboard(true)} disabled={loading || (driversToInvite.length === 0 && teachersToInvite.length === 0 && adminsToInvite.length === 0)}>{loading && (driversToInvite.length > 0 || teachersToInvite.length > 0 || adminsToInvite.length > 0) ? "Inviting..." : "Invite & Go to Dashboard"}</button>
            </div>
            <div className="mt-3"><button className="btn btn-link pl-0 kt-link" onClick={() => { setError(''); setCurrentStep(1); }}>← Back to School Registration</button></div>
        </>
    );

    const renderStudentRegistrationForm = () => (
        <>
            <div className="text-center mb-4">
                {currentSchoolLogo && <img src={currentSchoolLogo} alt={`${currentSchoolDisplayName} Logo`} className="school-logo-image"/>}
                <h1 className="text-logo">{currentSchoolDisplayName}</h1>
            </div>
            <h3 className="form-title">Student Registration</h3>
            <p className="text-muted mb-4">Register as a new student for {currentSchoolDisplayName}.</p>

            {schoolMetaError && <div className="alert alert-danger">{schoolMetaError}</div>}
            {classesError && <div className="alert alert-warning">Could not load class list: {classesError}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleStudentRegistrationSubmit} autoComplete="off">
                <h5 className="form-section-title">Parent/Guardian Details</h5>
                <div className="form-group"><input type="text" className="form-control" placeholder="Parent/Guardian Full Name" value={parentName} onChange={e => setParentName(e.target.value)} required /></div>
                <div className="form-row">
                    <div className="form-group col-md-6"><input type="tel" className="form-control" placeholder="Parent Phone (07...)" value={parentPhone} onChange={e => setParentPhone(e.target.value)} required pattern="[0-9]{10,15}" title="Phone number should be 10-15 digits"/></div>
                    <div className="form-group col-md-6"><input type="email" className="form-control" placeholder="Parent Email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} required /></div>
                </div>

                <h5 className="form-section-title">Student Details</h5>
                <div className="form-group"><input type="text" className="form-control" placeholder="Student Full Name" value={studentName} onChange={e => setStudentName(e.target.value)} required /></div>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <select className="form-control" value={studentClassId} onChange={e => setStudentClassId(e.target.value)} required disabled={isFetchingClasses || classes.length === 0}>
                            <option value="">Select Class</option>
                            {isFetchingClasses && <option disabled>Loading classes...</option>}
                            {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.name}</option>)}
                        </select>
                         {classes.length === 0 && !isFetchingClasses && !classesError && <small className="form-text text-muted">No classes available for selection.</small>}
                    </div>
                    <div className="form-group col-md-6"><input type="text" className="form-control" placeholder="Student Route/Location" value={studentRoute} onChange={e => setStudentRoute(e.target.value)} required /></div>
                </div>

                <button type="submit" className="btn btn-brand btn-block btn-lg mt-4" disabled={loading || isFetchingSchoolMeta || isFetchingClasses || !!schoolMetaError}>
                    {loading ? "Registering Student..." : "Register & Login"}
                </button>
            </form>
             <div className="mt-4 text-center">
                <Link to={`/${schoolIdFromUrl ? `?schoolId=${schoolIdFromUrl}` : ''}`} className="kt-link">Already registered for {currentSchoolDisplayName}? Login</Link>
            </div>
        </>
    );

    if (schoolIdFromUrl && (isFetchingSchoolMeta || (isFetchingClasses && !classes.length))) { // Show loader if fetching essential initial data for student form
        return (
            <>
                <CustomStyles />
                <div className="register-container">
                    <div className="register-card" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
                        <div className="page-loader">
                            <div className="spinner-border" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p className="mt-2">Loading registration details...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    

    return (
        <>
            <CustomStyles />
            <div className="register-container">
                <div className="register-card">
                    <div className="col-lg-7 form-panel order-lg-2 order-md-2 order-sm-2 order-2"> {/* Form first on mobile */}
                        {schoolIdFromUrl ? 
                            renderStudentRegistrationForm() : 
                            (currentStep === 1 ? renderSchoolAdminRegistrationStep1() : renderSchoolAdminRegistrationStep2())
                        }
                    </div>
                    <div className="col-lg-5 info-panel order-lg-1 order-md-1 order-sm-1 order-1"> {/* Info second on mobile */}
                        <div>
                            {currentSchoolLogo && schoolIdFromUrl && <img src={currentSchoolLogo} alt="" className="school-logo-image mb-3" aria-hidden="true"/>}
                            <h1 className="text-logo" style={{color: 'var(--info-text-color)'}}>{currentSchoolDisplayName}</h1>
                            
                            {schoolIdFromUrl && schoolMeta ? (
                                <>
                                    <h1>Welcome to {schoolMeta.name}!</h1>
                                    <p className="mb-4">Register as a student to access learning materials, track transportation, and stay connected with your school community.</p>
                                    <ul>
                                        <li>Easy and Quick Sign-Up</li>
                                        <li>Access Your Personalized Dashboard</li>
                                        <li>Stay Updated with School News</li>
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <h1>The Ultimate Platform for Learning & Learner Management.</h1>
                                    <p className="mb-4">Join Shule Plus today and transform your school's operations. Get started instantly—it's free, with no payment required upfront!</p>
                                    <ul>
                                        <li>Streamlined Student & Staff Management</li>
                                        <li>Real-time Bus Tracking & Transportation Logistics</li>
                                        <li>Comprehensive Digital Curriculum Access</li>
                                        <li>Seamless Parent-School Communication</li>
                                    </ul>
                                </>
                            )}
                            <p><strong>Ready to get started?</strong> Complete the simple steps to gain immediate access.</p>
                            <div className="info-footer">
                                © {new Date().getFullYear()} {currentSchoolDisplayName}. All Rights Reserved.
                                <br/>
                                Need help? <a href={`mailto:${(schoolIdFromUrl && schoolMeta?.supportEmail) || 'shuleplusadmin@gmail.com'}`}>Contact Support</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;