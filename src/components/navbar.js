/* eslint-env browser */ // Use 'browser' instead of 'location' for DOM/window access

import React from "react";
import { Link, withRouter } from "react-router-dom"; // Combined import
// import app from "../scripts.bundle"; // Assuming this initializes KTLayout etc. - Keep if necessary
import Data from "../utils/data";
import Pace from 'react-pace-progress';

// Assuming KTUtil and KTOffcanvas are globally available via included scripts
const KTUtil = window.KTUtil;
const KTOffcanvas = window.KTOffcanvas;

class Navbar extends React.Component {
    // Define state directly
    state = {
        profileShowing: false, // This might not be needed if KTOffcanvas handles visibility
        updated: false, // Used for Pace progress bar
        selectedSchool: Data.schools.getSelected() || {}, // Initialize with selected or empty object
        availableSchools: Data.schools.list(),
        userData: null, // To store parsed user data
        userRole: null, // Store the role if needed elsewhere
        isLoading: true, // Initial loading state for Pace
    };

    // To store the offcanvas instance
    profileOffcanvas = null;

    componentDidMount() {
        this.setState({ isLoading: true }); // Start loading indicator

        // 1. Parse User Data Safely
        let parsedUserData = null;
        const userJson = localStorage.getItem("user");

        if (userJson) {
            try {
                parsedUserData = JSON.parse(userJson);
                console.log(parsedUserData)
                if (!parsedUserData || typeof parsedUserData !== 'object') {
                    throw new Error("Invalid user data in localStorage");
                }

                this.setState({ userData: parsedUserData });

            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
                // Optionally clear invalid data and redirect
                // localStorage.removeItem("user");
                // localStorage.removeItem("authorization"); // Also clear token
                this.props.history.push('/'); // Redirect to login
                return; // Stop further execution in componentDidMount
            }
        } else {
            console.warn("No user data found in localStorage. Redirecting to login.");
            // Redirect if no user data found at all
            this.props.history.push('/login');
            return;
        }

        // Set state with parsed data
        this.setState({ userData: parsedUserData });

        // 2. Initialize School Data
        this.initializeSchoolData(parsedUserData); // Pass userData if needed for role check

        // 3. Initialize KT Components (Offcanvas, Layout)
        this.initializeKTComponents();

        // 4. Set document title
        if (this.state.selectedSchool?.name) {
            document.title = `${this.state.selectedSchool.name} | Shule Plus`; // Use state value
        }

        // Indicate loading finished after a short delay (optional, for Pace)
        // You might tie this to Data.onReady if that's more appropriate
         setTimeout(() => this.setState({ isLoading: false, updated: true }), 500); // Example delay
    }

    componentWillUnmount() {
         // Clean up listeners or instances if necessary
         if (this.profileOffcanvas) {
             // Check if KTOffcanvas has a destroy method
             if (typeof this.profileOffcanvas.destroy === 'function') {
                this.profileOffcanvas.destroy();
             }
             this.profileOffcanvas = null;
         }
        // Unsubscribe from Data changes if a subscription method exists
        // Example: Data.schools.unsubscribe(this.handleSchoolUpdate);
    }

    initializeSchoolData = (currentUserData) => {
         // Use initial state values set in constructor/state definition
        const { availableSchools, selectedSchool } = this.state;

        // Set initial document title based on selected school
        if (selectedSchool?.name) {
            document.title = `${selectedSchool.name} | Shule Plus`;
        }

        // Subscribe to future school changes (assuming Data.schools has a subscribe method)
        // Make sure to store the handler reference if you need to unsubscribe later
        // Example: this.schoolUpdateHandler = ({ schools }) => { ... }; Data.schools.subscribe(this.schoolUpdateHandler);
        Data.schools.subscribe(({ schools }) => { // Assuming 'schools' is the list
            console.log("Schools updated:", schools);
            const currentSchoolId = localStorage.getItem("school") || schools[0]?.id; // Get current ID or default
            const newSelected = schools.find(s => s.id == currentSchoolId) || schools[0] || {}; // Find or default

            console.log(`Selected School ID: ${currentSchoolId}`);
            // console.log(`New Selected School: ${JSON.stringify(newSelected, null, 2)}`);

            this.setState({
                availableSchools: schools,
                selectedSchool: newSelected,
                updated: true // Trigger Pace update if needed
            }, () => {
                if (newSelected.id) {
                    localStorage.setItem("school", newSelected.id); // Ensure localStorage is current
                    document.title = `${newSelected.name} | Shule Plus`;
                    console.log(`Updated document title to: ${document.title}`);
                } else {
                    console.log("No school selected, defaulting document title.");
                    document.title = `Shule Plus`; // Default title
                }
            });
        });
    }

    /**
 * Initializes or re-initializes specific KeenThemes components,
 * focusing on the profile offcanvas panel.
 * Ensures proper cleanup before re-initializing to prevent duplicates.
 */
initializeKTComponents = () => {
    console.log("Attempting to initialize/re-initialize KT Components for Profile Offcanvas...");

    // 1. Global Theme Initialization (Important!)
    // ------------------------------------------
    // This should ideally happen ONLY ONCE when your application loads.
    // Avoid calling `app.init()` or `KTLayout.init()` here if this function
    // might be called multiple times (e.g., on route changes).
    // Ensure your main application setup calls it appropriately.
    // Example: Check if already initialized
    if (!window.KTLayout?.initialized) {
        console.log("Running Global KTLayout init...");
        if (window.app && typeof window.app.init === 'function') {
            window.app.init(); // Assumes this calls KTLayout.init() and sets a flag
        } else if (window.KTLayout && typeof window.KTLayout.init === 'function') {
             console.warn("app.init() not found, attempting direct KTLayout.init(). Make sure this is intended.");
             window.KTLayout.init();
             // You might want to manually set a flag:
             // window.KTLayout.initialized = true; // Or check if KTLayout sets one itself
        } else {
             console.error("Critical: Theme layout initialization function (app.init or KTLayout.init) not found!");
        }
    } else {
        // console.log("Global KTLayout already initialized.");
    }


    // 2. Initialize Offcanvas Panel Specifically
    // ------------------------------------------
    const profilePanelId = 'kt_offcanvas_toolbar_profile';
    const profilePanel = document.getElementById(profilePanelId); // Use standard DOM API for clarity

    // Check dependencies first
    if (!window.KTUtil || !window.KTOffcanvas) {
        console.warn("KTUtil or KTOffcanvas is not available. Cannot initialize offcanvas panel.");
        return; // Exit if core KT libraries are missing
    }

    if (!profilePanel) {
        console.warn(`Profile panel element '#${profilePanelId}' not found in the DOM.`);
        return; // Exit if the target element doesn't exist
    }

    // --- Cleanup previous instances if they exist ---
    // Check if we stored a reference to a previous instance
    if (this.profileOffcanvas instanceof KTOffcanvas) {
        console.log(`Destroying previous KTOffcanvas instance for #${profilePanelId}`);
        // Check if the theme component provides a destroy method (common practice)
        if (typeof this.profileOffcanvas.destroy === 'function') {
            this.profileOffcanvas.destroy();
        } else {
            console.warn(`KTOffcanvas instance for #${profilePanelId} might not have a .destroy() method. Manual cleanup might be needed if issues arise.`);
            // If no destroy method, you might need manual listener removal,
            // but often just nullifying the reference helps if the element is removed/replaced.
        }
        this.profileOffcanvas = null; // Remove the reference

        // Also destroy the associated scrollbar instance
        const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
        if (body) {
            console.log(`Destroying previous scrollbar for #${profilePanelId} body`);
            KTUtil.scrollDestroy(body); // Use KTUtil's scroll destroy
        }
    }
    // --- End Cleanup ---


    // --- Initialize New Instance ---
    const head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
    const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');

    console.log(`Initializing new KTOffcanvas instance for #${profilePanelId}`);
    try {
        // Store the new instance on 'this' (assuming 'this' context is stable)
        this.profileOffcanvas = new KTOffcanvas(profilePanel, {
            overlay: true,
            baseClass: 'kt-offcanvas-panel',
            closeBy: 'kt_offcanvas_toolbar_profile_close', // Ensure this element ID exists
            toggleBy: 'kt_offcanvas_toolbar_profile_toggler_btn' // Ensure this element ID exists
        });

        // Initialize Scroll for the panel body
        if (body) {
            console.log(`Initializing scrollbar for #${profilePanelId} body`);
            KTUtil.scrollInit(body, {
                disableForMobile: true,
                resetHeightOnDestroy: true, // Good practice if height is dynamic
                handleWindowResize: true,   // Recalculate height on resize
                height: function () {
                    let height = parseInt(KTUtil.getViewPort().height);
                    if (head) {
                        // Use actualHeight for potentially hidden elements initially
                        height = height - parseInt(KTUtil.actualHeight(head));
                        height = height - (parseInt(KTUtil.css(head, 'marginBottom')) || 0); // Added fallback
                    }
                    height = height - (parseInt(KTUtil.css(profilePanel, 'paddingTop')) || 0);  // Added fallback
                    height = height - (parseInt(KTUtil.css(profilePanel, 'paddingBottom')) || 0); // Added fallback

                    // Ensure a minimum reasonable height
                    const minHeight = 200; // Example minimum height
                    height = Math.max(height, minHeight);
                    // console.log("Calculated scroll height:", height);
                    return height;
                }
            });
        } else {
            console.warn(`Offcanvas body element (.kt-offcanvas-panel__body) not found within #${profilePanelId}. Cannot initialize scrollbar.`);
        }

    } catch (error) {
        console.error(`Error initializing KTOffcanvas for #${profilePanelId}:`, error);
        // Clean up the potentially partially created instance if possible
        if(this.profileOffcanvas) {
             if (typeof this.profileOffcanvas.destroy === 'function') {
                this.profileOffcanvas.destroy();
             }
             this.profileOffcanvas = null;
        }
    }
}

    // Switch Schools Logic
    switchSchools = (justSelectedSchool) => {
        if (!justSelectedSchool || !justSelectedSchool.id) return;

        localStorage.setItem("school", justSelectedSchool.id);
        this.setState({ selectedSchool: justSelectedSchool });

        // Force reload to re-initialize data context for the new school
        window.location.reload();
    }

    // Logout Logic
    handleLogout = () => {
        localStorage.clear(); // Clear everything
        // Could also clear specific items:
        // localStorage.removeItem("user");
        // localStorage.removeItem("authorization");
        // localStorage.removeItem("school");
        window.location.reload(); // Reload to go to login (or redirect explicitly)
        // this.props.history.push('/login'); // Alternative to reload
    }

    render() {
        console.log(this.state)
        // Get data from state, provide fallbacks
        const { isLoading, selectedSchool = {}, availableSchools = [], userData = {} } = this.state;
        const userName = userData?.names || 'User'; // Fallback name
        const userEmail = userData?.email || 'No email';
        const userPhone = userData?.phone || 'No phone';
        const userOtherPhone = userData?.other_phone; // Optional

        // Conditional rendering based on available schools and maybe user role
        const canSwitchSchools = availableSchools.length > 1 // || this.state.userRole === "superadmin"; // Add role check if needed

        return (
            <div
                id="kt_header"
                className="kt-header kt-grid__item kt-grid kt-grid--ver kt-header--fixed"
            >
                {/* Pace loading indicator */}
                {isLoading && <Pace color="#366cf3" height={3} />}

                {/* Brand */}
                <div className="kt-header__brand kt-grid__item" id="kt_header_brand">
                    <Link to="/trips/all"> {/* Link to a default dashboard/home */}
                        <img
                            alt="Logo"
                            style={{ width: 150 }}
                            // Ensure this path is correct relative to your public folder
                            src="/assets/media/logos/logo-v5.png"
                        />
                    </Link>
                </div>

                {/* Header Menu */}
                <div className="kt-header-menu-wrapper kt-grid__item" id="kt_header_menu_wrapper">
                    <div id="kt_header_menu" className="kt-header-menu kt-header-menu-mobile">
                        <ul className="kt-menu__nav">
                            {/* School Switcher Dropdown */}
                            {!canSwitchSchools && (
                                <li className="kt-menu__item">
                                    <h4 className="kt-menu__link-text">{selectedSchool.name || 'Select School'}</h4>
                                </li>
                            )}
                            {canSwitchSchools && (
                                <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                    <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                                        <span className="kt-menu__link-text">{selectedSchool.name || 'Select School'}</span>
                                        <i className="kt-menu__hor-arrow la la-angle-down" />
                                        <i className="kt-menu__ver-arrow la la-angle-right" />
                                    </a>
                                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                        <ul className="kt-menu__subnav">
                                            {availableSchools.map(school => (
                                                <li key={school.id} onClick={() => this.switchSchools(school)} className="kt-menu__item" aria-haspopup="true">
                                                    {/* Use <a> for theme compatibility, prevent default if needed */}
                                                    <a href="#" onClick={(e) => e.preventDefault()} className="kt-menu__link">
                                                        <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                        <span className="kt-menu__link-text">{school.name}</span>
                                                        {school.id === selectedSchool.id && <i className="kt-menu__link-icon la la-check" />} {/* Indicate selected */}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            )}

                            {/* Reports Link */}
                            <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/home" className="kt-menu__link">
                                    <span className="kt-menu__link-text">Reports</span>
                                </Link>
                            </li>

                            {/* Data Management Dropdown */}
                            <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                <a className="kt-menu__link kt-menu__toggle">
                                    <span className="kt-menu__link-text">Manage Data</span>
                                    <i className="kt-menu__hor-arrow la la-angle-down" />
                                    <i className="kt-menu__ver-arrow la la-angle-right" />
                                </a>
                                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                    <ul className="kt-menu__subnav">
                                        {/* Add key props to mapped elements */}
                                        {[
                                            { path: "/schools", label: "Schools" },
                                            { path: "/admins", label: "Admins" },
                                            { path: "/teams", label: "Teams" },
                                            { path: "/members", label: "Team Members" },
                                            { path: "/invitations", label: "Invitations" },
                                            { path: "/drivers", label: "Drivers" },
                                            { path: "/buses", label: "Buses" },
                                            { path: "/routes", label: "Routes" },
                                            { path: "/schedules", label: "Schedules" },
                                            { path: "/classes", label: "Classes" },
                                            { path: "/teachers", label: "Teachers" },
                                            { path: "/students", label: "Students" },
                                            { path: "/parents", label: "Parents" },
                                            { path: "/settings/school", label: "School Details" },
                                        ].map(item => (
                                            <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                                                <a href={`#${item.path}`} className="kt-menu__link">
                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                    <span className="kt-menu__link-text">{item.label}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>

                             {/* Communications Link */}
                             <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/comms" className="kt-menu__link">
                                    <span className="kt-menu__link-text">SMS & Email</span>
                                </Link>
                            </li>

                            {/* Finance Dropdown */}
                             <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                <a className="kt-menu__link kt-menu__toggle">
                                    <span className="kt-menu__link-text">
                                        {/* Display balance if available, otherwise just "Finance" */}
                                        {selectedSchool?.financial?.balanceFormatted || 'Finance'}
                                        {selectedSchool?.financial?.balanceFormatted && ', Finance'}
                                    </span>
                                    <i className="kt-menu__hor-arrow la la-angle-down" />
                                    <i className="kt-menu__ver-arrow la la-angle-right" />
                                </a>
                                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                     <ul className="kt-menu__subnav">
                                         <li className="kt-menu__item" aria-haspopup="true">
                                            <Link to="/finance/topup" className="kt-menu__link">
                                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                <span className="kt-menu__link-text">Mpesa Top Up</span>
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

                             {/* Learning Link */}
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
                    {/* User Bar */}
                    <div
                        className="kt-header__topbar-item kt-header__topbar-item--user"
                        id="kt_offcanvas_toolbar_profile_toggler_btn" // Toggle button for offcanvas
                    >
                        <div className="kt-header__topbar-welcome">Hi,</div>
                        {/* Display user's actual name */}
                        <div className="kt-header__topbar-username">{userName}</div>
                        <div className="kt-header__topbar-wrapper">
                            {/* Use a default avatar or user-specific one if available */}
                            <img alt="User Pic" src={"/assets/media/users/default.jpg"} />
                        </div>
                    </div>
                </div>

                {/* Mobile Header */}
                <div id="kt_header_mobile" className="kt-header-mobile kt-header-mobile--fixed">
                    <div className="kt-header-mobile__logo">
                         <Link to="/trips/all">
                            <img
                                alt="Logo"
                                style={{ width: 120, filter: 'brightness(0) invert(1)' }} // Adjusted style for visibility
                                src="/assets/media/logos/logo-v6.png" // Ensure path is correct
                            />
                        </Link>
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
                    {/* Ensure body has kt-scroll class if using KTUtil.scrollInit */}
                    <div className="kt-offcanvas-panel__body kt-scroll">
                        <div className="kt-user-card-v3 kt-margin-b-30">
                            <div className="kt-user-card-v3__avatar">
                                {/* Use actual avatar or default */}
                                <img src={"/assets/media/users/default.jpg"} alt="User Avatar" />
                            </div>
                            <div className="kt-user-card-v3__detalis">
                                {/* Display actual name */}
                                <a href="#" onClick={(e) => e.preventDefault()} className="kt-user-card-v3__name">
                                    {userName}
                                </a>
                                <div className="kt-user-card-v3__desc">
                                    {/* Display role or other info if available */}
                                    {this.state.userRole || 'User'}
                                </div>
                                <div className="kt-user-card-v3__info">
                                    {/* Display Email */}
                                    <div className="kt-user-card-v3__item"> {/* Use div for better structure */}
                         
                                        <span className="kt-user-card-v3__tag">{userEmail}</span>
                                    </div>
                                    {/* Display Phone */}
                                    <div className="kt-user-card-v3__item">
                                        {/* Change icon if desired (e.g., flaticon-phone) */}
                  
                                        <span className="kt-user-card-v3__tag">{userPhone}</span>
                                    </div>
                                     {/* Display Other Phone if exists */}
                                     {userOtherPhone && (
                                        <div className="kt-user-card-v3__item">
                                            <span className="kt-user-card-v3__tag">{userOtherPhone}</span>
                                        </div>
                                     )}
                                </div>
                                 {/* Action Buttons - separated for clarity */}
                                <div className="kt-user-card-v3__actions kt-margin-t-20">
                                     <button
                                        className="btn btn-sm btn-label-brand btn-bold" // Adjusted style
                                        type="button"
                                        onClick={() => this.props.history.push("/settings/user")}
                                    >
                                        My Profile
                                    </button>
                                    <button
                                        className="btn btn-sm btn-label-danger btn-bold kt-margin-l-10" // Adjusted style
                                        type="button"
                                        onClick={this.handleLogout}
                                    >
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* PS Scrollbar elements are usually added dynamically by KTUtil.scrollInit */}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Navbar);