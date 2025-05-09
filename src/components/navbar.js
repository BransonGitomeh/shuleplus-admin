/* eslint-env browser */

import React from "react";
import { Link, withRouter } from "react-router-dom";
import Data from "../utils/data";
import Pace from 'react-pace-progress';

const KTUtil = window.KTUtil;
const KTOffcanvas = window.KTOffcanvas;

class Navbar extends React.Component {
    state = {
        profileShowing: false,
        updated: false,
        selectedSchool: Data.schools.getSelected() || {},
        availableSchools: Data.schools.list(),
        userData: null,
        userRole: null,
        isLoading: true,
        // PWA Install State
        deferredPrompt: null,
        showInstallButton: false,
    };

    profileOffcanvas = null;
    installButtonRef = React.createRef(); // Ref for the install button

    componentDidMount() {
        this.setState({ isLoading: true });

        // --- PWA Install Logic ---
        window.addEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", this.handleAppInstalled);
        // Check if already running as a PWA or installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || localStorage.getItem('appInstalled') === 'true') {
          this.setState({ showInstallButton: false });
        }
        // --- End PWA Install Logic ---


        let parsedUserData = null;
        const userJson = localStorage.getItem("user");
        if (userJson) {
            try {
                parsedUserData = JSON.parse(userJson);
                if (!parsedUserData || typeof parsedUserData !== 'object') {
                    throw new Error("Invalid user data format in localStorage");
                }
                this.setState({ userData: parsedUserData });
            } catch (error) {
                console.error("Error parsing user data:", error);
                this.handleLogout(true);
                return;
            }
        } else {
            console.warn("No user data found. Redirecting to login.");
            this.props.history.push('/login');
            return;
        }

        this.initializeSchoolData(parsedUserData);
        this.initializeKTComponents();
        this.updateTitle(this.state.selectedSchool);
        setTimeout(() => this.setState({ isLoading: false, updated: true }), 300);
    }

    componentWillUnmount() {
        // --- PWA Cleanup ---
        window.removeEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", this.handleAppInstalled);
        // --- End PWA Cleanup ---

        if (this.profileOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
            this.profileOffcanvas.destroy();
        }
        // if (this.schoolUpdateHandler) Data.schools.unsubscribe(this.schoolUpdateHandler);
    }

    // --- PWA Install Handlers ---
    handleBeforeInstallPrompt = (e) => {
        console.log("'beforeinstallprompt' event fired.");
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later & show the button
        // Only show if not already installed
        if (!(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || localStorage.getItem('appInstalled') === 'true')) {
            this.setState({ deferredPrompt: e, showInstallButton: true });
        }
    };

    handleAppInstalled = () => {
        console.log('ShulePlus Management Console was installed.');
        localStorage.setItem('appInstalled', 'true'); // Persist install state
        this.setState({ showInstallButton: false, deferredPrompt: null }); // Hide button after install
    };

    handleInstallClick = async () => {
        const { deferredPrompt } = this.state;
        if (!deferredPrompt) {
            console.log("Deferred prompt not available to trigger.");
            return;
        }

        // Hide our custom button immediately
        this.setState({ showInstallButton: false });

        // Show the browser's install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        try {
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                console.log("User accepted the A2HS prompt");
                // The 'appinstalled' event will handle further state changes
            } else {
                console.log("User dismissed the A2HS prompt");
                // Optional: Re-show button after a delay if dismissed, or let beforeinstallprompt fire again
                // For simplicity, we'll keep it hidden. The browser might re-fire beforeinstallprompt later.
            }
        } catch (error) {
            console.error("Error with userChoice for install prompt:", error);
        }
        // We've used the prompt, clear it.
        this.setState({ deferredPrompt: null });
    };
    // --- End PWA Install Handlers ---


    initializeSchoolData = (currentUserData) => {
        this.schoolUpdateHandler = ({ schools }) => {
            const currentSchoolId = localStorage.getItem("school") || schools[0]?.id;
            const newSelected = schools.find(s => s.id == currentSchoolId) || schools[0] || {};
            this.setState({
                availableSchools: schools || [],
                selectedSchool: newSelected,
                updated: true
            }, () => {
                if (newSelected.id) {
                    localStorage.setItem("school", newSelected.id);
                    this.updateTitle(newSelected);
                } else {
                    this.updateTitle();
                }
            });
        };
        Data.schools.subscribe(this.schoolUpdateHandler);
        this.setState(prevState => ({
            availableSchools: Array.isArray(prevState.availableSchools) ? prevState.availableSchools : [],
            selectedSchool: prevState.selectedSchool || {}
        }));
    }

    initializeKTComponents = () => {
        // ... (your existing KT init logic - no changes needed here for PWA install)
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

        if (this.profileOffcanvas instanceof KTOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
             console.log(`Destroying previous KTOffcanvas instance for #${profilePanelId}`);
             this.profileOffcanvas.destroy();
             const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
             if(body) KTUtil.scrollDestroy(body);
             this.profileOffcanvas = null;
        }

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
                        return Math.max(height, 200);
                    }
                });
            }
        } catch (error) {
            console.error(`Error initializing KTOffcanvas for #${profilePanelId}:`, error);
            this.profileOffcanvas = null;
        }
    }

    updateTitle = (school) => {
        if (school?.name) {
            document.title = `${school.name} | Shule Plus`;
        } else {
            document.title = `Shule Plus`;
        }
    }

    switchSchools = (justSelectedSchool) => {
        if (!justSelectedSchool || !justSelectedSchool.id || justSelectedSchool.id === this.state.selectedSchool?.id) {
            return;
        }
        localStorage.setItem("school", justSelectedSchool.id);
        this.setState({ selectedSchool: justSelectedSchool, isLoading: true }, () => {
            window.location.reload();
        });
    }

    handleLogout = (isErrorLogout = false) => {
        localStorage.clear();
        if (!isErrorLogout) {
            this.props.history.push('/login');
        }
    }

    render() {
        const { isLoading, selectedSchool = {}, availableSchools = [], userData = {}, showInstallButton } = this.state; // Added showInstallButton
        const userName = userData?.names || 'User';
        const userEmail = userData?.email;
        const userPhone = userData?.phone;
        const userOtherPhone = userData?.other_phone;
        const userRole = this.state.userRole || 'User';

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

                            {/* ... (your existing school switcher, reports, manage data, etc.) ... */}
                             <li className={`kt-menu__item ${canSwitchSchools ? 'kt-menu__item--submenu kt-menu__item--rel' : ''}`}
                                data-ktmenu-submenu-toggle={canSwitchSchools ? 'click' : null}
                                aria-haspopup={canSwitchSchools}>
                                <a href={canSwitchSchools ? "javascript:;" : undefined}
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
                                                    className={`kt-menu__item ${school.id === selectedSchool.id ? 'kt-menu__item--active' : ''}`}
                                                    aria-haspopup="true">
                                                    <a href="#" onClick={(e) => e.preventDefault()} className="kt-menu__link">
                                                        <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                        <span className="kt-menu__link-text">{school.name}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                            <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/home" className="kt-menu__link">
                                    <span className="kt-menu__link-text">Reports</span>
                                </Link>
                            </li>
                            <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                                    <span className="kt-menu__link-text">Manage Data</span>
                                    <i className="kt-menu__hor-arrow la la-angle-down" />
                                    <i className="kt-menu__ver-arrow la la-angle-right" />
                                </a>
                                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                    <ul className="kt-menu__subnav">
                                        {[
                                            { path: "/schools", label: "Schools" }, { path: "/admins", label: "Admins" },
                                            { path: "/invitations", label: "Invitations" }, { path: "/drivers", label: "Drivers" },
                                            { path: "/buses", label: "Buses" }, { path: "/routes", label: "Routes" },
                                            { path: "/schedules", label: "Schedules" }, { path: "/classes", label: "Classes" },
                                            { path: "/teachers", label: "Teachers" }, { path: "/students", label: "Students" },
                                            { path: "/parents", label: "Parents" }, { path: "/settings/school", label: "School Details" },
                                        ].map(item => (
                                            <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                                                <Link to={item.path} className="kt-menu__link">
                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                    <span className="kt-menu__link-text">{item.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                             <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/comms" className="kt-menu__link">
                                    <span className="kt-menu__link-text">SMS & Email</span>
                                </Link>
                            </li>
                             <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                                    <span className="kt-menu__link-text">
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
                             <li className="kt-menu__item kt-menu__item--rel">
                                <Link to="/learning" className="kt-menu__link">
                                    <span className="kt-menu__link-text">Learning</span>
                                </Link>
                            </li>


                            {/* PWA Install Button */}
                            {showInstallButton && (
                                <li className="kt-menu__item kt-menu__item--rel">
                                    <button
                                        ref={this.installButtonRef}
                                        onClick={this.handleInstallClick}
                                        className="kt-menu__link" // Use existing menu link styling
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        title="Install ShulePlus Console App"
                                    >
                                        {/* You can add an icon here, e.g., a download icon */}
                                        {/* <i className="la la-download kt-menu__link-icon"></i> */}
                                        <span className="kt-menu__link-text">Install App</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Header Topbar */}
                {/* ... (your existing topbar - no changes needed here) ... */}
                <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
                    <div
                        className="kt-header__topbar-item kt-header__topbar-item--user"
                        id="kt_offcanvas_toolbar_profile_toggler_btn"
                    >
                        <div className="kt-header__topbar-welcome kt-hidden-mobile">Hi,</div>
                        <div className="kt-header__topbar-username">{userName}</div>
                        <div className="kt-header__topbar-wrapper">
                            <img alt="User Pic" src={"/assets/media/users/default.jpg"} />
                        </div>
                    </div>
                </div>


                {/* Mobile Header */}
                {/* ... (your existing mobile header - no changes needed here) ... */}
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
                {/* ... (your existing offcanvas panel - no changes needed here) ... */}
                <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel">
                    <div className="kt-offcanvas-panel__head">
                        <h3 className="kt-offcanvas-panel__title">Profile</h3>
                        <a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
                    </div>
                    <div className="kt-offcanvas-panel__body kt-scroll">
                        <div className="kt-user-card-v3 kt-margin-b-30">
                            <div className="kt-user-card-v3__avatar">
                                <img src={"/assets/media/users/default.jpg"} alt="" />
                            </div>
                            <div className="kt-user-card-v3__detalis">
                                <span className="kt-user-card-v3__name">{userName}</span>
                                <div className="kt-user-card-v3__desc kt-font-sm">{userRole}</div>
                                <div className="kt-user-card-v3__info kt-margin-t-15">
                                    {userEmail && (
                                        <div className="kt-user-card-v3__item">
                                            <i className="flaticon-email kt-font-brand kt-padding-r-5" />
                                            <span className="kt-user-card-v3__tag">{userEmail}</span>
                                        </div>
                                    )}
                                    {userPhone && (
                                        <div className="kt-user-card-v3__item">
                                            <i className="flaticon2-phone kt-font-success kt-padding-r-5" />
                                            <span className="kt-user-card-v3__tag">{userPhone}</span>
                                        </div>
                                     )}
                                     {userOtherPhone && (
                                        <div className="kt-user-card-v3__item">
                                             <i className="flaticon2-phone kt-font-warning kt-padding-r-5" />
                                            <span className="kt-user-card-v3__tag">{userOtherPhone} (Other)</span>
                                        </div>
                                     )}
                                </div>
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
                                        onClick={() => this.handleLogout()}
                                    >
                                        <i className="la la-sign-out" /> Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Navbar);