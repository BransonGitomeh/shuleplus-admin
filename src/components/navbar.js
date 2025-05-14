/* eslint-env location */

import React from "react";
import { Link } from "react-router-dom";
import app from "../scripts.bundle"
import Data from "../utils/data";
import { withRouter } from "react-router";
import Pace from 'react-pace-progress'


const KTUtil = window.KTUtil
const KTOffcanvas = window.KTOffcanvas

class Navbar extends React.Component {
  componentDidMount() {
    const userData = JSON.parse(localStorage.getItem("user"))

    // Data.onReady(() => {
    const schools = Data.schools.list();
    const school = Data.schools.getSelected();

    // console.log("before", { schools })
    this.setState({ schools, school });

    Data.schools.subscribe(({ schools }) => {
      this.setState({ updated: true });
      this.setState({
        selectedSchool: schools.length > 0 ? schools[0] : {}, // Ensure schools[0] exists
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

    // Initialize userRole safely
    let role = "";
    if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
        role = Object.keys(userData)[0];
    }
    this.setState({ selectedSchool: school, userRole: role });


    // window.KTLayout.init();
    app.init()

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
            var height = parseInt(KTUtil.getViewPort().height);

            if (head) {
              height = height - parseInt(KTUtil.actualHeight(head));
              height = height - parseInt(KTUtil.css(head, 'marginBottom'));
            }
            if (profilePanel) { // Check profilePanel again inside this function scope
                height = height - parseInt(KTUtil.css(profilePanel, 'paddingTop'));
                height = height - parseInt(KTUtil.css(profilePanel, 'paddingBottom'));
            }
            return height;
          }
        });
      }
    }
  }

  state = {
    profileShowing: false,
    updated: false,
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
    // Placeholder for PWA installation logic
    // You would typically check for a stored `beforeinstallprompt` event and call `prompt()`
    alert("Install App clicked! Implement PWA installation logic here.");
    console.log("Attempting to trigger app installation...");
  }

  render() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    let user = "Guest"; 
    let userEmail = ""; // Or some default email
    
    if (storedUser && typeof storedUser === 'object') {
        user = storedUser.names || "User"; // Fallback if names is not present
        // Assuming the first key in storedUser might contain more details or it's flat
        if (Object.keys(storedUser).length > 0) {
            const userRoleKey = Object.keys(storedUser)[0];
            if (storedUser[userRoleKey] && storedUser[userRoleKey].user && typeof storedUser[userRoleKey].user === 'string') {
                // This was the structure in the original "old" navbar example for user email
                userEmail = storedUser[userRoleKey].user; 
            } else if (storedUser.email) { // Check for a direct email property
                userEmail = storedUser.email;
            }
        }
    }
    
    return (
      <div
        id="kt_header"
        className="kt-header kt-grid__item kt-grid kt-grid--ver  kt-header--fixed "
      >
        {this.state.updated !== true ? <Pace color="#ffffff" height={3}/>: undefined}
        {/* begin:: Brand */}
        <div className="kt-header__brand   kt-grid__item" id="kt_header_brand">
          <Link to="/home">
            <img
              alt="Logo"
              style={{ width: 150 }}
              src="/assets/media/logos/logo-v5.png"
            />
          </Link>
        </div>
        {/* end:: Brand */}

        {/* begin: Header Menu */}
        <div
          className="kt-header-menu-wrapper kt-grid__item"
          id="kt_header_menu_wrapper"
        >
          <div
            id="kt_header_menu"
            className="kt-header-menu kt-header-menu-mobile "
          >
            <ul className="kt-menu__nav ">
              {(this.state.availableSchools.length !== 1 || this.state.userRole === "admin") && this.state.selectedSchool && this.state.selectedSchool.name ? (
                <li className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                  <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                    <span className="kt-menu__link-text">{this.state.selectedSchool.name}</span>
                    <i className="kt-menu__hor-arrow la la-angle-down" />
                    <i className="kt-menu__ver-arrow la la-angle-right" />
                  </a>
                  <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                    <ul className="kt-menu__subnav">
                      {
                        this.state.availableSchools.map(school => (
                          <li key={school.id} onClick={() => this.switchSchools(school)} className="kt-menu__item  kt-menu__item--submenu" data-ktmenu-submenu-toggle="hover" aria-haspopup="true">
                            <a href="javascript:void(0);" className="kt-menu__link">
                              <i className="kt-menu__link-bullet kt-menu__link-bullet--line">
                                <span />
                              </i>
                              <span className="kt-menu__link-text">
                                <span className="kt-menu__link-text">{school.name}</span>
                              </span>
                            </a>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </li>
              ) : ""}

              <li
                className="kt-menu__item" // Removed submenu classes as it's a direct link
                aria-haspopup="false" // No popup
              >
                <Link to="/home" className="kt-menu__link">
                  <span className="kt-menu__link-text">Reports</span>
                </Link>
              </li>

              <li className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel" data-ktmenu-submenu-toggle="click" aria-haspopup="true">
                <a href="javascript:;" className="kt-menu__link kt-menu__toggle">
                  <span className="kt-menu__link-text">Data</span>
                  <i className="kt-menu__hor-arrow la la-angle-down" />
                  <i className="kt-menu__ver-arrow la la-angle-right" />
                </a>
                <div className="kt-menu__submenu kt-menu__submenu--classic kt-menu__submenu--left">
                  <ul className="kt-menu__subnav">
                    {[
                        { path: "/schools", label: "Schools" },
                        { path: "/admins", label: "Admins" },
                        // { path: "/teams", label: "Teams" }, // As per your previous code
                        // { path: "/members", label: "Team Members" }, // As per your previous code
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
              
              {/* Re-added Learning Link */}
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
            <Link to="/home"> 
              <img
                alt="Logo"
                style={{ width: 150, filter: 'invert(100%)' }} 
                src="/assets/media/logos/logo-v6.png"
              />
            </Link>
          </div>
          <div className="kt-header-mobile__toolbar">
            <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler"><span /></button>
            <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" /></button>
          </div>
        </div>

        {/* Profile Panel */}
        <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel">
          <div className="kt-offcanvas-panel__head" >
            <h3 className="kt-offcanvas-panel__title">
              Profile
            </h3>
            <a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
          </div>
          <div className="kt-offcanvas-panel__body kt-scroll"> 
            <div className="kt-user-card-v3 kt-margin-b-30">
              <div className="kt-user-card-v3__avatar">
                <img src={storedUser?.avatar || "https://placeimg.com/140/140/any"} alt="User Avatar" />
              </div>
              <div className="kt-user-card-v3__detalis">
                <a href="#" className="kt-user-card-v3__name">
                  {user}
                </a>
                <div className="kt-user-card-v3__desc">
                  {this.state.userRole ? this.state.userRole.charAt(0).toUpperCase() + this.state.userRole.slice(1) : ''}
                </div>
                <div className="kt-user-card-v3__info">
                  {userEmail && (
                    <a href={`mailto:${userEmail}`} className="kt-user-card-v3__item">
                        <i className="flaticon-email-black-circular-button kt-font-brand" />
                        <span className="kt-user-card-v3__tag">{userEmail}</span>
                    </a>
                  )}
                  {/* <a href="#" className="kt-user-card-v3__item">
                    <i className="flaticon-twitter-logo-button kt-font-success" />
                    <span className="kt-user-card-v3__tag">{user}</span> 
                  </a> */}

                  <span className="kt-user-card-v3__tag" style={{paddingRight:5, marginBottom: '5px'}}>
                    <button
                      className="btn btn-outline-brand btn-sm" 
                      type="button"
                      onClick={() => this.props.history.push({
                        pathname: "/settings/user"
                      })}
                    >
                      My User Details
                    </button>
                  </span>

                  {/* Install App Button */}
                  <span className="kt-user-card-v3__tag" style={{paddingRight:5, marginBottom: '5px'}}>
                    <button
                      className="btn btn-outline-success btn-sm" 
                      type="button"
                      onClick={this.handleInstallApp}
                    >
                      Install App
                    </button>
                  </span>

                  <span className="kt-user-card-v3__tag" style={{marginBottom: '5px'}}>
                    <button
                      className="btn btn-outline-danger btn-sm" 
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login'; 
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