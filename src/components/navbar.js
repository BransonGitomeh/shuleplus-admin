/* eslint-env location */

import React from "react";
import { Link } from "react-router-dom";
import app from "../scripts.bundle" // Assuming this is Metronic's app bundle
import Data from "../utils/data";
import { withRouter } from "react-router";
import Pace from 'react-pace-progress'


const KTUtil = window.KTUtil
const KTOffcanvas = window.KTOffcanvas

class Navbar extends React.Component {
  componentDidMount() {
    const userData = JSON.parse(localStorage.getItem("user"))

    const schools = Data.schools.list();
    const school = Data.schools.getSelected();

    this.setState({ schools, school });

    Data.schools.subscribe(({ schools }) => {
      // this.setState({ updated: true }); // 1. Removed state update for Pace
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

    app.init(); // Initialize Metronic theme scripts

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
            // 3. Adjusted height calculation for mobile drawer
            var panelClientHeight = profilePanel.clientHeight; // Height of the panel content area (includes padding)
            var currentHeight = panelClientHeight;

            if (head) {
              currentHeight = currentHeight - parseInt(KTUtil.actualHeight(head)); // Subtract head's full height (content + padding + border)
              currentHeight = currentHeight - parseInt(KTUtil.css(head, 'marginBottom')); // Subtract head's bottom margin
            }
            // The body is inside the panel. Its height is panel's clientHeight - head's outerHeight.
            // Panel's own padding is already accounted for in clientHeight.
            return currentHeight;
          }
        });
      }
    }
  }

  state = {
    profileShowing: false,
    // updated: false, // 1. Removed state for Pace
    selectedSchool: {},
    availableSchools: Data.schools.list(),
    userRole: ""
  };

  async switchSchools(justSelectedSchool) {
    localStorage.setItem("school", justSelectedSchool.id)
    this.setState({ selectedSchool: justSelectedSchool })
    window.location.reload();
  }

  handleInstallApp = () => {
    alert("Install App clicked! Implement PWA installation logic here.");
    console.log("Attempting to trigger app installation...");
  }

  render() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    let user = "Guest";
    let userEmail = "";

    if (storedUser && typeof storedUser === 'object') {
        user = storedUser.names || "User";
        if (Object.keys(storedUser).length > 0) {
            const userRoleKey = Object.keys(storedUser)[0];
            if (storedUser[userRoleKey] && storedUser[userRoleKey].user && typeof storedUser[userRoleKey].user === 'string') {
                userEmail = storedUser[userRoleKey].user;
            } else if (storedUser.email) {
                userEmail = storedUser.email;
            }
        }
    }

    return (
      <div
        id="kt_header"
        className="kt-header kt-grid__item kt-grid kt-grid--ver  kt-header--fixed "
        style={{
          backgroundColor: this.state.selectedSchool.themeColor || '#2f2e38',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {/* 1. Removed Pace component */}
        {this.state.availableSchools.length === 0 ? <Pace color="#ffffff" height={3}/>: undefined}

        {/* begin:: Brand */}
        <div
          className="kt-header__brand   kt-grid__item"
          id="kt_header_brand"
          style={{
            backgroundColor: this.state.selectedSchool.themeColor || '#ee9e3dff',
          }}
        >
          <Link to="/home">
            <img
              alt="Logo"
              style={{
                width: 150,
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
              src={this.state.selectedSchool.logo || '/assets/media/logos/logo-v5.png'}
            />
          </Link>
        </div>
        {/* end:: Brand */}

        {/* begin: Header Menu */}
        <div
          className="kt-header-menu-wrapper kt-grid__item"
          id="kt_header_menu_wrapper"
          style={{
            // 3. Style for floating mobile drawer
            margin: '15px', // Margin around the drawer
            borderRadius: '10px', // Rounded edges
            // boxShadow: '0 5px 15px rgba(0,0,0,0.2)', // Floating effect
            height: 'calc(100% - 30px)', // Adjust height to account for top/bottom margins
            // KTOffcanvas will handle width and actual positioning (e.g. right: 0 when open)
            // The margin will then create the space from the edge.
            display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',

            
        }}
        >
          <div
            id="kt_header_menu"
            className="kt-header-menu kt-header-menu-mobile "
            style={{
              paddingLeft: '0px !important',
            }}
            
          >
            <ul className="kt-menu__nav ">
              {!this.state.availableSchools.length && (
                <li className="kt-menu__item  kt-menu__item--active" aria-haspopup="false">
                  <a href="javascript:;" className="kt-menu__link">
                    <span className="kt-menu__link-text" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Fetching...</span>
                  </a>
                </li>
              )}
              {(this.state.availableSchools.length === 1 || this.state.userRole === "admin") && this.state.selectedSchool && this.state.selectedSchool.name ? (
                <li className="kt-menu__item  kt-menu__item--active" aria-haspopup="false">
                  <a href="javascript:;" className="kt-menu__link">
                    <span className="kt-menu__link-text" style={{ fontWeight: 'bold'}}>{this.state.selectedSchool.name}</span>
                  </a>
                </li>
              ) : (
                <li className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                  <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                    <span className="kt-menu__link-text" style={{ fontWeight: 'bold'}}>{this.state.selectedSchool.name}</span>
                    <i className="kt-menu__hor-arrow la la-angle-down" />
                    <i className="kt-menu__ver-arrow la la-angle-right" />
                  </a>
                  <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                    <ul className="kt-menu__subnav">
                      {
                        this.state.availableSchools.map(school => (
                          <li key={school.id} onClick={() => this.switchSchools(school)} className="kt-menu__item  kt-menu__item--submenu" data-ktmenu-submenu-toggle="hover" aria-haspopup="true">
                            <a href="javascript:void(0);" className="kt-menu__link">
                              <i className="kt-menu__link-icon">
                                {school.logo ? (
                                  <img
                                    src={`${school.logo}`}
                                    style={{
                                      width: '25px',
                                      height: 'auto',
                                      borderRadius: '50%',
                                      transition: 'all 0.3s ease',
                                      ':hover': {
                                        transform: 'scale(1.1)',
                                      },
                                    }}
                                  />
                                ) : <i className="la la-building" />}
                              </i>
                              <span className="kt-menu__link-text" style={{ fontWeight: 'bold'}}>{school.name}</span>
                            </a>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </li>
              )}

              <li
                className="kt-menu__item"
                aria-haspopup="false"
              >
                <Link to="/home" className="kt-menu__link">
                  <span className="kt-menu__link-text">Reports</span>
                </Link>
              </li>

              <li className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                  <span className="kt-menu__link-text">Manage Data</span>
                  <i className="kt-menu__hor-arrow la la-angle-down" />
                  <i className="kt-menu__ver-arrow la la-angle-right" />
                </a>
                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                  <ul className="kt-menu__subnav">
                    {[
                        { path: "/schools", label: "Schools", icon: "las la-building" },
                        { path: "/admins", label: "Admins", icon: "las la-user-tie" },
                        { path: "/invitations", label: "Invitations", icon: "las la-envelope" },
                        { path: "/drivers", label: "Drivers", icon: "las la-truck" },
                        { path: "/buses", label: "Buses", icon: "las la-bus" },
                        { path: "/routes", label: "Routes", icon: "las la-route" },
                        { path: "/schedules", label: "Schedules", icon: "las la-calendar" },
                        { path: "/classes", label: "Classes", icon: "las la-book" },
                        { path: "/teachers", label: "Teachers", icon: "las la-address-card" },
                        { path: "/students", label: "Students", icon: "las la-user-graduate" },
                        { path: "/parents", label: "Parents", icon: "las la-users" },
                        // { path: "/teams", label: "Teams", icon: "las la-users" },
                        { path: "/settings/school", label: "School Details", icon: "las la-cog" },
                    ].map(item => (
                        <li key={item.path} className="kt-menu__item  kt-menu__item--submenu" data-ktmenu-submenu-toggle="hover" aria-haspopup="true">
                        <Link to={item.path} className="kt-menu__link">
                            <i className={`kt-menu__link-icon kt-menu__link-icon--lg la ${item.icon}`} />
                            <span className="kt-menu__link-text">
                            <span className="kt-menu__link-text">{item.label}</span>
                            </span>
                        </Link>
                        </li>
                    ))}
                  </ul>
                </div>
              </li>

              <li
                className="kt-menu__item"
                aria-haspopup="false"
              >
                <Link to="/comms" className="kt-menu__link">
                  <span className="kt-menu__link-text">SMS & Email</span>
                </Link>
              </li>

              <li className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                  <span className="kt-menu__link-text">
                    {this.state.selectedSchool?.financial?.balanceFormated || "N/A"}, Finance
                  </span>
                  <i className="kt-menu__hor-arrow la la-angle-down" />
                  <i className="kt-menu__ver-arrow la la-angle-right" />
                </a>
                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                  <ul className="kt-menu__subnav">
                    {[
                        { path: "/finance/topup", label: "Mpesa Top Up" },
                        { path: "/finance/charges", label: "Your Charges" },
                    ].map(item => (
                        <li key={item.path} className="kt-menu__item  kt-menu__item--submenu" data-ktmenu-submenu-toggle="hover" aria-haspopup="true">
                        <Link to={item.path} className="kt-menu__link">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--line">
                            <span />
                            </i>
                            <span className="kt-menu__link-text">
                            <span className="kt-menu__link-text">{item.label}</span>
                            </span>
                        </Link>
                        </li>
                    ))}
                  </ul>
                </div>
              </li>

              <li
                className="kt-menu__item"
                aria-haspopup="false"
              >
                <Link to="/learning" className="kt-menu__link">
                  <span className="kt-menu__link-text">Learning</span>
                </Link>
              </li>

            </ul>
          </div>
        </div>
        {/* end: Header Menu */}

        {/* begin:: Header Topbar */}
        <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
          <div
            className="kt-header__topbar-item kt-header__topbar-item--user"
            id="kt_offcanvas_toolbar_profile_toggler_btn"
          >
            <div className="kt-header__topbar-welcome">Hi,</div>
            <div className="kt-header__topbar-username">{user}</div>
            <div className="kt-header__topbar-wrapper">
              <img alt="Pic" src={storedUser?.avatar || "https://picsum.photos/140/140"} />
            </div>
          </div>
        </div>
        {/* end:: Header Topbar */}

        {/* Mobile Header */}
        <div id="kt_header_mobile" className="kt-header-mobile  kt-header-mobile--fixed ">
          <div className="kt-header-mobile__logo">
          <div style={{ display: 'flex', alignItems: 'center', color: 'white', marginRight: '10px', textAlign: 'right' }}>
                {this.state.selectedSchool?.name && (
                    <span style={{ fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                        {this.state.selectedSchool.name}
                    </span>
                )}
                {this.state.selectedSchool?.name && user !== "Guest" && <span style={{ margin: '0 5px', fontSize: '0.8rem' }}>|</span>}
                {user !== "Guest" && (
                    <span style={{ fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>
                        {user}
                    </span>
                )}
            </div>
          </div>
          <div className="kt-header-mobile__toolbar">
            {/* 2. Mobile nav user and school name */}
            
            <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler"><span /></button>
            <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" /></button>
          </div>
        </div>

        {/* Profile Panel (Mobile Drawer) */}
        <div
            id="kt_offcanvas_toolbar_profile"
            className="kt-offcanvas-panel"
            style={{
                // 3. Style for floating mobile drawer
                margin: '15px', // Margin around the drawer
                borderRadius: '10px', // Rounded edges
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)', // Floating effect
                height: 'calc(40% - 30px)', // Adjust height to account for top/bottom margins
                // KTOffcanvas will handle width and actual positioning (e.g. right: 0 when open)
                // The margin will then create the space from the edge.
            }}
        >
          <div className="kt-offcanvas-panel__head" >
            <h3 className="kt-offcanvas-panel__title">
              Profile
            </h3>
            <a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
          </div>
          <div className="kt-offcanvas-panel__body kt-scroll"> {/* kt-scroll class is important for KTUtil.scrollInit */}
            <div className="kt-user-card-v3 kt-margin-b-30">
              <div className="kt-user-card-v3__avatar">
              <img alt="Pic" src={storedUser?.avatar || "https://picsum.photos/140/140"} />
              </div>
              <div className="kt-user-card-v3__detalis">
                <a href="#" className="kt-user-card-v3__name">
                  {storedUser?.names || user}
                </a>
                <div className="kt-user-card-v3__desc">
                  {storedUser?.userType ? storedUser.userType.charAt(0).toUpperCase() + storedUser.userType.slice(1) : ''}
                </div>
                <div className="kt-user-card-v3__info">
                  {storedUser?.email && (
                    <a href={`mailto:${storedUser.email}`} className="kt-user-card-v3__item">
                        <i className="flaticon-email-black-circular-button kt-font-brand" />
                        <span className="kt-user-card-v3__tag">{storedUser.email}</span>
                    </a>
                  )}
                  <span className="kt-user-card-v3__tag" style={{paddingRight:5, marginBottom: '5px'}}>
                    <button
                      className="btn btn-outline-brand btn-sm"
                      type="button"
                      onClick={() => this.props.history.push({
                        pathname: "/settings/user"
                      })}
                    >
                      Profile
                    </button>
                  </span>
                  {typeof window.matchMedia !== 'function' || !window.matchMedia('(display-mode: standalone)').matches && (
                    <span className="kt-user-card-v3__tag" style={{paddingRight:5, marginBottom: '5px'}}>
                      <button
                        className="btn btn-outline-success btn-sm"
                        type="button"
                        onClick={() => {
                          window.addEventListener("beforeinstallprompt", (e) => {
                            e.prompt();
                            localStorage.setItem('appInstalled', 'yes');
                          });
                        }}
                      >
                        Install App
                      </button>
                    </span>
                  )}
                  <span className="kt-user-card-v3__tag" style={{marginBottom: '5px'}}>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
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

export default withRouter(Navbar);





