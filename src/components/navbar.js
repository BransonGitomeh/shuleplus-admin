/* eslint-env browser */

import React from "react";
import { Link, withRouter } from "react-router-dom";
import Data from "../utils/data";
import Pace from 'react-pace-progress';

const KTUtil = window.KTUtil;
const KTOffcanvas = window.KTOffcanvas;
// It's good to also have KTMenu if your theme uses it explicitly,
// otherwise KTUtil.init() might handle it.
// const KTMenu = window.KTMenu;

class Navbar extends React.Component {
    state = {
        profileShowing: false,
        // 'updated' flag can be removed if not strictly necessary for other logic,
        // as re-renders are managed by isLoading and route changes.
        // updated: false,
        selectedSchool: Data.schools.getSelected() || {},
        availableSchools: Data.schools.list(),
        userData: null,
        userRole: null, // Consider fetching/setting this if it's dynamic
        isLoading: true,
        // PWA Install State
        deferredPrompt: null,
        showInstallButton: false,
    };

    profileOffcanvas = null;
    installButtonRef = React.createRef(); // Ref for the install button
    _isMounted = false; // To track component mount status

    componentDidMount() {
        this._isMounted = true;
        this.setState({ isLoading: true });

        // --- PWA Install Logic ---
        window.addEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", this.handleAppInstalled);
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
                // Assuming userRole might come from userData or another source
                // For now, let's set a default or extract if available
                this.setState({ userData: parsedUserData, userRole: parsedUserData.role || 'User' });
            } catch (error) {
                console.error("Error parsing user data:", error);
                this.handleLogout(true); // This will redirect, so subsequent logic might not run
                return;
            }
        } else {
            console.warn("No user data found. Redirecting to login.");
            this.props.history.push('/login');
            return;
        }

        this.initializeSchoolData(parsedUserData);
        // Initial title update, might be generic if school isn't selected yet
        this.updateTitle(this.state.selectedSchool);

        // KT components will be initialized in componentDidUpdate when isLoading becomes false
        // or after the first data load completes.
        // Delay setting isLoading to false to allow data to potentially load
        setTimeout(() => {
            if (this._isMounted) {
                this.setState({ isLoading: false });
            }
        }, 300);
    }

    componentDidUpdate(prevProps, prevState) {
        let needsKTRefresh = false;

        // Scenario 1: Page navigation (route change)
        if (prevProps.location.pathname !== this.props.location.pathname) {
            console.log("Navbar: Route changed, scheduling KT component refresh.");
            needsKTRefresh = true;
        }

        // Scenario 2: Initial setup completion OR school data fully loaded and processed
        // (isLoading becomes false after initial data fetching and 300ms timeout)
        if (prevState.isLoading && !this.state.isLoading) {
            console.log("Navbar: Initial loading sequence complete (isLoading became false), scheduling KT component refresh.");
            needsKTRefresh = true;
        }
        
        // Scenario 3: Selected school actually changed (e.g., through a mechanism other than switchSchools that reloads)
        // The switchSchools method currently reloads the page, which handles KT re-initialization.
        // This is for robustness if that changes or other mechanisms alter selectedSchool.
        if (prevState.selectedSchool?.id !== this.state.selectedSchool?.id) {
            console.log("Navbar: Selected school changed, scheduling KT component refresh.");
            needsKTRefresh = true; 
        }

        if (needsKTRefresh && this._isMounted) {
            // Using a timeout to ensure that the DOM manipulations from React's render pass
            // are completed before KT tries to initialize components on them.
            setTimeout(() => {
                // Double check mount status in async callback
                if (this._isMounted) {
                    console.log("Navbar: Calling initializeKTComponents.");
                    this.initializeKTComponents();
                }
            }, 0); // 0ms timeout defers execution to the next event loop tick.
        }

        // Update document title if selected school changes
        if (prevState.selectedSchool?.id !== this.state.selectedSchool?.id) {
            this.updateTitle(this.state.selectedSchool);
        } else if (!this.state.selectedSchool?.id && prevState.selectedSchool?.id) { 
            // Case: school went from selected to unselected (e.g. no schools available)
            this.updateTitle();
        }
    }


    componentWillUnmount() {
        this._isMounted = false;
        // --- PWA Cleanup ---
        window.removeEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", this.handleAppInstalled);
        // --- End PWA Cleanup ---

        if (this.profileOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
            this.profileOffcanvas.destroy();
            // Also destroy scrollbar if KTUtil.scrollDestroy is used
            const profilePanel = document.getElementById('kt_offcanvas_toolbar_profile');
            if (profilePanel) {
                const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
                if (body) KTUtil.scrollDestroy(body);
            }
            this.profileOffcanvas = null;
        }
        if (this.schoolUpdateHandler) {
            // Assuming Data.schools has an unsubscribe method, matching subscribe
            // If not, this line might need adjustment based on Data.schools API
            // Data.schools.unsubscribe(this.schoolUpdateHandler);
        }
    }

    // --- PWA Install Handlers ---
    handleBeforeInstallPrompt = (e) => {
        console.log("'beforeinstallprompt' event fired.");
        e.preventDefault();
        if (!(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || localStorage.getItem('appInstalled') === 'true')) {
            if (this._isMounted) this.setState({ deferredPrompt: e, showInstallButton: true });
        }
    };

    handleAppInstalled = () => {
        console.log('ShulePlus Management Console was installed.');
        localStorage.setItem('appInstalled', 'true');
        if (this._isMounted) this.setState({ showInstallButton: false, deferredPrompt: null });
    };

    handleInstallClick = async () => {
        const { deferredPrompt } = this.state;
        if (!deferredPrompt) {
            console.log("Deferred prompt not available to trigger.");
            return;
        }
        if (this._isMounted) this.setState({ showInstallButton: false });
        deferredPrompt.prompt();
        try {
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                console.log("User accepted the A2HS prompt");
            } else {
                console.log("User dismissed the A2HS prompt");
            }
        } catch (error) {
            console.error("Error with userChoice for install prompt:", error);
        }
        if (this._isMounted) this.setState({ deferredPrompt: null });
    };
    // --- End PWA Install Handlers ---

    initializeSchoolData = (currentUserData) => {
        // This handler will be called when school data changes
        this.schoolUpdateHandler = ({ schools }) => {
            if (!this._isMounted) return;

            const currentSchoolId = localStorage.getItem("school") || (schools && schools[0]?.id);
            const newSelected = (schools && schools.find(s => String(s.id) === String(currentSchoolId))) || (schools && schools[0]) || {};
            
            this.setState(prevState => {
                // Only update if there's a genuine change to avoid unnecessary re-renders/logic.
                if (prevState.selectedSchool?.id !== newSelected.id || prevState.availableSchools.length !== (schools?.length || 0)) {
                    return {
                        availableSchools: schools || [],
                        selectedSchool: newSelected,
                        // updated: true // 'updated' state flag seems redundant with direct checks
                    };
                }
                return null; // No change needed
            }, () => {
                // This callback runs after state is set
                if (newSelected.id) {
                    localStorage.setItem("school", newSelected.id);
                    // Title update is handled by componentDidUpdate
                }
                // Title is updated in componentDidUpdate based on selectedSchool change
            });
        };
        Data.schools.subscribe(this.schoolUpdateHandler);

        // Set initial state for schools based on localStorage or defaults
        // This is to ensure selectedSchool is an object even before subscription fires.
        const initialSelectedSchoolId = localStorage.getItem("school");
        const initialSchools = Data.schools.list(); // Assuming this can give an initial list sync
        const initialSelected = (initialSelectedSchoolId && initialSchools.find(s => String(s.id) === String(initialSelectedSchoolId))) || initialSchools[0] || {};
        
        this.setState({
            availableSchools: initialSchools,
            selectedSchool: initialSelected
        });
        if (initialSelected.id) {
             localStorage.setItem("school", initialSelected.id);
        }
        this.updateTitle(initialSelected); // Initial title update
    }

    initializeKTComponents = () => {
        if (!this._isMounted || !KTUtil || !KTOffcanvas) {
            console.warn("KTUtil or KTOffcanvas missing, or component unmounted. Skipping KT init.");
            return;
        }

        // Initialize general KT components (like menus, cards, etc.)
        // KTUtil.init() is often a blanket initializer.
        console.log("Navbar: Running KTUtil.init()");
        KTUtil.init();

        // Initialize KTOffcanvas components globally if needed,
        // or rely on specific instantiation below.
        // KTOffcanvas.init(); // This might be redundant if manually instantiating.

        // Specific Profile Offcanvas Initialization
        const profilePanelId = 'kt_offcanvas_toolbar_profile';
        const profilePanel = document.getElementById(profilePanelId);

        if (!profilePanel) {
            console.warn(`Profile Offcanvas panel #${profilePanelId} not found.`);
            return;
        }

        // Destroy previous instance if it exists
        if (this.profileOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
             console.log(`Destroying previous KTOffcanvas instance for #${profilePanelId}`);
             this.profileOffcanvas.destroy();
             const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
             if(body && typeof KTUtil.scrollDestroy === 'function') KTUtil.scrollDestroy(body); // Check if scrollDestroy exists
             this.profileOffcanvas = null;
        }

        try {
            console.log(`Initializing new KTOffcanvas instance for #${profilePanelId}`);
            const head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
            const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');

            this.profileOffcanvas = new KTOffcanvas(profilePanel, {
                overlay: true,
                baseClass: 'kt-offcanvas-panel',
                closeBy: 'kt_offcanvas_toolbar_profile_close',
                toggleBy: 'kt_offcanvas_toolbar_profile_toggler_btn'
            });

            if (body && typeof KTUtil.scrollInit === 'function') { // Check if scrollInit exists
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
                        return Math.max(height, 200); // Ensure a minimum height
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
        if (!justSelectedSchool || !justSelectedSchool.id || (this.state.selectedSchool && justSelectedSchool.id === this.state.selectedSchool.id)) {
            return;
        }
        localStorage.setItem("school", justSelectedSchool.id);
        // Full page reload re-initializes everything, including KT components.
        // While not ideal for SPA, it's a surefire way if state management for KT is complex.
        // If you want to avoid reload, ensure initializeKTComponents is robustly called.
        this.setState({ selectedSchool: justSelectedSchool, isLoading: true }, () => {
            window.location.reload();
        });
    }

    handleLogout = (isErrorLogout = false) => {
        localStorage.clear(); // Clears everything, including 'appInstalled' if you want to keep it, manage separately.
        // localStorage.removeItem("user");
        // localStorage.removeItem("school");
        // etc. for more granular control

        if (!isErrorLogout && this.props.history) {
            this.props.history.push('/');
        } else if (isErrorLogout) {
            // For error logout, redirect manually if history is not reliable or component unmounted
            window.location.href = '/';
        }
    }

    render() {
        const { isLoading, selectedSchool = {}, availableSchools = [], userData = {}, showInstallButton } = this.state;
        const userName = userData?.names || 'User';
        const userEmail = userData?.email;
        const userPhone = userData?.phone;
        const userOtherPhone = userData?.other_phone;
        // Use userRole from state, which should be populated from userData or a default
        const userRoleDisplay = this.state.userRole || 'User';


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

                            <li className={`kt-menu__item ${canSwitchSchools ? 'kt-menu__item--submenu kt-menu__item--rel' : ''}`}
                                data-ktmenu-submenu-toggle={canSwitchSchools ? 'click' : null} // KT attribute for menu
                                aria-haspopup={canSwitchSchools ? "true" : "false"}>
                                <a href={canSwitchSchools ? "#" : undefined} // Use "#" for javascript:; to be more React-friendly
                                   onClick={canSwitchSchools ? (e) => e.preventDefault() : undefined}
                                   className={`kt-menu__link ${canSwitchSchools ? 'kt-menu__toggle' : ''}`}>
                                    <span className="kt-menu__link-text kt-font-bold">{selectedSchool.name || (isLoading ? 'Loading...' : 'No School Selected')}</span>
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
                                <a href="#" onClick={(e) => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
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
                                <a href="#" onClick={(e) => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
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
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: '1rem', paddingRight: '1rem' }}
                                        title="Install ShulePlus Console App"
                                    >
                                        {/* Icon example: <i className="flaticon2-download-1 kt-font-success" style={{ marginRight: '5px' }}></i> */}
                                        <span className="kt-menu__link-text">Install App</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Header Topbar */}
                <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
                    <div
                        className="kt-header__topbar-item kt-header__topbar-item--user"
                        id="kt_offcanvas_toolbar_profile_toggler_btn" // KT attribute for toggle
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
                            <div style={{fontSize: 16, fontWeight: 700}}>{this.state.selectedSchool?.name || 'Shule Plus'}</div>
                            <div style={{fontSize: 14, opacity: 0.7}}>Welcome, {userName}</div>
                        </div>
                    </div>
                    <div className="kt-header-mobile__toolbar">
                        <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler"><span /></button> {/* KT attribute for toggle */}
                        <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" /></button> {/* KT attribute for toggle */}
                    </div>
                </div>


                {/* Profile Offcanvas Panel */}
                <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel"> {/* KT attribute for offcanvas */}
                    <div className="kt-offcanvas-panel__head">
                        <h3 className="kt-offcanvas-panel__title">Profile</h3>
                        <a href="#" onClick={(e) => e.preventDefault()} className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a> {/* KT attribute for close */}
                    </div>
                    <div className="kt-offcanvas-panel__body kt-scroll"> {/* kt-scroll is used by KTUtil.scrollInit */}
                        <div className="kt-user-card-v3 kt-margin-b-30">
                            <div className="kt-user-card-v3__avatar">
                                <img src={"/assets/media/users/default.jpg"} alt="User Avatar" />
                            </div>
                            <div className="kt-user-card-v3__detalis">
                                <span className="kt-user-card-v3__name">{userName}</span>
                                <div className="kt-user-card-v3__desc kt-font-sm">{userRoleDisplay}</div>
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