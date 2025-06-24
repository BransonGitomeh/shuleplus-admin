/* eslint-env location */
import React from "react";
import { Link } from "react-router-dom";
import app from "../scripts.bundle"; // Assuming this is Metronic's app bundle
import Data from "../utils/data";
import { withRouter } from "react-router";
import Pace from 'react-pace-progress';

// Keep the Metronic JS initializers for things like dropdowns and the profile offcanvas
const KTUtil = window.KTUtil;
const KTOffcanvas = window.KTOffcanvas;
const KTMenu = window.KTMenu;

// --- SVG Icon Components (Keep as is) ---
const SvgSchoolsIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const SvgAdminsIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <rect x="14" y="10" width="8" height="7" rx="1"></rect> <path d="M18 10V8a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2"></path>
  </svg>
);
const SvgInvitationsIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);
const SvgDriversIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8"></circle> <circle cx="12" cy="12" r="2"></circle> <line x1="12" y1="4" x2="12" y2="8"></line> <line x1="12" y1="16" x2="12" y2="20"></line> <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line> <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line> <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line> <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);
const SvgBusesIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 15C5 14.4477 5.44772 14 6 14H18C18.5523 14 19 14.4477 19 15V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V15Z"></path> <path d="M5 14V9C5 7.34315 6.34315 6 8 6H16C17.6569 6 19 7.34315 19 9V14"></path> <path d="M2 19H5"></path> <path d="M19 19H22"></path> <path d="M6 10H10"></path> <path d="M14 10H18"></path> <circle cx="7.5" cy="17.5" r="1.5"></circle> <circle cx="16.5" cy="17.5" r="1.5"></circle>
  </svg>
);
const SvgRoutesIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path> <circle cx="12" cy="10" r="3"></circle>
  </svg>
);
const SvgSchedulesIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect> <line x1="16" y1="2" x2="16" y2="6"></line> <line x1="8" y1="2" x2="8" y2="6"></line> <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const SvgClassesIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path> <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);
const SvgTeachersIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect> <circle cx="8" cy="10" r="2"></circle> <line x1="13" y1="8" x2="18" y2="8"></line> <line x1="13" y1="12" x2="18" y2="12"></line> <line x1="6" y1="16" x2="18" y2="16"></line>
  </svg>
);
const SvgStudentsIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10l-10-5-10 5 4 2v6h12v-6l4-2z"></path> <path d="M6 12v6"></path> <path d="M12 14v7"></path> <path d="M12 21h-1"></path>
  </svg>
);
const SvgParentsIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path> <circle cx="9" cy="7" r="4"></circle> <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path> <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const SvgSettingsIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle> <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);
// --- End SVG Icon Components ---

const DEFAULT_TOP_NAV_BG_COLOR = '#FFFFFF';
const DEFAULT_TOP_NAV_TEXT_COLOR = '#212529'; // Dark color for text
const DEFAULT_TOP_NAV_ICON_COLOR = '#212529'; // Dark color for icons

const BOTTOM_NAV_BG_COLOR = '#ffffff';
const BOTTOM_NAV_TEXT_COLOR = '#212529';
const BOTTOM_NAV_ICON_COLOR = '#212529';

const LIGHT_GREY_HOVER_BG = '#f0f0f0'; // Example light grey

class Navbar extends React.Component {
  state = {
    selectedSchool: {},
    availableSchools: Data.schools.list(),
    userRole: "",
    fetchingSchools: false,
    topNavbarHeight: 75,
    mobileTopBarHeight: 60,
    secondaryNavbarEffectiveHeight: 65,
    gapBetweenNavbars: 20,
    secondaryNavbarHorizontalMargin: 25,
    isMobile: window.innerWidth < 992,
    isMobileMenuOpen: false, // State to control mobile menu
    openMobileSubmenu: null, // State for mobile accordion submenus
  };

  componentDidMount() {
    const userData = JSON.parse(localStorage.getItem("user"));
    const school = Data.schools.getSelected();
    const schools = Data.schools.list();

    this.setState({ schools, selectedSchool: school, fetchingSchools: schools.length === 0 });

    Data.schools.subscribe(({ schools, status }) => {
      const currentSelectedSchool = Data.schools.getSelected();
      let newSelectedSchool = currentSelectedSchool || (schools.length > 0 ? schools[0] : {});
      this.setState({
        availableSchools: schools,
        selectedSchool: newSelectedSchool,
        fetchingSchools: status === 'loading' || (status === 'idle' && schools.length === 0),
      }, () => {
        if (newSelectedSchool.id) {
          localStorage.setItem("school", newSelectedSchool.id);
          document.title = `${newSelectedSchool.name} | Shule Plus`;
        }
      });
    });

    let role = "";
    if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
      role = Object.keys(userData)[0];
    }
    this.setState({ userRole: role });

    app.init();
    this.initProfileOffcanvas();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  
  componentDidUpdate(prevProps, prevState) {
      // Re-initialize Metronic menus for desktop dropdowns when data changes
      if (!this.state.isMobile && (prevState.availableSchools !== this.state.availableSchools || prevState.selectedSchool !== this.state.selectedSchool)) {
          const desktopTopMenu = KTUtil.get('kt_header_menu');
          if (desktopTopMenu) new KTMenu(desktopTopMenu, {});
      }
      // Close mobile menu on route change
      if (prevProps.location.pathname !== this.props.location.pathname) {
          this.setState({ isMobileMenuOpen: false });
      }
  }


  handleResize = () => {
    const isMobileNow = window.innerWidth < 992;
    if (this.state.isMobile !== isMobileNow) {
        this.setState({ isMobile: isMobileNow, isMobileMenuOpen: false }); // Close menu on resize
    }
  }

  // Toggle mobile menu visibility
  toggleMobileMenu = () => {
    this.setState(prevState => ({ isMobileMenuOpen: !prevState.isMobileMenuOpen }));
  };

  // Toggle mobile submenu (accordion style)
  toggleMobileSubmenu = (menuName) => {
    this.setState(prevState => ({
      openMobileSubmenu: prevState.openMobileSubmenu === menuName ? null : menuName
    }));
  }

  initProfileOffcanvas = () => {
    const profilePanel = KTUtil.get('kt_offcanvas_toolbar_profile');
    if (profilePanel && !profilePanel.getAttribute('data-kt-initialized')) {
      profilePanel.setAttribute('data-kt-initialized', 'true');
      new KTOffcanvas(profilePanel, {
        overlay: true, baseClass: 'kt-offcanvas-panel', closeBy: 'kt_offcanvas_toolbar_profile_close',
        toggleBy: [
          { target: 'kt_offcanvas_toolbar_profile_toggler_btn', state: 'kt-header__topbar-toggler--active' },
          { target: 'kt_header_mobile_topbar_toggler', state: 'kt-header-mobile__toolbar-topbar-toggler--active' }
        ]
      });
    }
  }

  switchSchools = (newSchool) => {
    this.setState({ selectedSchool: newSchool, fetchingSchools: false, isMobileMenuOpen: false });
    localStorage.setItem("school", newSchool.id);
    window.location.reload();
  }

  handleInstallApp = () => {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then((choiceResult) => {
        window.deferredInstallPrompt = null;
        this.forceUpdate();
      });
    }
  };

  renderMobileNav = () => {
    const { isMobileMenuOpen, availableSchools, selectedSchool, openMobileSubmenu } = this.state;
    const manageDataItems = [
      { path: "/schools", label: "Schools", IconComponent: SvgSchoolsIcon },
      { path: "/admins", label: "Admins", IconComponent: SvgAdminsIcon },
      { path: "/invitations", label: "Invitations", IconComponent: SvgInvitationsIcon },
      { path: "/drivers", label: "Drivers", IconComponent: SvgDriversIcon },
      { path: "/buses", label: "Buses", IconComponent: SvgBusesIcon },
      { path: "/routes", label: "Routes", IconComponent: SvgRoutesIcon },
      { path: "/schedules", label: "Schedules", IconComponent: SvgSchedulesIcon },
      { path: "/classes", label: "Classes", IconComponent: SvgClassesIcon },
      { path: "/teachers", label: "Teachers", IconComponent: SvgTeachersIcon },
      { path: "/students", label: "Students", IconComponent: SvgStudentsIcon },
      { path: "/parents", label: "Parents", IconComponent: SvgParentsIcon },
      { path: "/settings/school", label: "School Details", IconComponent: SvgSettingsIcon },
    ];
    const financeItems = [
      { path: "/finance/topup", label: "Mpesa Top Up" },
      { path: "/finance/charges", label: "Your Charges" },
    ];

    const mobileMenuStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '300px',
      maxWidth: '80%',
      height: '100%',
      margin: '10px',
      borderRadius: '12px',
      backgroundColor: '#fff',
      zIndex: 1005,
      transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      boxShadow: '5px 0 15px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      padding: '20px',
      color: '#333'
    };

    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1004,
      display: isMobileMenuOpen ? 'block' : 'none',
      transition: 'opacity 0.3s ease',
      opacity: isMobileMenuOpen ? 1 : 0,
    };
    
    const linkStyle = { display: 'block', padding: '12px 15px', textDecoration: 'none', color: '#333', borderRadius: '6px', fontWeight: 500 };
    const subLinkStyle = { ...linkStyle, paddingLeft: '40px' };
    const iconStyle = { width: '18px', height: '18px', marginRight: '15px' };

    return (
      <>
        <div style={overlayStyle} onClick={this.toggleMobileMenu}></div>
        <div style={mobileMenuStyle}>
            <div style={{ paddingLeft: '25px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                {selectedSchool.logo_url ? (
                    <img src={selectedSchool.logo_url} alt={selectedSchool.name} style={{ maxHeight: '40px', marginRight: '10px' }} />
                ) : (
                    <span style={{ fontSize: '1.5rem', fontWeight: 500 }}>{selectedSchool.name}</span>
                )}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {/* School Switcher */}
                <li>
                    <a href="#!" onClick={(e) => {e.preventDefault(); this.toggleMobileSubmenu('schools');}} style={linkStyle}>
                        {selectedSchool.name || "Select School"} <i className={`la la-angle-${openMobileSubmenu === 'schools' ? 'down' : 'right'}`} style={{float: 'right'}}></i>
                    </a>
                    {openMobileSubmenu === 'schools' && (
                        <ul style={{listStyle: 'none', padding: 0, margin: '0 0 10px 0', backgroundColor: '#f9f9f9'}}>
                            {availableSchools.map(schoolItem => (
                                <li key={schoolItem.id} onClick={() => this.switchSchools(schoolItem)}>
                                    <a href="#!" onClick={e => e.preventDefault()} style={subLinkStyle}>{schoolItem.name}</a>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
                {/* Main Links */}
                <li><Link to="/home" style={linkStyle}>Reports</Link></li>
                <li><Link to="/comms" style={linkStyle}>SMS & Email</Link></li>
                <li><Link to="/learning" style={linkStyle}>Learning</Link></li>
                 {/* Manage Data */}
                 <li>
                    <a href="#!" onClick={(e) => {e.preventDefault(); this.toggleMobileSubmenu('manage');}} style={linkStyle}>
                        Manage Data <i className={`la la-angle-${openMobileSubmenu === 'manage' ? 'down' : 'right'}`} style={{float: 'right'}}></i>
                    </a>
                    {openMobileSubmenu === 'manage' && (
                        <ul style={{listStyle: 'none', padding: 0, margin: '0 0 10px 0', backgroundColor: '#f9f9f9'}}>
                            {manageDataItems.map(item => (
                                <li key={item.path}><Link to={item.path} style={subLinkStyle}>{item.label}</Link></li>
                            ))}
                        </ul>
                    )}
                </li>
                {/* Finance */}
                 <li>
                    <a href="#!" onClick={(e) => {e.preventDefault(); this.toggleMobileSubmenu('finance');}} style={linkStyle}>
                        Finance <i className={`la la-angle-${openMobileSubmenu === 'finance' ? 'down' : 'right'}`} style={{float: 'right'}}></i>
                    </a>
                    {openMobileSubmenu === 'finance' && (
                        <ul style={{listStyle: 'none', padding: 0, margin: '0 0 10px 0', backgroundColor: '#f9f9f9'}}>
                            {financeItems.map(item => (
                                <li key={item.path}><Link to={item.path} style={subLinkStyle}>{item.label}</Link></li>
                            ))}
                        </ul>
                    )}
                </li>
            </ul>
        </div>
      </>
    );
  }

  render() {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    let user = storedUser.names || "Guest";

    const {
        selectedSchool,
        availableSchools,
        fetchingSchools,
        topNavbarHeight,
        mobileTopBarHeight,
        secondaryNavbarEffectiveHeight,
        gapBetweenNavbars,
        secondaryNavbarHorizontalMargin,
        isMobile,
    } = this.state;
    
    // Theme colors
    const useSchoolTheme = selectedSchool && selectedSchool.theme_color;
    const effectiveTopBarBgColor = useSchoolTheme ? selectedSchool.theme_color : DEFAULT_TOP_NAV_BG_COLOR;
    const effectiveTopBarTextColor = useSchoolTheme ? '#FFFFFF' : DEFAULT_TOP_NAV_TEXT_COLOR;
    const effectiveTopBarIconColor = useSchoolTheme ? '#FFFFFF' : DEFAULT_TOP_NAV_ICON_COLOR;

    const topNavlinkStyle = { color: effectiveTopBarTextColor };
    const topNavIconStyle = { color: effectiveTopBarIconColor };

    // Layout calculations
    const firstBarHeight = isMobile ? mobileTopBarHeight : topNavbarHeight;
    const bottomNavCommonLinkStyle = { color: BOTTOM_NAV_TEXT_COLOR };
    const paceLoaderColor = effectiveTopBarTextColor;

    // *** CHANGE 1: Correctly calculate spacer height to clear the fixed top bar ***
    // This value represents the total vertical space occupied by the fixed top navbar.
    const fixedContentSpacerHeight = firstBarHeight + gapBetweenNavbars;


    const manageDataItems = [
      { path: "/schools", label: "Schools", IconComponent: SvgSchoolsIcon },
      { path: "/admins", label: "Admins", IconComponent: SvgAdminsIcon },
      { path: "/invitations", label: "Invitations", IconComponent: SvgInvitationsIcon },
      { path: "/drivers", label: "Drivers", IconComponent: SvgDriversIcon },
      { path: "/buses", label: "Buses", IconComponent: SvgBusesIcon },
      { path: "/routes", label: "Routes", IconComponent: SvgRoutesIcon },
      { path: "/schedules", label: "Schedules", IconComponent: SvgSchedulesIcon },
      { path: "/classes", label: "Classes", IconComponent: SvgClassesIcon },
      { path: "/teachers", label: "Teachers", IconComponent: SvgTeachersIcon },
      { path: "/students", label: "Students", IconComponent: SvgStudentsIcon },
      { path: "/parents", label: "Parents", IconComponent: SvgParentsIcon },
      { path: "/settings/school", label: "School Details", IconComponent: SvgSettingsIcon },
    ];

    const financeItems = [
      { path: "/finance/topup", label: "Mpesa Top Up" },
      { path: "/finance/charges", label: "Your Charges" },
    ];

    // CSS for hover effects
    const customHoverStyle = `
        /* Consistent hover styles for both navbars */
        .kt-header-menu .kt-menu__nav > .kt-menu__item:hover > .kt-menu__link,
        .kt-header-menu .kt-menu__nav > .kt-menu__item.kt-menu__item--hover > .kt-menu__link,
        #kt_bottom_nav_menu_container .kt-menu__nav > .kt-menu__item:hover > .kt-menu__link,
        #kt_bottom_nav_menu_container .kt-menu__nav > .kt-menu__item.kt-menu__item--hover > .kt-menu__link {
            background-color: ${LIGHT_GREY_HOVER_BG} !important;
        }

        /* Top nav text/icon color on hover (only when theme is NOT active) */
        ${!useSchoolTheme ? `
            #kt_header .kt-header-menu .kt-menu__nav > .kt-menu__item:hover > .kt-menu__link .kt-menu__link-text,
            #kt_header .kt-header-menu .kt-menu__nav > .kt-menu__item.kt-menu__item--hover > .kt-menu__link .kt-menu__link-text {
                color: ${DEFAULT_TOP_NAV_TEXT_COLOR} !important;
            }
            #kt_header .kt-header-menu .kt-menu__nav > .kt-menu__item:hover > .kt-menu__link .kt-menu__hor-arrow,
            #kt_header .kt-header-menu .kt-menu__nav > .kt-menu__item.kt-menu__item--hover > .kt-menu__link .kt-menu__hor-arrow,
            #kt_header .kt-header-menu .kt-menu__nav > .kt-menu__item:hover > .kt-menu__link .kt-menu__ver-arrow,
            #kt_header .kt-header-menu .kt-menu__nav > .kt-menu__item.kt-menu__item--hover > .kt-menu__link .kt-menu__ver-arrow {
                color: ${DEFAULT_TOP_NAV_ICON_COLOR} !important;
            }
        ` : ''}

        /* Submenu hover styles */
        .kt-menu__submenu .kt-menu__item:hover > .kt-menu__link,
        .kt-menu__submenu .kt-menu__item.kt-menu__item--hover > .kt-menu__link {
            background-color: ${LIGHT_GREY_HOVER_BG} !important;
        }
    `;

    return (
      <>
        <style>{customHoverStyle}</style>
        {isMobile && this.renderMobileNav()}
        {fetchingSchools && <Pace color={paceLoaderColor} height={5} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }} />}

        {/* DESKTOP TOP NAVBAR (Remains Fixed) */}
        <div
          id="kt_header"
          className="kt-header kt-grid__item d-none d-lg-flex"
          style={{
            backgroundColor: effectiveTopBarBgColor,
            alignItems: 'center', justifyContent: 'space-between',
            height: `${topNavbarHeight}px`, zIndex: 1002, position: 'fixed',
            top: `${gapBetweenNavbars}px`, left: `${secondaryNavbarHorizontalMargin}px`, right: `${secondaryNavbarHorizontalMargin}px`,
            borderRadius: '12px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)',
            padding: `0 25px`
          }}
        >
          {/* Left: Logo */}
          <div className="kt-header__brand">
            {!selectedSchool || Object.keys(selectedSchool).length === 0 ? (
              <div className="kt-spinner kt-spinner--sm kt-spinner--brand" />
            ) : (
              <Link to="/home">
                <img alt="School Logo" style={{ maxHeight: '50px', width: 'auto', borderRadius: '6px' }}
                  src={selectedSchool.logo || '/assets/media/logos/ic_launcher.png'} />
              </Link>
            )}
          </div>
          
          {/* Center: Menu */}
          <div className="kt-header-menu-wrapper" style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
            <div id="kt_header_menu" className="kt-header-menu kt-header-menu-mobile">
              <ul className="kt-menu__nav">
                {availableSchools.length > 1 && (
                  <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                    <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                      <span className="kt-menu__link-text" style={{ ...topNavlinkStyle, fontWeight: '500' }}>{selectedSchool.name || "Select School"}</span>
                      <i className="kt-menu__hor-arrow la la-angle-down" style={topNavIconStyle} />
                    </a>
                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                      <ul className="kt-menu__subnav">
                        {availableSchools.map(schoolItem => (
                          <li key={schoolItem.id} onClick={() => this.switchSchools(schoolItem)} className="kt-menu__item" aria-haspopup="true">
                            <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link">
                                <span className="kt-menu__link-text" style={{ color: DEFAULT_TOP_NAV_TEXT_COLOR }}>{schoolItem.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )}
                <li className="kt-menu__item"><Link to="/home" className="kt-menu__link"><span className="kt-menu__link-text" style={topNavlinkStyle}>Reports</span></Link></li>
                <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                  <a onClick={e => e.preventDefault()} href="#!" className="kt-menu__link kt-menu__toggle">
                    <span className="kt-menu__link-text" style={topNavlinkStyle}>Manage Data</span>
                    <i className="kt-menu__hor-arrow la la-angle-down" style={topNavIconStyle} />
                  </a>
                  <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                    <ul className="kt-menu__subnav">
                      {manageDataItems.map(item => (
                        <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                          <Link to={item.path} className="kt-menu__link">
                            <span className="kt-menu__link-icon kt-menu__link-icon--md" style={{ marginRight: '8px' }}><item.IconComponent style={{ width: '18px', height: '18px', color: DEFAULT_TOP_NAV_ICON_COLOR }} /></span>
                            <span className="kt-menu__link-text" style={{ color: DEFAULT_TOP_NAV_TEXT_COLOR }}>{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                 <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                    <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                        <span className="kt-menu__link-text" style={topNavlinkStyle}>
                           {(selectedSchool?.financial?.balanceFormated) || "KSH 0.00"}, Finance
                        </span>
                        <i className="kt-menu__hor-arrow la la-angle-down" style={topNavIconStyle} />
                    </a>
                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                        <ul className="kt-menu__subnav">
                          {financeItems.map(item => (
                            <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                              <Link to={item.path} className="kt-menu__link"><span className="kt-menu__link-text" style={{ color: DEFAULT_TOP_NAV_TEXT_COLOR }}>{item.label}</span></Link>
                            </li>
                          ))}
                        </ul>
                    </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right: User Profile */}
          <div className="kt-header__topbar">
            <div className="kt-header__topbar-item kt-header__topbar-item--user" id="kt_offcanvas_toolbar_profile_toggler_btn" style={{ cursor: 'pointer' }}>
              <div className="kt-header__topbar-welcome" style={{ color: effectiveTopBarTextColor }}>Hi,</div>
              <div className="kt-header__topbar-username" style={{ color: effectiveTopBarTextColor, marginLeft: '5px', fontWeight: '500' }}>{user}</div>
              <div className="kt-header__topbar-wrapper" style={{ marginLeft: '10px' }}>
                <img alt="User avatar" src={storedUser?.avatar || `https://picsum.photos/30/30?random=${storedUser?.id || 1027}`} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE TOP NAVBAR (Remains Fixed) */}
        <div
          id="kt_header_mobile"
          className="kt-header-mobile kt-header-mobile--fixed d-lg-none"
          style={{
            backgroundColor: effectiveTopBarBgColor, height: `${mobileTopBarHeight}px`,
            top: `${gapBetweenNavbars}px`, left: `${secondaryNavbarHorizontalMargin}px`, right: `${secondaryNavbarHorizontalMargin}px`,
            borderRadius: '12px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)', zIndex: 1002,
          }}
        >
          {/* Left: Mobile Menu Toggle */}
          <div className="kt-header-mobile__toolbar" style={{ paddingLeft: '15px' }}>
            <button className="kt-header-mobile__toolbar-toggler kt-header-mobile__toolbar-toggler--left" onClick={this.toggleMobileMenu}>
              <span style={{backgroundColor: effectiveTopBarIconColor}} />
            </button>
          </div>
          {/* Center: Logo / Title */}
          <div className="kt-header-mobile__logo" style={{ flexGrow: 1, textAlign: 'center' }}>
              <Link to="/home" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                  {selectedSchool.logo && <img alt="School Logo" style={{ maxHeight: '35px', width: 'auto', borderRadius: '4px', marginRight: '10px' }}
                    src={selectedSchool.logo} />}
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: effectiveTopBarTextColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedSchool.name || 'Shule Plus'}
                  </span>
              </Link>
          </div>
          {/* Right: Profile Toggle */}
          <div className="kt-header-mobile__toolbar" style={{ paddingRight: '15px' }}>
            <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler">
              <img alt="User" src={storedUser?.avatar || `https://picsum.photos/30/30?random=${storedUser?.id || 1027}`} style={{ width: '30px', height: '30px', borderRadius: '50%' }}/>
            </button>
          </div>
        </div>

        {/* *** CHANGE 2: Spacer Div is moved here and uses the corrected height calculation *** */}
        {/* This spacer pushes all subsequent content down to clear the fixed top navbar. */}
        <div style={{ height: `${(fixedContentSpacerHeight-50)}px` }} />

        {/* *** CHANGE 3: SECONDARY NAVBAR is now part of the scrolling content *** */}
        <div
            id="kt_header_secondary"
            className="d-none d-lg-flex"
            style={{
                backgroundColor: BOTTOM_NAV_BG_COLOR,
                justifyContent: 'space-between',
                alignItems: 'center',
                height: `${secondaryNavbarEffectiveHeight}px`,
                position: 'relative', // Now part of the document flow
                marginLeft: `${secondaryNavbarHorizontalMargin}px`,
                marginRight: `${secondaryNavbarHorizontalMargin}px`,
                marginBottom: `${gapBetweenNavbars}px`, // Add space below it
                borderRadius: '12px',
                boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
                padding: '0 25px',
            }}
        >
            <div className="kt-header__brand">
                <Link to="/home">
                    <div style={{ fontSize: '1.25rem', color: 'black', letterSpacing: '0.5px' }}>{selectedSchool.name}</div>
                </Link>
            </div>
            <div id="kt_bottom_nav_menu_container" className="kt-header-menu-wrapper">
                <div className="kt-header-menu">
                    <ul className="kt-menu__nav">
                        <li className="kt-menu__item"><Link to="/comms" className="kt-menu__link"><span className="kt-menu__link-text" style={bottomNavCommonLinkStyle}>SMS & Email</span></Link></li>
                        <li className="kt-menu__item"><Link to="/learning" className="kt-menu__link"><span className="kt-menu__link-text" style={bottomNavCommonLinkStyle}>Learning</span></Link></li>
                    </ul>
                </div>
            </div>
        </div>
        
        {/* PROFILE PANEL (Offcanvas) - Unchanged */}
        <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel" style={{ margin: '15px', borderRadius: '10px' }}>
            {/* Content remains the same as it's controlled by Metronic JS */}
            <div className="kt-offcanvas-panel__head">
                <h3 className="kt-offcanvas-panel__title">Profile</h3>
                <a href="#!" onClick={e => e.preventDefault()} className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
            </div>
            <div className="kt-offcanvas-panel__body kt-scroll">
                <div className="kt-user-card-v3 kt-margin-b-30">
                    <div className="kt-user-card-v3__avatar"><img alt="Pic" src={storedUser?.avatar || "https://via.placeholder.com/100x100.png?text=U"} /></div>
                    <div className="kt-user-card-v3__detalis">
                        <a href="#!" onClick={e => e.preventDefault()} className="kt-user-card-v3__name">{storedUser?.names || user}</a>
                        <div className="kt-user-card-v3__desc">{storedUser?.userType ? storedUser.userType.charAt(0).toUpperCase() + storedUser.userType.slice(1) : ''}</div>
                        <div className="kt-user-card-v3__info">
                            {storedUser?.email && (<a href={`mailto:${storedUser.email}`} className="kt-user-card-v3__item"><i className="flaticon-email-black-circular-button kt-font-brand" /><span className="kt-user-card-v3__tag">{storedUser.email}</span></a>)}
                            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button className="btn btn-label-brand btn-sm btn-bold btn-block" type="button" onClick={() => this.props.history.push({ pathname: "/settings/user" })}>Profile Settings</button>
                                {typeof window.matchMedia === 'function' && !window.matchMedia('(display-mode: standalone)').matches && typeof window.deferredInstallPrompt !== 'undefined' && (<button className="btn btn-label-success btn-sm btn-bold btn-block" type="button" onClick={this.handleInstallApp}>Install App</button>)}
                                <button className="btn btn-label-danger btn-sm btn-bold btn-block" type="button" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>Log Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* The original spacer div is no longer needed here as it has been moved and repurposed above */}
      </>
    );
  }
}

export default withRouter(Navbar);