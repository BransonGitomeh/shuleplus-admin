/* eslint-env location */

import React from "react";
import { Link } from "react-router-dom";
import app from "../scripts.bundle"; // Assuming this is Metronic's app bundle
import Data from "../utils/data";
import { withRouter } from "react-router";
import Pace from 'react-pace-progress';

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
const DEFAULT_TOP_NAV_TEXT_COLOR = '#212529';
const DEFAULT_TOP_NAV_ICON_COLOR = '#212529';

const BOTTOM_NAV_BG_COLOR = '#ffffff';
const BOTTOM_NAV_TEXT_COLOR = '#212529';
const BOTTOM_NAV_ICON_COLOR = '#212529';

class Navbar extends React.Component {
  state = {
    selectedSchool: {},
    availableSchools: Data.schools.list(),
    userRole: "",
    fetchingSchools: false,
    // Navbar dimensions
    topNavbarHeight: 80, // For desktop kt_header
    mobileTopBarHeight: 60, // For kt_header_mobile
    secondaryNavbarEffectiveHeight: 70,
    gapBetweenNavbars: 15,
    secondaryNavbarHorizontalMargin: 25, // Used for all floating navs
    isMobile: window.innerWidth < 992,
  };

  componentDidMount() {
    console.log("Navbar: componentDidMount");
    const userData = JSON.parse(localStorage.getItem("user"));
    console.log('Navbar: user data from local storage', userData);
    const school = Data.schools.getSelected();
    console.log('Navbar: selected school from data context', school);
    const schools = Data.schools.list();
    console.log('Navbar: schools from data context', schools);

    this.setState({ schools, selectedSchool: school, fetchingSchools: schools.length === 0 });

    Data.schools.subscribe(({ schools, status }) => {
      const currentSelectedSchool = Data.schools.getSelected();
      let newSelectedSchool = currentSelectedSchool || (schools.length > 0 ? schools[0] : {});
      console.log('Navbar: schools subscription triggered', { schools, status, currentSelectedSchool, newSelectedSchool });
      this.setState({
        availableSchools: schools,
        fetchingSchools: status === 'loading' || (status === 'idle' && schools.length === 0),
      }, () => {
        if (newSelectedSchool.id && !this.state.selectedSchool.id) {
          console.log('Navbar: setting school to local storage', newSelectedSchool.id);
          localStorage.setItem("school", newSelectedSchool.id);
          document.title = `${newSelectedSchool.name} | Shule Plus`;
          this.setState({ selectedSchool: newSelectedSchool });
        }
      });
    });

    let role = "";
    if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
      role = Object.keys(userData)[0];
    }
    this.setState({ userRole: role });

    app.init(); // General Metronic init, should include KTHeaderMobile and KTMenu

    this.initProfileOffcanvas();

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps, prevState) {
     // Re-initialize KTMenu for desktop menus if schools data changes
    if (!this.state.isMobile && (prevState.availableSchools !== this.state.availableSchools || prevState.selectedSchool !== this.state.selectedSchool)) {
        const desktopTopMenu = KTUtil.get('kt_header_menu');
        if (desktopTopMenu) new KTMenu(desktopTopMenu, {});
        
        const desktopBottomMenuContainer = KTUtil.get('kt_bottom_nav_menu_container');
        if (desktopBottomMenuContainer) {
            const desktopBottomMenu = KTUtil.find(desktopBottomMenuContainer, '.kt-header-menu');
            if (desktopBottomMenu) new KTMenu(desktopBottomMenu, {});
        }
    }
    // Note: Metronic's KTHeaderMobile typically handles the kt_header_menu for mobile view
    // when kt_header_mobile_toggler is used. If issues arise with dynamic content in the mobile
    // off-canvas menu, explicit re-init for KTMenu on #kt_header_menu in mobile context might be needed.
  }

  handleResize = () => {
    this.setState({ isMobile: window.innerWidth < 992 });
  }

  initProfileOffcanvas = () => {
    const profilePanel = KTUtil.get('kt_offcanvas_toolbar_profile');
    if (profilePanel && !profilePanel.getAttribute('data-kt-initialized')) {
      profilePanel.setAttribute('data-kt-initialized', 'true');
      const head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
      const body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');

      new KTOffcanvas(profilePanel, {
        overlay: true,
        baseClass: 'kt-offcanvas-panel',
        closeBy: 'kt_offcanvas_toolbar_profile_close',
        toggleBy: [ // Array of togglers
          { target: 'kt_offcanvas_toolbar_profile_toggler_btn', state: 'kt-header__topbar-toggler--active' }, // Desktop
          { target: 'kt_header_mobile_topbar_toggler', state: 'kt-header-mobile__toolbar-topbar-toggler--active' } // Mobile
        ]
      });

      if (body) {
        KTUtil.scrollInit(body, {
          disableForMobile: true, resetHeightOnDestroy: true, handleWindowResize: true,
          height: function () {
            let currentHeight = profilePanel.clientHeight;
            if (head) {
              currentHeight = currentHeight - parseInt(KTUtil.actualHeight(head));
              currentHeight = currentHeight - parseInt(KTUtil.css(head, 'marginBottom'));
            }
            return currentHeight;
          }
        });
      }
    }
  }

  switchSchools = (newSchool) => {
    this.setState({ selectedSchool: newSchool, fetchingSchools: false });
    localStorage.setItem("school", newSchool.id);
    window.location.reload();
  }
  
  handleInstallApp = () => {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        window.deferredInstallPrompt = null;
        this.forceUpdate(); 
      });
    }
  };

  render() {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    let user = storedUser.names || "Guest";

    const {
        selectedSchool,
        availableSchools,
        fetchingSchools,
        topNavbarHeight, // Desktop top nav height
        mobileTopBarHeight, // Mobile top nav height
        secondaryNavbarEffectiveHeight,
        gapBetweenNavbars,
        secondaryNavbarHorizontalMargin,
        isMobile,
    } = this.state;

    const useSchoolTheme = selectedSchool && selectedSchool.theme_color;
    const effectiveTopBarBgColor = useSchoolTheme ? selectedSchool.theme_color : DEFAULT_TOP_NAV_BG_COLOR;
    const effectiveTopBarTextColor = useSchoolTheme ? '#FFFFFF' : DEFAULT_TOP_NAV_TEXT_COLOR;
    const effectiveTopBarIconColor = useSchoolTheme ? '#FFFFFF' : DEFAULT_TOP_NAV_ICON_COLOR;

    const topNavlinkStyle = { color: effectiveTopBarTextColor };
    const topNavIconStyle = { color: effectiveTopBarIconColor };

    const firstBarHeight = isMobile ? mobileTopBarHeight : topNavbarHeight;
    const secondaryNavbarTopPosition = gapBetweenNavbars + firstBarHeight + gapBetweenNavbars;
    
    const totalFixedElementsHeight = secondaryNavbarTopPosition + secondaryNavbarEffectiveHeight;

    const bottomNavCommonLinkStyle = { color: BOTTOM_NAV_TEXT_COLOR };
    // const bottomNavCommonIconStyle = { color: BOTTOM_NAV_ICON_COLOR }; // Not currently used but defined for future use
    
    const paceLoaderColor = effectiveTopBarTextColor;

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

    console.log({selectedSchool})

    return (
      <>
        {fetchingSchools && <Pace color={paceLoaderColor} height={5} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }} />}

        {/* DESKTOP TOP NAVBAR (kt_header) */}
        <div
          id="kt_header"
          className="kt-header kt-grid__item kt-grid kt-grid--ver d-none d-lg-flex" 
          style={{
            backgroundColor: effectiveTopBarBgColor,
            alignItems: 'center',
            height: `${topNavbarHeight}px`,
            zIndex: 1002,
            position: 'fixed',
            top: `${gapBetweenNavbars}px`,
            left: `${secondaryNavbarHorizontalMargin}px`,
            right: `${secondaryNavbarHorizontalMargin}px`,
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)',
          }}
        >
          <div style={{ position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)' }}>
            {/* Optional brand icon */}
          </div>
          <div
            className="kt-header-menu-wrapper kt-grid__item"
            id="kt_header_menu_wrapper" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div id="kt_header_menu" className="kt-header-menu kt-header-menu-mobile ">
              <ul className="kt-menu__nav">
                {availableSchools.length > 1 ? (
                  <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                    <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                      <span className="kt-menu__link-text" style={{ ...topNavlinkStyle, fontWeight: '500' }}>{selectedSchool.name || "Select School"}</span>
                      <i className="kt-menu__hor-arrow la la-angle-down" style={topNavIconStyle} />
                      <i className="kt-menu__ver-arrow la la-angle-right" style={topNavIconStyle} />
                    </a>
                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                      <ul className="kt-menu__subnav">
                        {availableSchools.map(schoolItem => (
                          <li key={schoolItem.id} onClick={() => this.switchSchools(schoolItem)} className="kt-menu__item" aria-haspopup="true">
                            <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link">
                              <i className="kt-menu__link-icon" style={topNavIconStyle}> {/* Style applied here for potential icon like la-building */}
                                {schoolItem.logo ? <img src={`${schoolItem.logo}`} style={{ width: '20px', height: 'auto', borderRadius: '50%', aspectRatio: '1/1' }} alt={schoolItem.name}/> : <i className="la la-building" />}
                              </i>
                              <span className="kt-menu__link-text" style={topNavlinkStyle}>{schoolItem.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li className="kt-menu__item" aria-haspopup="false">
                    <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link">
                      {fetchingSchools ? (
                        <div className="kt-spinner kt-spinner--brand kt-spinner--xl kt-spinner--center" />
                      ) : (
                        <span className="kt-menu__link-text" style={{ ...topNavlinkStyle, fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedSchool.name || "Select School"}</span>
                      )}
                    </a>
                  </li>
                )}
                <li className="kt-menu__item" aria-haspopup="false">
                  <Link to="/home" className="kt-menu__link">
                    <span className="kt-menu__link-text" style={topNavlinkStyle}>Reports</span>
                  </Link>
                </li>
                <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                  <a onClick={e => e.preventDefault()} href="#!" className="kt-menu__link kt-menu__toggle">
                    <span className="kt-menu__link-text" style={topNavlinkStyle}>Manage Data</span>
                    <i className="kt-menu__hor-arrow la la-angle-down" style={topNavIconStyle} />
                    <i className="kt-menu__ver-arrow la la-angle-right" style={topNavIconStyle} />
                  </a>
                  <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                    <ul className="kt-menu__subnav">
                      {manageDataItems.map(item => (
                        <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                          <Link to={item.path} className="kt-menu__link">
                            <span className="kt-menu__link-icon kt-menu__link-icon--md" style={{ marginRight: '8px' }}>
                              <item.IconComponent style={{ width: '18px', height: '18px', color: effectiveTopBarIconColor }} />
                            </span>
                            <span className="kt-menu__link-text" style={topNavlinkStyle}>{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                 <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                    <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                        <span className="kt-menu__link-text" style={topNavlinkStyle}>
                        {(selectedSchool && selectedSchool.financial && selectedSchool.financial.balanceFormated) || "N/A"}, Finance
                        </span>
                        <i className="kt-menu__hor-arrow la la-angle-down" style={topNavIconStyle} />
                        <i className="kt-menu__ver-arrow la la-angle-right" style={topNavIconStyle} />
                    </a>
                    <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                        <ul className="kt-menu__subnav">
                        {financeItems.map(item => (
                            <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                            <Link to={item.path} className="kt-menu__link">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot" style={{ color: effectiveTopBarIconColor }}><span /></i>
                                <span className="kt-menu__link-text" style={topNavlinkStyle}>{item.label}</span>
                            </Link>
                            </li>
                        ))}
                        </ul>
                    </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="kt-header__topbar kt-grid__item" style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)' }}>
            <div className="kt-header__topbar-item kt-header__topbar-item--user" id="kt_offcanvas_toolbar_profile_toggler_btn">
              <div className="kt-header__topbar-welcome" style={{ color: effectiveTopBarTextColor }}>Hi,</div>
              <div className="kt-header__topbar-username" style={{ color: effectiveTopBarTextColor, marginLeft: '5px', fontWeight: '500' }}>{user}</div>
              <div className="kt-header__topbar-wrapper" style={{ marginLeft: '10px' }}>
                <img alt="Pic" src={storedUser?.avatar || `https://picsum.photos/30/30?random=${storedUser?.id || 1027}`} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE TOP NAVBAR (kt_header_mobile) */}
        <div
          id="kt_header_mobile"
          className="kt-header-mobile kt-header-mobile--fixed d-lg-none"
          style={{
            backgroundColor: effectiveTopBarBgColor,
            height: `${mobileTopBarHeight}px`,
            top: `${gapBetweenNavbars}px`,
            left: `${secondaryNavbarHorizontalMargin}px`,
            right: `${secondaryNavbarHorizontalMargin}px`,
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)',
            zIndex: 1002, 
          }}
        >
          <div className="kt-header-mobile__toolbar" style={{ paddingLeft: '15px' }}>
            <button className="kt-header-mobile__toolbar-toggler kt-header-mobile__toolbar-toggler--left" id="kt_header_mobile_toggler"><span style={{backgroundColor: effectiveTopBarIconColor}} /></button>
          </div>

          <div className="kt-header-mobile__logo" style={{ flexGrow: 1, textAlign: 'center', overflow: 'hidden', padding: '0 5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedSchool?.name && (
                <span style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', color: effectiveTopBarTextColor }}>
                  {selectedSchool.name}
                </span>
              )}
              {selectedSchool?.name && user !== "Guest" && <span style={{ margin: '0 5px', fontSize: '0.9rem', color: effectiveTopBarTextColor }}>|</span>}
              {user !== "Guest" && (
                <span style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px', color: effectiveTopBarTextColor }}>
                  {user}
                </span>
              )}
               {(!selectedSchool?.name && user === "Guest") && (
                 <span style={{ fontSize: '0.9rem', fontWeight: '500', color: effectiveTopBarTextColor }}>Menu</span>
               )}
            </div>
          </div>

          <div className="kt-header-mobile__toolbar" style={{ paddingRight: '15px' }}>
            <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler">
              <img alt="User" src={storedUser?.avatar || `https://picsum.photos/30/30?random=${storedUser?.id || 1027}`} style={{ width: '30px', height: '30px', borderRadius: '50%' }}/>
            </button>
          </div>
        </div>


        {/* BOTTOM "FLOATING CARD" NAVBAR (kt_header_secondary) - Visible on ALL screen sizes */}
        <div
          id="kt_header_secondary"
          style={{
            backgroundColor: BOTTOM_NAV_BG_COLOR,
            display: 'flex',
            justifyContent: 'space-between', 
            alignItems: 'center',
            height: `${secondaryNavbarEffectiveHeight}px`,
            position: 'fixed',
            top: `${secondaryNavbarTopPosition}px`, 
            left: `${secondaryNavbarHorizontalMargin}px`,
            right: `${secondaryNavbarHorizontalMargin}px`,
            zIndex: 1001, 
            borderRadius: '12px',
            boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
            padding: '0 25px',
          }}
        >
          <div className="kt-header__brand kt-grid__item" style={{ backgroundColor: 'transparent' }}>
            {!selectedSchool || Object.keys(selectedSchool).length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="kt-spinner kt-spinner--sm kt-spinner--brand" />
              </div>
            ) : (
              <Link to="/home">
                <img
                  alt="School Logo"
                  style={{ maxHeight: '40px', width: 'auto', borderRadius: '6px' }}
                  src={selectedSchool.logo || '/assets/media/logos/ic_launcher.png'}
                />
              </Link>
            )}
          </div>
          <div id="kt_bottom_nav_menu_container" className="kt-header-menu-wrapper kt-grid__item" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div className="kt-header-menu"> 
              <ul className="kt-menu__nav">
                <li className="kt-menu__item" aria-haspopup="false">
                  <Link to="/comms" className="kt-menu__link">
                    <span className="kt-menu__link-text" style={bottomNavCommonLinkStyle}>SMS & Email</span>
                  </Link>
                </li>
                <li className="kt-menu__item" aria-haspopup="false">
                  <Link to="/learning" className="kt-menu__link">
                    <span className="kt-menu__link-text" style={bottomNavCommonLinkStyle}>Learning</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* PROFILE PANEL (Common for Desktop & Mobile) */}
         <div
          id="kt_offcanvas_toolbar_profile"
          className="kt-offcanvas-panel"
          style={{
            margin: '15px', borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)', 
            maxHeight: 'calc(100vh - 30px)', 
            width: '300px', 
            overflowY: 'hidden', 
          }}
        >
          <div className="kt-offcanvas-panel__head">
            <h3 className="kt-offcanvas-panel__title">Profile</h3>
            <a href="#!" onClick={e => e.preventDefault()} className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
          </div>
          <div className="kt-offcanvas-panel__body kt-scroll">
            <div className="kt-user-card-v3 kt-margin-b-30">
              <div className="kt-user-card-v3__avatar">
                <img alt="Pic" src={storedUser?.avatar || "https://via.placeholder.com/100x100.png?text=U"} />
              </div>
              <div className="kt-user-card-v3__detalis">
                <a href="#!" onClick={e => e.preventDefault()} className="kt-user-card-v3__name">{storedUser?.names || user}</a>
                <div className="kt-user-card-v3__desc">{storedUser?.userType ? storedUser.userType.charAt(0).toUpperCase() + storedUser.userType.slice(1) : ''}</div>
                <div className="kt-user-card-v3__info">
                  {storedUser?.email && (
                    <a href={`mailto:${storedUser.email}`} className="kt-user-card-v3__item">
                      <i className="flaticon-email-black-circular-button kt-font-brand" />
                      <span className="kt-user-card-v3__tag">{storedUser.email}</span>
                    </a>
                  )}
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      className="btn btn-label-brand btn-sm btn-bold btn-block"
                      type="button"
                      onClick={() => this.props.history.push({ pathname: "/settings/user" })}
                    >Profile Settings</button>

                    {typeof window.matchMedia === 'function' && !window.matchMedia('(display-mode: standalone)').matches &&
                      typeof window.deferredInstallPrompt !== 'undefined' &&
                      (
                        <button
                          className="btn btn-label-success btn-sm btn-bold btn-block"
                          type="button"
                          onClick={this.handleInstallApp}
                        >Install App</button>
                      )
                    }
                    <button
                      className="btn btn-label-danger btn-sm btn-bold btn-block"
                      type="button"
                      onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                    >Log Out</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer Div - Pushes content below the fixed navbars */}
        <div style={{
            height: isMobile ? `${(totalFixedElementsHeight-65)}px` : `${totalFixedElementsHeight - 65}px`
        }} />
      </>
    );
  }
}

export default withRouter(Navbar);