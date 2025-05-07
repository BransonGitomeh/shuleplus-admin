/* eslint-env browser */

import React from "react";
import { Link, withRouter } from "react-router-dom";
import Data from "../utils/data";
import Pace from 'react-pace-progress'; // Keep for loading indicator

// Assuming KTUtil and KTOffcanvas are globally available
const KTUtil = window.KTUtil;
const KTOffcanvas = window.KTOffcanvas;

class Navbar extends React.Component {
    state = {
        profileShowing: false, // Likely managed by KTOffcanvas itself
        updated: false,
        selectedSchool: Data.schools.getSelected() || {},
        availableSchools: Data.schools.list(),
        userData: null,
        userRole: null, // Example: "Admin", "Teacher", etc. (derive from userData if possible)
        isLoading: true,
    };

    profileOffcanvas = null;

    componentDidMount() {
        this.setState({ isLoading: true });

        // --- Robust User Data Parsing ---
        let parsedUserData = null;
        const userJson = localStorage.getItem("user");
        if (userJson) {
            try {
                parsedUserData = JSON.parse(userJson);
                if (!parsedUserData || typeof parsedUserData !== 'object') {
                    throw new Error("Invalid user data format in localStorage");
                }
                // Optionally derive role here:
                // const userRole = parsedUserData.role || 'User';
                this.setState({ userData: parsedUserData /*, userRole */ });
            } catch (error) {
                console.error("Error parsing user data:", error);
                this.handleLogout(true); // Force logout on bad data
                return;
            }
        } else {
            console.warn("No user data found. Redirecting to login.");
            this.props.history.push('/login'); // Use history passed by withRouter
            return;
        }

        // --- Initialize Data & Components ---
        this.initializeSchoolData(parsedUserData);
        // Debounce or ensure KT components init after DOM is ready
        // setTimeout(this.initializeKTComponents, 0); // Slight delay might help sometimes
        this.initializeKTComponents(); // Try immediate initialization

        // --- Set Initial Title ---
        this.updateTitle(this.state.selectedSchool);

        // --- Finish Loading ---
        // Consider tying this to Data readiness if applicable
        setTimeout(() => this.setState({ isLoading: false, updated: true }), 300); // Shorter delay
    }

    componentWillUnmount() {
        // --- Cleanup ---
        if (this.profileOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
            this.profileOffcanvas.destroy();
        }
        // Unsubscribe if implemented
        // if (this.schoolUpdateHandler) Data.schools.unsubscribe(this.schoolUpdateHandler);
    }

    initializeSchoolData = (currentUserData) => {
        // Subscribe to future school changes
        this.schoolUpdateHandler = ({ schools }) => {
            console.log("Schools updated:", schools);
            const currentSchoolId = localStorage.getItem("school") || schools[0]?.id;
            const newSelected = schools.find(s => s.id == currentSchoolId) || schools[0] || {};

            this.setState({
                availableSchools: schools || [], // Ensure it's always an array
                selectedSchool: newSelected,
                updated: true
            }, () => {
                if (newSelected.id) {
                    localStorage.setItem("school", newSelected.id);
                    this.updateTitle(newSelected);
                } else {
                    this.updateTitle(); // Set default title
                }
            });
        };
        Data.schools.subscribe(this.schoolUpdateHandler);

        // Ensure initial state values are arrays
         this.setState(prevState => ({
             availableSchools: Array.isArray(prevState.availableSchools) ? prevState.availableSchools : [],
             selectedSchool: prevState.selectedSchool || {}
         }));
    }

    initializeKTComponents = () => {
        console.log("Attempting to initialize Profile Offcanvas...");
        const profilePanelId = 'kt_offcanvas_toolbar_profile';
        const profilePanel = document.getElementById(profilePanelId);

        if (!KTUtil || !KTOffcanvas) {
            console.warn("KTUtil or KTOffcanvas missing.");
            return;
        }
        if (!profilePanel) {
            console.warn(`#${profilePanelId} not found.`);
            return;
        }

        // --- Cleanup existing instances ---
        if (this.profileOffcanvas instanceof KTOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
             console.log(`Destroying previous KTOffcanvas instance for #${profilePanelId}`);
             this.profileOffcanvas.destroy();
             const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
             if(body) KTUtil.scrollDestroy(body); // Destroy associated scrollbar
             this.profileOffcanvas = null;
        }

        // --- Initialize New Instance ---
        try {
             const head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
             const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');

            this.profileOffcanvas = new KTOffcanvas(profilePanel, {
                overlay: true,
                baseClass: 'kt-offcanvas-panel',
                closeBy: 'kt_offcanvas_toolbar_profile_close',
                toggleBy: 'kt_offcanvas_toolbar_profile_toggler_btn'
            });

            if (body) {
                KTUtil.scrollInit(body, {
                    disableForMobile: true,
                    resetHeightOnDestroy: true,
                    handleWindowResize: true,
                    height: function () {
                        let height = parseInt(KTUtil.getViewPort().height);
                        if (head) {
                            height = height - parseInt(KTUtil.actualHeight(head));
                            height = height - (parseInt(KTUtil.css(head, 'marginBottom')) || 0);
                        }
                        height = height - (parseInt(KTUtil.css(profilePanel, 'paddingTop')) || 0);
                        height = height - (parseInt(KTUtil.css(profilePanel, 'paddingBottom')) || 0);
                        return Math.max(height, 200); // Ensure min height
                    }
                });
            }
        } catch (error) {
            console.error(`Error initializing KTOffcanvas for #${profilePanelId}:`, error);
            this.profileOffcanvas = null; // Ensure reference is null on error
        }
    }

    updateTitle = (school) => {
        if (school?.name) {
            document.title = `${school.name} | Shule Plus`;
        } else {
            document.title = `Shule Plus`; // Default title
        }
    }

    switchSchools = (justSelectedSchool) => {
        if (!justSelectedSchool || !justSelectedSchool.id || justSelectedSchool.id === this.state.selectedSchool?.id) {
            return; // Don't switch if invalid or already selected
        }
        localStorage.setItem("school", justSelectedSchool.id);
        // setState might be redundant if reloading anyway, but good practice
        this.setState({ selectedSchool: justSelectedSchool, isLoading: true }, () => {
            window.location.reload(); // Force reload
        });
    }

    handleLogout = (isErrorLogout = false) => {
        localStorage.clear();
        // Redirect after clearing, no need for reload if using history
        if (!isErrorLogout) { // Avoid multiple redirects if called from error handler
            this.props.history.push('/login');
        }
    }

    render() {
        const { isLoading, selectedSchool = {}, availableSchools = [], userData = {} } = this.state;
        const userName = userData?.names || 'User';
        const userEmail = userData?.email; // Optional chaining handles null/undefined
        const userPhone = userData?.phone;
        const userOtherPhone = userData?.other_phone;
        const userRole = this.state.userRole || 'User'; // Use state role or fallback

        const canSwitchSchools = Array.isArray(availableSchools) && availableSchools.length > 1;
        const schoolBalance = selectedSchool?.financial?.balanceFormatted;

        return (
            <div id="kt_header" className="kt-header kt-grid__item kt-grid kt-grid--ver kt-header--fixed">
                {isLoading && <Pace color="#366cf3" height={3} />}

                {/* Brand */}
                <div className="kt-header__brand kt-grid__item" id="kt_header_brand">
                    <Link to="/trips/all">
                        <img alt="Logo" style={{ width: 150 }} src="/assets/media/logos/logo-v5.png" />
                    </Link>
                </div>

                {/* Header Menu */}
                <div className="kt-header-menu-wrapper kt-grid__item" id="kt_header_menu_wrapper" style={{ borderRadius: '10px', margin: '10px' }}>
                    <div id="kt_header_menu" className="kt-header-menu kt-header-menu-mobile" >
                        <ul className="kt-menu__nav" >

                            {/* School Name / Switcher */}
                            <li className={`kt-menu__item ${canSwitchSchools ? 'kt-menu__item--submenu kt-menu__item--rel' : ''}`}
                                data-ktmenu-submenu-toggle={canSwitchSchools ? 'click' : null} // Only add toggle if switchable
                                aria-haspopup={canSwitchSchools}>
                                <a href={canSwitchSchools ? "javascript:;" : null} // Make it a link only if switchable
                                   className={`kt-menu__link ${canSwitchSchools ? 'kt-menu__toggle' : ''}`}>
                                    <span className="kt-menu__link-text kt-font-bold">{selectedSchool.name || 'Loading School...'}</span>
                                    {canSwitchSchools && <i className="kt-menu__hor-arrow la la-angle-down" />}
                                    {canSwitchSchools && <i className="kt-menu__ver-arrow la la-angle-right" />}
                                </a>
                                {canSwitchSchools && (
                                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                        <ul className="kt-menu__subnav">
                                            {availableSchools.map(school => (
                                                <li key={school.id} onClick={() => this.switchSchools(school)}
                                                    className={`kt-menu__item ${school.id === selectedSchool.id ? 'kt-menu__item--active' : ''}`} // Highlight active
                                                    aria-haspopup="true">
                                                    <a href="#" onClick={(e) => e.preventDefault()} className="kt-menu__link">
                                                        <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                        <span className="kt-menu__link-text">{school.name}</span>
                                                        {/* Use kt-menu__item--active class or explicit checkmark */}
                                                        {/* {school.id === selectedSchool.id && <i className="kt-menu__link-icon la la-check kt-font-success" />} */}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>

                            {/* Reports */}
                            <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/home" className="kt-menu__link">
                                    <span className="kt-menu__link-text">Reports</span>
                                </Link>
                            </li>

                            {/* Manage Data */}
                            <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                                    <span className="kt-menu__link-text">Manage Data</span>
                                    <i className="kt-menu__hor-arrow la la-angle-down" />
                                    <i className="kt-menu__ver-arrow la la-angle-right" />
                                </a>
                                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                    <ul className="kt-menu__subnav">
                                        {[
                                            // Your menu items... (ensure unique keys)
                                            { path: "/schools", label: "Schools" }, { path: "/admins", label: "Admins" },
                                            { path: "/invitations", label: "Invitations" }, { path: "/drivers", label: "Drivers" },
                                            { path: "/buses", label: "Buses" }, { path: "/routes", label: "Routes" },
                                            { path: "/schedules", label: "Schedules" }, { path: "/classes", label: "Classes" },
                                            { path: "/teachers", label: "Teachers" }, { path: "/students", label: "Students" },
                                            { path: "/parents", label: "Parents" }, { path: "/settings/school", label: "School Details" },
                                        ].map(item => (
                                            <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                                                {/* Use Link for internal SPA navigation */}
                                                <Link to={item.path} className="kt-menu__link">
                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                    <span className="kt-menu__link-text">{item.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>

                            {/* Communications */}
                             <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/comms" className="kt-menu__link">
                                    <span className="kt-menu__link-text">SMS & Email</span>
                                </Link>
                            </li>

                            {/* Finance */}
                             <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                                    <span className="kt-menu__link-text">
                                        {/* Display balance nicely */}
                                        {schoolBalance ? (
                                             <>{schoolBalance} <span className="kt-hidden-mobile">, Finance</span></>
                                         ) : 'Finance'}
                                    </span>
                                    <i className="kt-menu__hor-arrow la la-angle-down" />
                                    <i className="kt-menu__ver-arrow la la-angle-right" />
                                </a>
                                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                     <ul className="kt-menu__subnav">
                                         <li className="kt-menu__item" aria-haspopup="true">
                                            <Link to="/finance/topup" className="kt-menu__link">
                                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                <span className="kt-menu__link-text">Top Up</span>
                                            </Link>
                                        </li>
                                        <li className="kt-menu__item" aria-haspopup="true">
                                            <Link to="/finance/charges" className="kt-menu__link">
                                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                <span className="kt-menu__link-text">Your Charges</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>

                            {/* Learning */}
                             <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/learning" className="kt-menu__link">
                                    <span className="kt-menu__link-text">Learning</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Header Topbar */}
                <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
                    <div
                        className="kt-header__topbar-item kt-header__topbar-item--user"
                        id="kt_offcanvas_toolbar_profile_toggler_btn" // Must match KTOffcanvas config
                    >
                        <div className="kt-header__topbar-welcome kt-hidden-mobile">Hi,</div>
                        <div className="kt-header__topbar-username">{userName}</div>
                        <div className="kt-header__topbar-wrapper">
                            <img alt="User Pic" src={"/assets/media/users/default.jpg"} />
                        </div>
                    </div>
                </div>

                {/* Mobile Header */}
                <div id="kt_header_mobile" className="kt-header-mobile kt-header-mobile--fixed">
                    <div className="kt-header-mobile__logo">
                        <div style={{textAlign: 'left', color: 'white'}}>
                            <div style={{fontSize: 16, fontWeight: 700}}>{this.state.selectedSchool?.name}</div>
                            <div style={{fontSize: 14, opacity: 0.7}}>Welcome, {userName}</div>
                        </div>
                    </div>
                    <div className="kt-header-mobile__toolbar">
                        <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler"><span /></button>
                        <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" /></button>
                    </div>
                </div>

                {/* Profile Offcanvas Panel */}
                <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel">
                    <div className="kt-offcanvas-panel__head">
                        <h3 className="kt-offcanvas-panel__title">Profile</h3>
                        <a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
                    </div>
                    {/* Make sure body has kt-scroll class if needed by theme's scroll init */}
                    <div className="kt-offcanvas-panel__body kt-scroll">
                        <div className="kt-user-card-v3 kt-margin-b-30">
                            <div className="kt-user-card-v3__avatar">
                                <img src={"/assets/media/users/default.jpg"} alt="" />
                            </div>
                            <div className="kt-user-card-v3__detalis">
                                {/* User Name and Role */}
                                <span className="kt-user-card-v3__name">{userName}</span>
                                <div className="kt-user-card-v3__desc kt-font-sm">{userRole}</div>

                                {/* Contact Info Section */}
                                <div className="kt-user-card-v3__info kt-margin-t-15">
                                    {userEmail && (
                                        <div className="kt-user-card-v3__item">
                                            <i className="flaticon-email kt-font-brand kt-padding-r-5" /> {/* Added icon */}
                                            <span className="kt-user-card-v3__tag">{userEmail}</span>
                                        </div>
                                    )}
                                    {userPhone && (
                                        <div className="kt-user-card-v3__item">
                                            <i className="flaticon2-phone kt-font-success kt-padding-r-5" /> {/* Added icon */}
                                            <span className="kt-user-card-v3__tag">{userPhone}</span>
                                        </div>
                                     )}
                                     {userOtherPhone && (
                                        <div className="kt-user-card-v3__item">
                                             <i className="flaticon2-phone kt-font-warning kt-padding-r-5" /> {/* Added icon */}
                                            <span className="kt-user-card-v3__tag">{userOtherPhone} (Other)</span>
                                        </div>
                                     )}
                                </div>

                                {/* Action Buttons */}
                                <div className="kt-user-card-v3__actions kt-margin-t-25">
                                     <button
                                        className="btn btn-sm btn-label-brand btn-bold"
                                        type="button"
                                        onClick={() => this.props.history.push("/settings/user")}
                                    >
                                        <i className="la la-user" /> My Profile
                                    </button>
                                    <button
                                        className="btn btn-sm btn-label-danger btn-bold kt-margin-l-10"
                                        type="button"
                                        onClick={() => this.handleLogout()} // No arg needed unless error
                                    >
                                        <i className="la la-sign-out" /> Log Out
                                    </button>
                                </div>
                            </div>
                        </div>

                         {/* Optional: Add more sections here if needed, e.g., quick links */}
                         {/* <div className="kt-separator kt-separator--space-lg kt-separator--border-dashed"></div> */}
                         {/* ... */}

                    </div> {/* End Body */}
                </div> {/* End Panel */}
            </div> // End Header
        );
    }
}

export default withRouter(Navbar);