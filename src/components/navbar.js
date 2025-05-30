/* eslint-env location */

import React from "react";
import { Link } from "react-router-dom";
import app from "../scripts.bundle" // Assuming this is Metronic's app bundle
import Data from "../utils/data";
import { withRouter } from "react-router";
import Pace from 'react-pace-progress'


const KTUtil = window.KTUtil
const KTOffcanvas = window.KTOffcanvas

// Color Scheme Constants
const TOP_NAV_BG_COLOR = '#f8f9fa'; // Light grey
const TOP_NAV_TEXT_COLOR = '#495057'; // Dark grey text
const TOP_NAV_ICON_COLOR = '#495057';

const BOTTOM_NAV_BG_COLOR = '#ffffff';
const BOTTOM_NAV_TEXT_COLOR = '#212529'; // Standard dark text
const BOTTOM_NAV_ICON_COLOR = '#212529';


// --- SVG Icon Components ---

const SvgSchoolsIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const SvgAdminsIcon = ({ style }) => ( // User with a briefcase (more admin-like)
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <rect x="14" y="10" width="8" height="7" rx="1"></rect> {/* Briefcase */}
    <path d="M18 10V8a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2"></path> {/* Handle */}
  </svg>
);

const SvgInvitationsIcon = ({ style }) => ( // Envelope
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const SvgDriversIcon = ({ style }) => ( // Steering wheel
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8"></circle>
    <circle cx="12" cy="12" r="2"></circle>
    <line x1="12" y1="4" x2="12" y2="8"></line>
    <line x1="12" y1="16" x2="12" y2="20"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

const SvgBusesIcon = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 15C5 14.4477 5.44772 14 6 14H18C18.5523 14 19 14.4477 19 15V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V15Z"></path>
    <path d="M5 14V9C5 7.34315 6.34315 6 8 6H16C17.6569 6 19 7.34315 19 9V14"></path>
    <path d="M2 19H5"></path> <path d="M19 19H22"></path>
    <path d="M6 10H10"></path> <path d="M14 10H18"></path>
    <circle cx="7.5" cy="17.5" r="1.5"></circle> <circle cx="16.5" cy="17.5" r="1.5"></circle>
  </svg>
);

const SvgRoutesIcon = ({ style }) => ( // Map pin
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const SvgSchedulesIcon = ({ style }) => ( // Calendar
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const SvgClassesIcon = ({ style }) => ( // Book
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const SvgTeachersIcon = ({ style }) => ( // Address card style
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <circle cx="8" cy="10" r="2"></circle>
    <line x1="13" y1="8" x2="18" y2="8"></line>
    <line x1="13" y1="12" x2="18" y2="12"></line>
    <line x1="6" y1="16" x2="18" y2="16"></line>
  </svg>
);

const SvgStudentsIcon = ({ style }) => ( // Graduation cap
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10l-10-5-10 5 4 2v6h12v-6l4-2z"></path>
    <path d="M6 12v6"></path>
    <path d="M12 14v7"></path> {/* Tassel main line */}
    <path d="M12 21h-1"></path> {/* Tassel knot/end */}
  </svg>
);

const SvgParentsIcon = ({ style }) => ( // Group of users
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const SvgSettingsIcon = ({ style }) => ( // Cog/Gear
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

// --- End SVG Icon Components ---

const DEFAULT_TOP_NAV_BG_COLOR = '#FFFFFF';
const DEFAULT_TOP_NAV_TEXT_COLOR = '#212529';
const DEFAULT_TOP_NAV_ICON_COLOR = '#212529';


class Navbar extends React.Component {
  componentDidMount() {
    const userData = JSON.parse(localStorage.getItem("user"))

    const schools = Data.schools.list();
    const school = Data.schools.getSelected();

    this.setState({ schools, school });

    Data.schools.subscribe(({ schools }) => {
      this.setState({
        selectedSchool: schools.length > 0 ? schools[0] : {},
        availableSchools: schools
      }, () => {
        const currentSelectedSchool = Data.schools.getSelected();
        if (currentSelectedSchool) {
          localStorage.setItem("school", currentSelectedSchool.id)
          document.title = `${currentSelectedSchool.name} | Shule Plus`;
          this.setState({ selectedSchool: schools.find(s => s.id === currentSelectedSchool.id) || (schools.length > 0 ? schools[0] : {}) });
        }
      });
    });

    let role = "";
    if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
      role = Object.keys(userData)[0];
    }
    this.setState({ selectedSchool: school, userRole: role });

    app.init();

    var profilePanel = KTUtil.get('kt_offcanvas_toolbar_profile');
    if (profilePanel) {
      var head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
      var body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');

      new KTOffcanvas(profilePanel, {
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
            var panelClientHeight = profilePanel.clientHeight;
            var currentHeight = panelClientHeight;
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
    this.setState({ selectedSchool: newSchool });
    localStorage.setItem("school", newSchool.id);
    window.location.reload();
  }

  state = {
    selectedSchool: {},
    availableSchools: Data.schools.list(),
    userRole: "",
    // Navbar dimensions - these are now the source of truth
    topNavbarHeight: 80,
    secondaryNavbarEffectiveHeight: 70,
    gapBetweenNavbars: 15, // This is the gap between navbars AND the top margin for the first navbar
    secondaryNavbarHorizontalMargin: 25,
  };

  render() {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    let user = storedUser.names || "Guest";

    const {
        selectedSchool,
        availableSchools,
        fetchingSchools,
        topNavbarHeight,
        secondaryNavbarEffectiveHeight,
        gapBetweenNavbars,
        secondaryNavbarHorizontalMargin
    } = this.state;

    // --- Dynamic Theming for Top Navbar ---
    const useSchoolTheme = selectedSchool && selectedSchool.theme_color;
    const topNavbarActualBgColor = useSchoolTheme ? selectedSchool.theme_color : DEFAULT_TOP_NAV_BG_COLOR;
    // If school theme is used, text is white. Otherwise, use default text color.
    const topNavEffectiveTextColor = useSchoolTheme ? '#FFFFFF' : DEFAULT_TOP_NAV_TEXT_COLOR;
    const topNavEffectiveIconColor = useSchoolTheme ? '#FFFFFF' : DEFAULT_TOP_NAV_ICON_COLOR;

    const topNavlinkStyle = { color: topNavEffectiveTextColor };
    const topNavIconStyle = { color: topNavEffectiveIconColor };
    // --- End Dynamic Theming ---

    const secondaryNavbarTopPosition = gapBetweenNavbars + topNavbarHeight + gapBetweenNavbars;
    const totalFixedElementsHeight = secondaryNavbarTopPosition + secondaryNavbarEffectiveHeight;

    // Bottom nav styles are assumed to be fixed as per original constants
    const bottomNavCommonLinkStyle = { color: BOTTOM_NAV_TEXT_COLOR };
    const bottomNavCommonIconStyle = { color: BOTTOM_NAV_ICON_COLOR };

    // Pace loader color: Use the effective text color of the top nav.
    // Consider if theme_color itself would be better if it's always contrasting.
    const paceLoaderColor = topNavEffectiveTextColor;


    return (
      <>
        {availableSchools.length === 0 && <Pace color={paceLoaderColor} height={5} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1031 }} />} {/* Increased zIndex for Pace */}
        {/* TOP NAVBAR */}
        <div
          id="kt_header"
          className="kt-header kt-grid__item kt-grid kt-grid--ver"
          style={{
            backgroundColor: topNavbarActualBgColor, // Themed BG
            display: 'flex',
            alignItems: 'center',
            height: `${topNavbarHeight}px`,
            zIndex: 102,
            position: 'fixed',
            top: `${gapBetweenNavbars}px`,
            left: `${secondaryNavbarHorizontalMargin}px`,
            right: `${secondaryNavbarHorizontalMargin}px`,
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.07)',
          }}
        >
          <div style={{ position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)' }}>
            {/* Optional: Small brand icon or text if desired */}
          </div>

          <div
            className="kt-header-menu-wrapper kt-grid__item"
            id="kt_header_menu_wrapper"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div id="kt_header_menu" className="kt-header-menu kt-header-menu-mobile"> {/* KTMenu initializes based on this ID or class */}
              <ul className="kt-menu__nav">
                {fetchingSchools ? (
                  <li className="kt-menu__item kt-menu__item--active" aria-haspopup="false">
                    <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link">
                      <span className="kt-menu__link-text" style={{ ...topNavlinkStyle, fontSize: '1.2rem', fontWeight: 'bold' }}>Fetching...</span>
                    </a>
                  </li>
                ) : (
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
                              <i className="kt-menu__link-icon" style={topNavIconStyle}>
                                {schoolItem.logo ? <img src={`${schoolItem.logo}`} style={{ width: '20px', height: 'auto', borderRadius: '50%', aspectRatio: '1/1' }} alt={schoolItem.name}/> : <i className="la la-building" />}
                              </i>
                              <span className="kt-menu__link-text" style={topNavlinkStyle}>{schoolItem.name}</span>
                            </a>
                          </li>
                        ))}
                        {availableSchools.length === 0 && (
                          <li className="kt-menu__item kt-menu__item--active" aria-haspopup="false">
                            <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link">
                              <span className="kt-menu__link-text" style={{ ...topNavlinkStyle, fontSize: '1rem' }}>No schools available</span>
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </li>
                )}
                <li className="kt-menu__item" aria-haspopup="false">
                  <Link to="/home" className="kt-menu__link">
                    <span className="kt-menu__link-text" style={topNavlinkStyle}>Reports</span>
                  </Link>
                </li>
                <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                  <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                    <span className="kt-menu__link-text" style={topNavlinkStyle}>Manage Data</span>
                    <i className="kt-menu__hor-arrow la la-angle-down" style={topNavIconStyle} />
                    <i className="kt-menu__ver-arrow la la-angle-right" style={topNavIconStyle} />
                  </a>
                  <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                    <ul className="kt-menu__subnav">
                      {[
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
                      ].map(item => (
                        <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                          <Link to={item.path} className="kt-menu__link">
                            <span className="kt-menu__link-icon kt-menu__link-icon--md" style={{ marginRight: '8px' }}>
                              <item.IconComponent style={{ width: '18px', height: '18px', color: topNavEffectiveIconColor }} />
                            </span>
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
              <div className="kt-header__topbar-welcome" style={{ color: topNavEffectiveTextColor }}>Hi,</div>
              <div className="kt-header__topbar-username" style={{ color: topNavEffectiveTextColor, marginLeft: '5px', fontWeight: '500' }}>{user}</div>
              <div className="kt-header__topbar-wrapper" style={{ marginLeft: '10px' }}>
                <img alt="Pic" src={`https://picsum.photos/30/30?random=${storedUser?.id || 1027}`} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div id="kt_header_mobile" className="kt-header-mobile kt-header-mobile--fixed"
            // style={{ top: `${gapBetweenNavbars}px` }} // Uncomment if mobile header also needs top gap
        >
           <div className="kt-header-mobile__logo" style={{ flexGrow: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedSchool?.name && (
                <span style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', color: DEFAULT_TOP_NAV_TEXT_COLOR /* Or a mobile-specific color */ }}>
                  {selectedSchool.name}
                </span>
              )}
              {selectedSchool?.name && user !== "Guest" && <span style={{ margin: '0 5px', fontSize: '0.9rem', color: DEFAULT_TOP_NAV_TEXT_COLOR }}>|</span>}
              {user !== "Guest" && (
                <span style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px', color: DEFAULT_TOP_NAV_TEXT_COLOR }}>
                  {user}
                </span>
              )}
            </div>
          </div>
          <div className="kt-header-mobile__toolbar">
            <button className="kt-header-mobile__toolbar-toggler kt-header-mobile__toolbar-toggler--left" id="kt_header_mobile_toggler"><span /></button>
            <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" style={{ color: DEFAULT_TOP_NAV_ICON_COLOR /* Or mobile specific */ }} /></button>
          </div>
        </div>


        {/* BOTTOM "FLOATING CARD" NAVBAR */}
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
            zIndex: 101,
            borderRadius: '12px',
            boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
            padding: '0 25px',
          }}
        >
            <div className="kt-header__brand kt-grid__item" style={{ backgroundColor: 'transparent' }}>
            <Link to="/home">
              <img
                alt="School Logo"
                style={{ maxHeight: '40px', width: 'auto', borderRadius: '6px' }}
                src={selectedSchool.logo || '/assets/media/logos/ic_launcher.png'} // Default placeholder
              />
            </Link>
          </div>

          {/* Added ID "kt_bottom_nav_menu_container" here for KTMenu initialization */}
          <div id="kt_bottom_nav_menu_container" className="kt-header-menu-wrapper kt-grid__item" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div className="kt-header-menu"> {/* This div could also be targeted if ID approach is problematic, but ID is more specific */}
              <ul className="kt-menu__nav">
                <li className="kt-menu__item" aria-haspopup="false">
                  <Link to="/comms" className="kt-menu__link">
                    <span className="kt-menu__link-text" style={bottomNavCommonLinkStyle}>SMS & Email</span>
                  </Link>
                </li>
                <li className="kt-menu__item kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                  <a href="#!" onClick={e => e.preventDefault()} className="kt-menu__link kt-menu__toggle">
                    <span className="kt-menu__link-text" style={bottomNavCommonLinkStyle}>
                      {(selectedSchool && selectedSchool.financial && selectedSchool.financial.balanceFormated) || "N/A"}, Finance
                    </span>
                    <i className="kt-menu__hor-arrow la la-angle-down" style={bottomNavCommonIconStyle} />
                    <i className="kt-menu__ver-arrow la la-angle-right" style={bottomNavCommonIconStyle} />
                  </a>
                  <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                    <ul className="kt-menu__subnav">
                      {[
                        { path: "/finance/topup", label: "Mpesa Top Up" },
                        { path: "/finance/charges", label: "Your Charges" },
                      ].map(item => (
                        <li key={item.path} className="kt-menu__item" aria-haspopup="true">
                          <Link to={item.path} className="kt-menu__link">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot" style={{ color: BOTTOM_NAV_ICON_COLOR }}><span /></i>
                            <span className="kt-menu__link-text" style={bottomNavCommonLinkStyle}>{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
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

        {/* PROFILE PANEL (Mobile Drawer) */}
         <div
          id="kt_offcanvas_toolbar_profile"
          className="kt-offcanvas-panel"
          style={{
            margin: '15px', borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)', 
            maxHeight: 'calc(80vh - 30px)', // Make height responsive
            overflowY: 'hidden', // Scroll managed by KTUtil.scrollInit
          }}
        >
          <div className="kt-offcanvas-panel__head">
            <h3 className="kt-offcanvas-panel__title">Profile</h3>
            <a href="#!" onClick={e => e.preventDefault()} className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
          </div>
          <div className="kt-offcanvas-panel__body kt-scroll"> {/* kt-scroll class is important for KTUtil.scrollInit */}
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

        {/* Spacer: Adjusted to remove the -65 magic number, assuming it was for a previous fixed header height */}
        {/* If the -65 was intentional for content overlap or other reasons, it can be restored. */}
        {/* For a clean push, the spacer should be the total height of fixed elements above the content. */}
        <div style={{ height: `${(totalFixedElementsHeight-65)}px` }} />
      </>
    );
  }
}

export default withRouter(Navbar);