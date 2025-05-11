

import React from "react";
// import { Link, withRouter } from "react-router-dom"; // No longer using Link from react-router-dom
import { withRouter } from "react-router-dom"; // withRouter might still be used for history prop if needed elsewhere, or can be removed if not
import Pace from 'react-pace-progress';

const KTUtil = window.KTUtil;
const KTMenu = window.KTMenu;
const KTOffcanvas = window.KTOffcanvas;
// KTMenu is defined above

const ktMenuDefaultOptions = {
    scroll: { rememberPosition: false },
    accordion: { slideSpeed: 200, autoScroll: false, autoScrollSpeed: 1200, expandAll: true },
    dropdown: { timeout: 500 }
};

class Navbar extends React.Component {
    menuInstance = null;
    offcanvasInstance = null;
    profilePanelBodyRef = React.createRef();
    ktHeaderMenuRef = React.createRef();
    profilePanelRef = React.createRef();
    schoolsSubscription = null;

    state = {
        updated: false,
        selectedSchool: {},
        availableSchools: [],
        userRole: '',
        user: {},
    };

    componentDidMount() {
        try {
            const userDataString = localStorage.getItem("user");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                const userRole = Object.keys(userData)[0];
                const userDetails = userData[userRole];
                this.setState({ userRole, user: userDetails || {} });
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
        }

        if (window.Data && typeof window.Data.schools === 'object') {
            const schools = window.Data.schools.list();
            const selectedSchoolFromData = window.Data.schools.getSelected();
            this.setState({
                availableSchools: schools,
                selectedSchool: selectedSchoolFromData || (schools.length > 0 ? schools[0] : {}),
            });

            this.schoolsSubscription = window.Data.schools.subscribe(({ schools: updatedSchools }) => {
                this.setState({ updated: true });
                const currentSelectedSchoolId = window.Data.schools.getSelected()?.id || localStorage.getItem("school");
                let newSelectedSchool = updatedSchools.find(s => s.id.toString() === (currentSelectedSchoolId ? currentSelectedSchoolId.toString() : null));

                if (!newSelectedSchool && updatedSchools.length > 0) {
                    newSelectedSchool = updatedSchools[0];
                    window.Data.schools.setSelected(newSelectedSchool);
                    localStorage.setItem("school", newSelectedSchool.id.toString());
                }
                document.title = `${newSelectedSchool?.name || 'Shule Plus'} | Shule Plus`;
                this.setState({
                    availableSchools: updatedSchools,
                    selectedSchool: newSelectedSchool || {}
                });
            });
        } else {
            console.warn("Data service or Data.schools not found.");
        }

        if (window.app && typeof window.app.init === 'function') {
            window.app.init();
        }

        const menuElement = this.ktHeaderMenuRef.current;
        if (menuElement && typeof KTMenu === 'function' && KTUtil) {
            if (KTUtil.data(menuElement).has('menu')) {
                KTUtil.data(menuElement).remove('menu');
            }
            this.menuInstance = new KTMenu(menuElement, ktMenuDefaultOptions);
        } else {
            console.warn("KTMenu or menuElement not available for initialization.");
        }

        const profilePanelElement = this.profilePanelRef.current;
        if (profilePanelElement && typeof KTOffcanvas === 'function' && KTUtil) {
            const head = KTUtil.find(profilePanelElement, '.kt-offcanvas-panel__head');
            const bodyElement = this.profilePanelBodyRef.current;

            this.offcanvasInstance = new KTOffcanvas(profilePanelElement, {
                overlay: true, baseClass: 'kt-offcanvas-panel',
                closeBy: 'kt_offcanvas_toolbar_profile_close',
                toggleBy: 'kt_offcanvas_toolbar_profile_toggler_btn'
            });

            if (bodyElement) {
                KTUtil.scrollInit(bodyElement, {
                    disableForMobile: true, resetHeightOnDestroy: true, handleWindowResize: true,
                    height: function () {
                        let height = parseInt(KTUtil.getViewPort().height);
                        if (head) {
                            height = height - parseInt(KTUtil.actualHeight(head));
                            height = height - parseInt(KTUtil.css(head, 'marginBottom'));
                        }
                        height = height - parseInt(KTUtil.css(profilePanelElement, 'paddingTop'));
                        height = height - parseInt(KTUtil.css(profilePanelElement, 'paddingBottom'));
                        return height;
                    }
                });
            }
        } else {
            console.warn("KTOffcanvas or profilePanelElement not available.");
        }
    }

    componentWillUnmount() {
        if (this.schoolsSubscription && typeof this.schoolsSubscription.unsubscribe === 'function') {
            this.schoolsSubscription.unsubscribe();
        }

        if (this.menuInstance) {
            const menuElement = this.ktHeaderMenuRef.current;
            // Remove the specific resize handler added by this instance
            if (this.menuInstance.resizeHandler && KTUtil && typeof KTUtil.removeResizeHandler === 'function') {
                 KTUtil.removeResizeHandler(this.menuInstance.resizeHandler);
            }
            if (menuElement && KTUtil) {
                this.menuInstance.reload();
                KTUtil.data(menuElement).remove('menu');
            }
            this.menuInstance = null;
        }

        if (this.offcanvasInstance) {
            this.offcanvasInstance.destroy();
            this.offcanvasInstance = null;
        }

        const bodyElement = this.profilePanelBodyRef.current;
        if (bodyElement && KTUtil) {
            KTUtil.scrollDestroy(bodyElement);
        }
    }

    switchSchools = (justSelectedSchool) => { // Arrow function for `this` context
        localStorage.setItem("school", justSelectedSchool.id.toString());
        if (window.Data && typeof window.Data.schools === 'object') {
            window.Data.schools.setSelected(justSelectedSchool);
        }
        // No need to setState here as the page will reload
        window.location.reload();
    }

    handleNavLinkClick = (path) => {
        window.location.href = path;
    };
    
    render() {
        const userName = this.state.user?.user || "User";
        const userEmail = this.state.user?.email || "No Email";

        return (
            <div
                id="kt_header"
                className="kt-header kt-grid__item kt-grid kt-grid--ver  kt-header--fixed "
            >
                {this.state.updated !== true ? <Pace color="#ffffff" height={3} /> : null}

                <div className="kt-header__brand kt-grid__item" id="kt_header_brand">
                    <a href="/home"> {/* CHANGED */}
                        <img
                            alt="Logo"
                            style={{ width: 150 }}
                            src="/assets/media/logos/logo-v5.png"
                        />
                    </a>
                </div>

                <div
                    className="kt-header-menu-wrapper kt-grid__item"
                    id="kt_header_menu_wrapper"
                >
                    <div
                        id="kt_header_menu"
                        ref={this.ktHeaderMenuRef}
                        className="kt-header-menu kt-header-menu-mobile "
                    >
                        <ul className="kt-menu__nav ">
                            {(this.state.availableSchools.length > 1 || this.state.userRole === "admin") && this.state.selectedSchool?.name ? (
                                <li className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                    <a href="#!" onClick={(e) => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                                        <span className="kt-menu__link-text">{this.state.selectedSchool.name}</span>
                                        <i className="kt-menu__hor-arrow la la-angle-down" />
                                        <i className="kt-menu__ver-arrow la la-angle-right" />
                                    </a>
                                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                        <ul className="kt-menu__subnav">
                                            {this.state.availableSchools.map(school => (
                                                <li key={school.id} onClick={() => this.switchSchools(school)} className="kt-menu__item" aria-haspopup="true"> {/* Removed submenu attributes not needed for simple click */}
                                                    <a href="#!" onClick={(e) => {e.preventDefault(); this.switchSchools(school);}} className="kt-menu__link"> {/* switchSchools handles reload */}
                                                        <i className="kt-menu__link-bullet kt-menu__link-bullet--line"><span /></i>
                                                        <span className="kt-menu__link-text">{school.name}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ) : this.state.availableSchools.length === 1 && this.state.selectedSchool?.name ? (
                                <li className="kt-menu__item kt-menu__item--rel">
                                    <span className="kt-menu__link" style={{cursor: 'default'}}>
                                        <span className="kt-menu__link-text">{this.state.selectedSchool.name}</span>
                                    </span>
                                </li>
                            ): null }

                            <li className="kt-menu__item"> {/* Simplified if no submenu */}
                                <a href="/home" className="kt-menu__link"> {/* CHANGED */}
                                    <span className="kt-menu__link-text">Reports</span>
                                </a>
                            </li>

                            <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                <a href="#!" onClick={(e) => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                                    <span className="kt-menu__link-text">Data</span>
                                    <i className="kt-menu__hor-arrow la la-angle-down" /><i className="kt-menu__ver-arrow la la-angle-right" />
                                </a>
                                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                    <ul className="kt-menu__subnav">
                                        {[
                                            { path: "/schools", text: "Schools" }, { path: "/admins", text: "Admins" },
                                            { path: "/teams", text: "Teams" }, { path: "/members", text: "Team Members" },
                                            { path: "/invitations", text: "Invitations" }, { path: "/drivers", text: "Drivers" },
                                            { path: "/buses", text: "Buses" }, { path: "/routes", text: "Routes" },
                                            { path: "/schedules", text: "Schedules" }, { path: "/classes", text: "Classes" },
                                            { path: "/teachers", text: "Teachers" }, { path: "/students", text: "Students" },
                                            { path: "/parents", text: "Parents" }, { path: "/settings/school", text: "School Details" },
                                        ].map(item => (
                                            <li key={item.path} className="kt-menu__item"> {/* Simplified */}
                                                <a href={item.path} className="kt-menu__link"> {/* CHANGED */}
                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--line"><span /></i>
                                                    <span className="kt-menu__link-text">{item.text}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>

                            <li className="kt-menu__item"> {/* Simplified */}
                                <a href="/comms" className="kt-menu__link"> {/* CHANGED */}
                                    <span className="kt-menu__link-text">SMS & Email</span>
                                </a>
                            </li>

                            {this.state.selectedSchool?.financial && (
                                <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                                    <a href="#!" onClick={(e) => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                                        <span className="kt-menu__link-text">{this.state.selectedSchool.financial.balanceFormated}, Finance</span>
                                        <i className="kt-menu__hor-arrow la la-angle-down" /><i className="kt-menu__ver-arrow la la-angle-right" />
                                    </a>
                                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                                        <ul className="kt-menu__subnav">
                                            <li className="kt-menu__item"> {/* Simplified */}
                                                <a href="/finance/topup" className="kt-menu__link"> {/* CHANGED */}
                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--line"><span /></i>
                                                    <span className="kt-menu__link-text">Mpesa Top Up</span>
                                                </a>
                                            </li>
                                            <li className="kt-menu__item"> {/* Simplified */}
                                                <a href="/finance/charges" className="kt-menu__link"> {/* CHANGED */}
                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--line"><span /></i>
                                                    <span className="kt-menu__link-text">Your Charges</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            )}

                            <li className="kt-menu__item"> {/* Simplified */}
                                <a href="/learning" className="kt-menu__link"> {/* CHANGED */}
                                    <span className="kt-menu__link-text">Learning</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
                    <div
                        className="kt-header__topbar-item kt-header__topbar-item--user"
                        id="kt_offcanvas_toolbar_profile_toggler_btn" // This toggles the offcanvas, not a page reload
                    >
                        <div className="kt-header__topbar-welcome">Hi,</div>
                        <div className="kt-header__topbar-username">{userName}</div>
                        <div className="kt-header__topbar-wrapper">
                            <img alt="Pic" src="https://placeimg.com/140/140/any" />
                        </div>
                    </div>
                </div>

                <div id="kt_header_mobile" className="kt-header-mobile kt-header-mobile--fixed ">
                    <div className="kt-header-mobile__logo">
                        <a href="/home"> {/* CHANGED, assuming /home is the target */}
                            <img
                                alt="Logo"
                                style={{ width: 150, filter: 'invert(100%)' }}
                                src="/assets/media/logos/logo-v6.png"
                            />
                        </a>
                    </div>
                    <div className="kt-header-mobile__toolbar">
                        {/* These buttons toggle mobile menu UI, not page navigation */}
                        <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler"><span /></button>
                        <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" /></button>
                    </div>
                </div>

                <div id="kt_offcanvas_toolbar_profile" ref={this.profilePanelRef} className="kt-offcanvas-panel">
                    <div className="kt-offcanvas-panel__head">
                        <h3 className="kt-offcanvas-panel__title">Profile</h3>
                        <a href="#!" onClick={(e) => e.preventDefault()} className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
                    </div>
                    <div ref={this.profilePanelBodyRef} className="kt-offcanvas-panel__body kt-scroll">
                        <div className="kt-user-card-v3 kt-margin-b-30">
                            <div className="kt-user-card-v3__avatar">
                                <img src="https://placeimg.com/140/140/any" alt="" />
                            </div>
                            <div className="kt-user-card-v3__detalis">
                                <a href="#!" onClick={(e) => e.preventDefault()} className="kt-user-card-v3__name">{userName}</a>
                                <div className="kt-user-card-v3__info">
                                    <a href="#!" onClick={(e) => e.preventDefault()} className="kt-user-card-v3__item">
                                        <i className="flaticon-email-black-circular-button kt-font-brand" />
                                        <span className="kt-user-card-v3__tag">{userEmail}</span>
                                    </a>
                                    <span className="kt-user-card-v3__tag" style={{ paddingRight: 10 }}>
                                        <button
                                            className="btn btn-outline-brand"
                                            type="button"
                                            onClick={() => this.handleNavLinkClick("/settings/user")} // CHANGED
                                        >
                                            My User Details
                                        </button>
                                    </span>
                                    <span className="kt-user-card-v3__tag">
                                        <button
                                            className="btn btn-outline-brand"
                                            type="button"
                                            onClick={() => {
                                                localStorage.clear();
                                                window.location.href = '/login'; // Or your preferred logout destination
                                            }}
                                        >
                                            Log Out
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Navbar); // withRouter can be removed if props.history is no longer used.