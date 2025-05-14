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
        selectedSchool: schools[0],
        availableSchools: schools
      }, () => {
        // console.log(this.state.selectedSchool.id)
        // console.log("set", { selectedSchool: schools.filter(s => s.id == Data.schools.getSelected().id ? true : false)[0] })
        localStorage.setItem("school", Data.schools.getSelected().id)
        document.title = `${Data.schools.getSelected().name} | Shule Plus`;
        this.setState({ selectedSchool: schools.filter(s => s.id == Data.schools.getSelected().id ? true : false)[0] });
      });
    });

    this.setState({ selectedSchool: school, userRole: Object.keys(userData)[0] });

    // window.KTLayout.init();
    app.init()

    var profilePanel = KTUtil.get('kt_offcanvas_toolbar_profile');
    if (profilePanel) { // Add a check to ensure profilePanel exists
      var head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
      var body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');

      new KTOffcanvas(profilePanel, { // KTOffcanvas instance might not need to be stored if not used elsewhere
        overlay: true,
        baseClass: 'kt-offcanvas-panel',
        closeBy: 'kt_offcanvas_toolbar_profile_close',
        toggleBy: 'kt_offcanvas_toolbar_profile_toggler_btn'
      });

      if (body) { // Add a check for body
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

            height = height - parseInt(KTUtil.css(profilePanel, 'paddingTop'));
            height = height - parseInt(KTUtil.css(profilePanel, 'paddingBottom'));

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
    userRole: "" // Initialize userRole
  };

  async switchSchools(justSelectedSchool) {
    localStorage.setItem("school", justSelectedSchool.id)
    this.setState({ selectedSchool: justSelectedSchool })
    // Data.schools.list(); // This line doesn't seem to do anything with its return value
    window.location.reload();
  }

  render() {
    // Ensure user data exists and is structured as expected before destructuring
    const storedUser = JSON.parse(localStorage.getItem("user"));
    let user = "Guest"; // Default user name
    if (storedUser && typeof storedUser === 'object' && Object.keys(storedUser).length > 0) {
        user = storedUser.names;
    }
    // console.log(this.state) // Avoid excessive console.logs in production
    
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
                className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                data-ktmenu-submenu-toggle="click"
                aria-haspopup="true"
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
                    {/* Data Submenu Items */}
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
                className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                data-ktmenu-submenu-toggle="click"
                aria-haspopup="true"
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
            </ul>
          </div>
        </div>
        {/* end: Header Menu */}

        {/* begin:: Header Topbar */}
        <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
          {/*begin: User bar */}
          <div
            className="kt-header__topbar-item kt-header__topbar-item--user"
            id="kt_offcanvas_toolbar_profile_toggler_btn"
          >
            <div className="kt-header__topbar-welcome">Hi,</div>
            <div className="kt-header__topbar-username">{user}</div>
            <div className="kt-header__topbar-wrapper">
              <img alt="Pic" src="https://picsum.photos/512/512" /> {/* Consider a more permanent placeholder or user-specific avatar */}
            </div>
          </div>
          {/*end: User bar */}
        </div>
        {/* end:: Header Topbar */}

        {/* Mobile Header */}
        <div id="kt_header_mobile" className="kt-header-mobile  kt-header-mobile--fixed ">
          <div className="kt-header-mobile__logo">
            <Link to="/home"> {/* Usually mobile logo links to home/dashboard */}
              <img
                alt="Logo"
                style={{ width: 150, filter: 'invert(100%)' }} /* Invert might not be ideal for all logos */
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
          <div className="kt-offcanvas-panel__head" style={{}}> {/* kt-hidden-height={89} might be handled by KT scripts */}
            <h3 className="kt-offcanvas-panel__title">
              Profile
            </h3>
            <a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
          </div>
          <div className="kt-offcanvas-panel__body kt-scroll"> {/* Removed ps classes, KTUtil.scrollInit handles this */}
            <div className="kt-user-card-v3 kt-margin-b-30">
              <div className="kt-user-card-v3__avatar">
                <img src="https://placeimg.com/140/140/any" alt="" />
              </div>
              <div className="kt-user-card-v3__detalis">
                <a href="#" className="kt-user-card-v3__name"> {/* Consider not making name a link if it goes nowhere */}
                  {user}
                </a>
                <div className="kt-user-card-v3__desc">
                  {/* Role or title can go here e.g., this.state.userRole */}
                </div>
                <div className="kt-user-card-v3__info">
                  {/* Example items - customize as needed */}
                  {/* <a href="#" className="kt-user-card-v3__item">
                    <i className="flaticon-email-black-circular-button kt-font-brand" />
                    <span className="kt-user-card-v3__tag">{user}</span>
                  </a> */}
                  <span className="kt-user-card-v3__tag" style={{paddingRight:10}}>
                    <button
                      className="btn btn-outline-brand btn-sm" // Added btn-sm for consistency
                      type="button"
                      onClick={() => this.props.history.push({
                        pathname: "/settings/user"
                      })}
                    >
                      My User Details
                    </button>
                  </span>
                  <span className="kt-user-card-v3__tag">
                    <button
                      className="btn btn-outline-danger btn-sm" // Added btn-sm and danger color
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login'; // Redirect to login page
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