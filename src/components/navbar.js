/* eslint-env browser */

import React from "react";
import { Link, withRouter } from "react-router-dom";
import Data from "../utils/data";
import Pace from 'react-pace-progress';

// Ensure KeenThemes components are available on the window object
const KTUtil = window.KTUtil;
const KTOffcanvas = window.KTOffcanvas;
const KTMenu = window.KTMenu;
const KTLayout = window.KTLayout; // Expected to be available from your KTLayout.js
const KTHeader = window.KTHeader; // For KTHeader instance cleanup, if available

class Navbar extends React.Component {
    state = {
        selectedSchool: Data.schools.getSelected() || {},
        availableSchools: Data.schools.list(),
        userData: null,
        userRole: null,
        isLoading: true,
        deferredPrompt: null,
        showInstallButton: false,
    };

    profileOffcanvas = null;
    installButtonRef = React.createRef();
    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        this.setState({ isLoading: true });

        window.addEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", this.handleAppInstalled);
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || localStorage.getItem('appInstalled') === 'true') {
          this.setState({ showInstallButton: false });
        }

        let parsedUserData = null;
        const userJson = localStorage.getItem("user");
        if (userJson) {
            try {
                parsedUserData = JSON.parse(userJson);
                if (!parsedUserData || typeof parsedUserData !== 'object') {
                    throw new Error("Invalid user data format in localStorage");
                }
                this.setState({
                    userData: parsedUserData,
                    userRole: parsedUserData.role || 'User'
                });
            } catch (error) {
                console.error("Error parsing user data:", error);
                this.handleLogout(true);
                return;
            }
        } else {
            console.warn("No user data found. Redirecting to login.");
            if (this.props.history) this.props.history.push('/login');
            return;
        }

        this.initializeSchoolData(parsedUserData);

        setTimeout(() => {
            if (this._isMounted) {
                this.setState({ isLoading: false });
                // KT components will be initialized in componentDidUpdate when isLoading transitions to false
            }
        }, 300);
    }

    componentDidUpdate(prevProps, prevState) {
        let needsKTRefresh = false;

        if (prevProps.location.pathname !== this.props.location.pathname) {
            console.log("Navbar: Route changed, scheduling KT component refresh.");
            needsKTRefresh = true;
            if (this.profileOffcanvas && typeof this.profileOffcanvas.isShown === 'function' && this.profileOffcanvas.isShown()) {
                this.profileOffcanvas.hide();
            }
        }

        if (prevState.isLoading && !this.state.isLoading) {
            console.log("Navbar: Initial loading sequence complete, scheduling KT component refresh.");
            needsKTRefresh = true;
        }

        if (prevState.selectedSchool?.id !== this.state.selectedSchool?.id) {
             this.updateTitle(this.state.selectedSchool);
             // If switchSchools stops reloading page, this might trigger a KT refresh too.
             // Currently, switchSchools reloads, so KT init happens naturally.
        } else if (!this.state.selectedSchool?.id && prevState.selectedSchool?.id) {
            this.updateTitle();
        }

        if (needsKTRefresh && this._isMounted) {
            // Defer to ensure DOM is fully updated by React before KT init.
            setTimeout(() => {
                if (this._isMounted) {
                    console.log("Navbar: Calling initializeKTComponents due to update.");
                    this.initializeKTComponents();
                }
            }, 0); // 0ms timeout pushes to next event loop cycle
        }

        if (prevState.isLoading && !this.state.isLoading && this.state.selectedSchool?.id) {
             this.updateTitle(this.state.selectedSchool);
        }
    }

    // componentWillUnmount() {
    //     this._isMounted = false;
    //     window.removeEventListener("beforeinstallprompt", this.handleBeforeInstallPrompt);
    //     window.removeEventListener("appinstalled", this.handleAppInstalled);

    //     // 1. Destroy KTOffcanvas instance for profile
    //     if (this.profileOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
    //         console.log("Navbar: Destroying KTOffcanvas (profile) instance on unmount.");
    //         this.profileOffcanvas.destroy();
    //         const profilePanel = document.getElementById('kt_offcanvas_toolbar_profile');
    //         if (profilePanel && KTUtil && typeof KTUtil.find === 'function' && typeof KTUtil.scrollDestroy === 'function') {
    //              const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
    //              if (body) KTUtil.scrollDestroy(body);
    //         }
    //         this.profileOffcanvas = null;
    //     }

    //     // 2. Destroy KTMenu instances associated with Navbar menus
    //     this.destroyHeaderMenus("unmount");

    //     // 3. Attempt to destroy KTHeader instance
    //     if (KTHeader && KTUtil) {
    //         const headerEl = document.getElementById('kt_header');
    //         if (headerEl) {
    //             // Try to get instance via KTUtil.data or static KTHeader.getInstance
    //             const headerInstance = KTUtil.data(headerEl).get('header') || (typeof KTHeader.getInstance === 'function' && KTHeader.getInstance(headerEl));
    //             if (headerInstance && typeof headerInstance.destroy === 'function') {
    //                 try {
    //                     console.log("Navbar: Destroying KTHeader instance on unmount.");
    //                     headerInstance.destroy();
    //                     KTUtil.data(headerEl).remove('header'); // Clean up KTUtil's data store
    //                 } catch (error) {
    //                     console.error("Error destroying KTHeader instance on unmount:", error);
    //                 }
    //             }
    //         }
    //     }

    //     if (this.schoolUpdateHandler && Data.schools && typeof Data.schools.unsubscribe === 'function') {
    //         Data.schools.unsubscribe(this.schoolUpdateHandler);
    //         this.schoolUpdateHandler = null;
    //     }
    // }

    // /**
    //  * Destroys KTMenu instances within the header.
    //  * This is crucial before re-initializing menus to prevent conflicts.
    //  * @param {string} context - A string describing when this function is called (for logging).
    //  */
    destroyHeaderMenus = (context = "general") => {
        if (KTMenu && KTUtil) {
            console.log(`Navbar: Destroying existing KTMenu instances in header menu (context: ${context}).`);
            const headerMenuEl = document.getElementById('kt_header_menu'); // Main desktop menu container
            if (headerMenuEl) {
                const menuElements = headerMenuEl.querySelectorAll('[data-ktmenu-submenu-toggle]');
                menuElements.forEach(el => {
                    // Try to get instance via KTUtil.data or static KTMenu.getInstance
                    const menuInstance = KTUtil.data(el).get('menu') || (typeof KTMenu.getInstance === 'function' && KTMenu.getInstance(el));
                    if (menuInstance && typeof menuInstance.destroy === 'function') {
                        try {
                            menuInstance.destroy();
                            KTUtil.data(el).remove('menu'); // Clean up KTUtil's data store for this element
                        } catch (error) {
                            console.error(`Error destroying KTMenu instance (context: ${context}):`, error, "on element:", el);
                        }
                    }
                });
            }
            // If mobile menus are in a different container (e.g., offcanvas) and use KTMenu,
            // they would need similar targeted destruction here.
            // Example:
            // const mobileMenuContainer = document.getElementById('kt_header_mobile_menu_nav'); // Fictional ID
            // if (mobileMenuContainer) { /* ... similar logic ... */ }
        }
    }

    initializeKTComponents = () => {
        if (!this._isMounted || !KTUtil || !KTLayout) {
            console.warn("Navbar: KTUtil/KTLayout missing or component unmounted. Skipping KT init.");
            return;
        }

        console.log("Navbar: Preparing to re-initialize KeenThemes components for Navbar scope.");

        // --- Synchronous Destruction Phase (Crucial for re-initialization) ---
        // Destroy menu instances before attempting to re-initialize them.
        this.destroyHeaderMenus("pre-reinit");

        // --- Asynchronous Initialization Phase (after DOM is confirmed ready) ---
        KTUtil.ready(() => {
            if (!this._isMounted) {
                console.log("Navbar: Component unmounted before KTUtil.ready callback for initialization.");
                return;
            }

            console.log("Navbar: KTUtil.ready - DOM is confirmed ready, proceeding with KT component initialization.");

            try {
                // 1. Re-initialize header-specific components using KTLayout's provided method.
                // This function (from your KTLayout.js) is expected to call:
                // initHeader(), initHeaderMenu(), initHeaderTopbar(), initScrolltop()
                if (typeof KTLayout.initHeader === 'function') {
                    console.log("Navbar: Calling KTLayout.initHeader().");
                    KTLayout.initHeader();
                } else {
                    console.warn("Navbar: KTLayout.initHeader is not a function. Header/Menu/Topbar might not initialize correctly.");
                    // Fallback: If KTLayout.initHeader is missing, attempt direct KTMenu initialization
                    // for dropdowns, as they are the most common interactive element breaking.
                    if (KTMenu && typeof KTMenu.init === 'function') {
                        console.log("Navbar: (Fallback from missing KTLayout.initHeader) Calling KTMenu.init() explicitly for dropdowns.");
                        KTMenu.init();
                    } else {
                         console.warn("Navbar: (Fallback) KTMenu.init is not a function. Dropdown menus might not work.");
                    }
                }

                // 2. Re-initialize the KTOffcanvas for the profile panel (managed by this component).
                this.initializeProfileOffcanvas();

                console.log("Navbar: KeenThemes component initialization process for Navbar scope completed.");

            } catch (error) {
                console.error("Error during KeenThemes component initialization in KTUtil.ready:", error);
            }
        });
    };

    initializeProfileOffcanvas = () => {
        if (!KTUtil) return; // Guard against KTUtil not being available

        const profilePanelId = 'kt_offcanvas_toolbar_profile';
        const profilePanel = document.getElementById(profilePanelId);

        if (!profilePanel) {
            console.warn(`Navbar: Profile Offcanvas panel #${profilePanelId} not found.`);
            return;
        }

        if (KTOffcanvas) {
            // Destroy previous instance if it exists (KTOffcanvas might not store on KTUtil.data)
            if (this.profileOffcanvas && typeof this.profileOffcanvas.destroy === 'function') {
                 console.log(`Navbar: Destroying previous KTOffcanvas (profile) instance.`);
                 this.profileOffcanvas.destroy();
                 // Also destroy associated scrollbar if KTUtil.scrollInit was used
                 const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
                 if (body && typeof KTUtil.scrollDestroy === 'function') { // Check if scrollDestroy exists
                     KTUtil.scrollDestroy(body);
                 }
                 this.profileOffcanvas = null;
            }

            try {
                console.log(`Navbar: Initializing new KTOffcanvas (profile) instance for #${profilePanelId}`);
                this.profileOffcanvas = new KTOffcanvas(profilePanel, {
                    overlay: true,
                    baseClass: 'kt-offcanvas-panel',
                    closeBy: 'kt_offcanvas_toolbar_profile_close',
                    toggleBy: 'kt_offcanvas_toolbar_profile_toggler_btn'
                });

                const head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
                const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');
                if (body && typeof KTUtil.scrollInit === 'function') { // Check if scrollInit exists
                    KTUtil.scrollInit(body, {
                        disableForMobile: true,
                        resetHeightOnDestroy: true,
                        handleWindowResize: true,
                        height: function () {
                            let height = parseInt(KTUtil.getViewPort().height);
                            if (head && typeof KTUtil.actualHeight === 'function') { // Check actualHeight
                                height = height - parseInt(KTUtil.actualHeight(head));
                                height = height - (parseInt(KTUtil.css(head, 'marginBottom')) || 0);
                            }
                            height = height - (parseInt(KTUtil.css(profilePanel, 'paddingTop')) || 0);
                            height = height - (parseInt(KTUtil.css(profilePanel, 'paddingBottom')) || 0);
                            return Math.max(height, 200); // Minimum height
                        }
                    });
                     console.log(`Navbar: Initialized KTUtil scroll for #${profilePanelId} body.`);
                }
            } catch (error) {
                console.error(`Navbar: Error initializing KTOffcanvas for #${profilePanelId}:`, error);
                this.profileOffcanvas = null; // Ensure it's null on error
            }
        } else {
            console.warn("Navbar: KTOffcanvas library not found. Skipping profile offcanvas initialization.");
        }
    };


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
            console.log("Deferred prompt not available to trigger install.");
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
            console.error("Error processing install prompt userChoice:", error);
        }
        if (this._isMounted) this.setState({ deferredPrompt: null });
    };

    initializeSchoolData = (/* currentUserData */) => {
        this.schoolUpdateHandler = ({ schools }) => {
            if (!this._isMounted) return;
            const schoolsList = schools || [];
            const currentSchoolId = localStorage.getItem("school");
            let newSelected = {};
            if (currentSchoolId) {
                newSelected = schoolsList.find(s => String(s.id) === String(currentSchoolId)) || schoolsList[0] || {};
            } else {
                newSelected = schoolsList[0] || {};
            }
            this.setState(prevState => {
                if (prevState.selectedSchool?.id !== newSelected.id || prevState.availableSchools.length !== schoolsList.length) {
                    return { availableSchools: schoolsList, selectedSchool: newSelected };
                }
                return null;
            }, () => {
                if (newSelected.id && String(localStorage.getItem("school")) !== String(newSelected.id)) {
                     localStorage.setItem("school", newSelected.id);
                }
            });
        };
        // Ensure Data.schools and its subscribe method exist before calling
        if (Data.schools && typeof Data.schools.subscribe === 'function') {
            Data.schools.subscribe(this.schoolUpdateHandler);
        } else {
            console.warn("Navbar: Data.schools.subscribe is not available. School data might not update dynamically.");
        }

        const initialSchools = Data.schools.list ? Data.schools.list() : [];
        const initialSelectedSchoolId = localStorage.getItem("school");
        const initialSelected = (initialSelectedSchoolId && initialSchools.find(s => String(s.id) === String(initialSelectedSchoolId))) || initialSchools[0] || {};

        this.setState({
            availableSchools: initialSchools,
            selectedSchool: initialSelected
        });
        if (initialSelected.id) {
            localStorage.setItem("school", initialSelected.id);
        }
        this.updateTitle(initialSelected);
    }

    updateTitle = (school) => {
        const baseTitle = "Shule Plus";
        if (school?.name) {
            document.title = `${school.name} | ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }

    switchSchools = (justSelectedSchool) => {
        if (!justSelectedSchool || !justSelectedSchool.id || (this.state.selectedSchool && justSelectedSchool.id === this.state.selectedSchool.id)) {
            return;
        }
        localStorage.setItem("school", justSelectedSchool.id);
        this.setState({ selectedSchool: justSelectedSchool, isLoading: true }, () => {
            console.log(`Switching school to ${justSelectedSchool.name} (${justSelectedSchool.id}), reloading page...`);
            window.location.reload(); // Full reload re-initializes all scripts naturally
        });
    }

    handleLogout = (isErrorLogout = false) => {
        console.log(`Logging out (Error logout: ${isErrorLogout})`);
        localStorage.clear();
        if (!isErrorLogout && this.props.history) {
            this.props.history.push('/');
        } else {
            window.location.href = '/'; // Fallback redirect
        }
    }

    render() {
        const { isLoading, selectedSchool = {}, availableSchools = [], userData = {}, showInstallButton } = this.state;
        const userName = userData?.names || 'User';
        const userEmail = userData?.email;
        const userPhone = userData?.phone;
        const userOtherPhone = userData?.other_phone;
        const userRoleDisplay = this.state.userRole || 'User';

        const canSwitchSchools = Array.isArray(availableSchools) && availableSchools.length > 1;
        const schoolBalance = selectedSchool?.financial?.balanceFormatted;

        return (
            <>
                {/* Header */}
                <div id="kt_header" className="kt-header kt-grid__item kt-grid kt-grid--ver kt-header--fixed">
                    {isLoading && <Pace color="#366cf3" height={3} />}

                    <div className="kt-header__brand kt-grid__item" id="kt_header_brand">
                        <Link to="/trips/all">
                            <img alt="Logo" style={{ width: 150 }} src="/assets/media/logos/logo-v5.png" />
                        </Link>
                    </div>

                    <div className="kt-header-menu-wrapper kt-grid__item" id="kt_header_menu_wrapper" style={{ borderRadius: '10px', margin: '10px' }}>
                        <div id="kt_header_menu" className="kt-header-menu kt-header-menu-mobile" > {/* KTMenu will target this ID */}
                            <ul className="kt-menu__nav" >
                                <li className={`kt-menu__item ${canSwitchSchools ? 'kt-menu__item--submenu kt-menu__item--rel' : ''}`}
                                    data-ktmenu-submenu-toggle={canSwitchSchools ? 'click' : undefined}
                                    aria-haspopup={canSwitchSchools ? "true" : "false"}>
                                    <a href="#" // eslint-disable-line jsx-a11y/anchor-is-valid
                                       onClick={(e) => { e.preventDefault(); /* KTMenu handles toggle */ }}
                                       className={`kt-menu__link ${canSwitchSchools ? 'kt-menu__toggle' : ''}`}>
                                        <span className="kt-menu__link-text kt-font-bold">
                                            {selectedSchool.name || (isLoading ? 'Loading School...' : 'No School Selected')}
                                        </span>
                                        {canSwitchSchools && <i className="kt-menu__hor-arrow la la-angle-down" />}
                                        {canSwitchSchools && <i className="kt-menu__ver-arrow la la-angle-right" />}
                                    </a>
                                    {canSwitchSchools && (
                                        <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                            <ul className="kt-menu__subnav">
                                                {availableSchools.map(school => (
                                                    <li key={school.id} onClick={() => this.switchSchools(school)}
                                                        className={`kt-menu__item ${school.id === selectedSchool.id ? 'kt-menu__item--active' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                        >
                                                        <span className="kt-menu__link">
                                                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                            <span className="kt-menu__link-text">{school.name}</span>
                                                        </span>
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
                                    <a href="#" onClick={(e) => e.preventDefault()} className="kt-menu__link kt-menu__toggle"> {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
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
                                                <li key={item.path} className="kt-menu__item">
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
                                    <a href="#" onClick={(e) => e.preventDefault()} className="kt-menu__link kt-menu__toggle"> {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
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
                                            <li className="kt-menu__item">
                                                <Link to="/finance/topup" className="kt-menu__link">
                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i>
                                                    <span className="kt-menu__link-text">Top Up</span>
                                                </Link>
                                            </li>
                                            <li className="kt-menu__item">
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

                                {showInstallButton && (
                                    <li className="kt-menu__item kt-menu__item--rel">
                                        <button
                                            ref={this.installButtonRef}
                                            onClick={this.handleInstallClick}
                                            className="kt-menu__link"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: '1rem', paddingRight: '1rem', width: '100%', textAlign: 'left' }}
                                            title="Install ShulePlus Console App"
                                        >
                                            <i className="flaticon2-download-1 kt-font-success" style={{ marginRight: '5px' }}></i>
                                            <span className="kt-menu__link-text">Install App</span>
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
                        <div
                            className="kt-header__topbar-item kt-header__topbar-item--user"
                            id="kt_offcanvas_toolbar_profile_toggler_btn" // KTOffcanvas toggle target
                            role="button"
                            tabIndex={0}
                            aria-label="Toggle User Profile Panel"
                            // KTOffcanvas uses this ID to attach its event listener
                        >
                            <div className="kt-header__topbar-welcome kt-hidden-mobile">Hi,</div>
                            <div className="kt-header__topbar-username">{userName}</div>
                            <div className="kt-header__topbar-wrapper">
                                <img alt="User Pic" src={"/assets/media/users/default.jpg"} />
                            </div>
                        </div>
                    </div>
                </div>

                 <div id="kt_header_mobile" className="kt-header-mobile kt-header-mobile--fixed">
                    <div className="kt-header-mobile__logo">
                        <Link to="/trips/all">
                            <img alt="Logo" style={{ maxHeight: '30px' }} src="/assets/media/logos/logo-v5-alt.png" />
                        </Link>
                    </div>
                    <div className="kt-header-mobile__toolbar">
                        {/* These buttons are typically handled by KTToggle or similar, initialized by KTLayout.initHeader() */}
                        <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler" aria-label="Toggle Mobile Menu">
                            <span />
                        </button>
                        <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler" aria-label="Toggle Mobile Topbar">
                            <i className="flaticon-more" />
                        </button>
                    </div>
                </div>

                <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel"> {/* KTOffcanvas target panel */}
                    <div className="kt-offcanvas-panel__head">
                        <h3 className="kt-offcanvas-panel__title">Profile</h3>
                        <button
                            className="kt-offcanvas-panel__close"
                            id="kt_offcanvas_toolbar_profile_close" /* KTOffcanvas uses this ID for close */
                            aria-label="Close Profile Panel"
                            // KTOffcanvas handles the click
                            >
                                <i className="flaticon2-delete" />
                         </button>
                    </div>
                    <div className="kt-offcanvas-panel__body kt-scroll"> {/* kt-scroll class for KT custom scrollbar */}
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
                                        onClick={() => {
                                            if (this.props.history) this.props.history.push("/settings/user");
                                            if (this.profileOffcanvas && typeof this.profileOffcanvas.isShown === 'function' && this.profileOffcanvas.isShown()) {
                                                this.profileOffcanvas.hide();
                                            }
                                        }}
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
                        {/* Additional content for the offcanvas panel can go here */}
                    </div>
                </div>
            </>
        );
    }
}

export default withRouter(Navbar);