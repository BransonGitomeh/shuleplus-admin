import React from "react";
import { Link } from "react-router-dom";
import app from "../scripts.bundle"

const KTUtil = window.KTUtil
const KTOffcanvas = window.KTOffcanvas

class Navbar extends React.Component {
  componentDidMount() {
    // window.KTLayout.init();
    app.init()

    var profilePanel = KTUtil.get('kt_offcanvas_toolbar_profile');
    var head = KTUtil.find(profilePanel, '.kt-offcanvas-panel__head');
    var body = KTUtil.find(profilePanel, '.kt-offcanvas-panel__body');

    var offcanvas = new KTOffcanvas(profilePanel, {
      overlay: true,
      baseClass: 'kt-offcanvas-panel',
      closeBy: 'kt_offcanvas_toolbar_profile_close',
      toggleBy: 'kt_offcanvas_toolbar_profile_toggler_btn'
    });

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

    var _this = this
    window.fbAsyncInit = function () {
      console.log("env", process.env)
      /*global FB*/
      FB.init({
        appId: "388407632531072",
        cookie: true,
        xfbml: true,
        version: 'v2.7'
      });

      /*global FB*/
      FB.AppEvents.logPageView();

      FB.login(function (response) {
        if (response.authResponse) {
          console.log('Welcome!  Fetching your information.... ');
          /*global FB*/
          FB.api('/me', function (response) {
            console.log(response)
            console.log('Good to see you, ' + response.name + '.');

            // 

            _this.setState({
              social_logged_in: true,
              social_profile_pic: `https://graph.facebook.com/${response.id}/picture?type=normal`,
              social_profile_id: response.id,
              social_name: response.name
            })
          });
        } else {
          alert('User cancelled login or did not fully authorize.');
        }
      });

    };

  }
  state = {
    profileShowing: false,
    userData: JSON.parse(localStorage.getItem("user")),
    buses: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    social_logged_in: false,
    social_profile_pic: "",
    social_name: ""
  };
  render() {
    return (
      <div
        id="kt_header"
        className="kt-header kt-grid__item kt-grid kt-grid--ver  kt-header--fixed "
      >
        {/* begin:: Brand */}
        <div className="kt-header__brand   kt-grid__item" id="kt_header_brand">
          <Link to="/home">
            <img
              alt="Logo"
              style={{ width: 150 }}
              src="/assets/media/logos/logo-v4.png"
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

              <li
                className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                data-ktmenu-submenu-toggle="click"
                aria-haspopup="true"
              >
                <Link to="/home" className="kt-menu__link">
                  <span className="kt-menu__link-text">Our Platform</span>
                </Link>



              </li>

              {/* <li
                className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                data-ktmenu-submenu-toggle="click"
                aria-haspopup="true"
              >
                <Link to="/home" className="kt-menu__link">
                  <span className="kt-menu__link-text">Partner with us</span>
                </Link>
              </li> */}

              {/* <li
                className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                data-ktmenu-submenu-toggle="click"
                aria-haspopup="true"
              >
                <Link to="/home" className="kt-menu__link">
                  <span className="kt-menu__link-text">About us</span>
                </Link>
              </li> */}

              <li
                className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                data-ktmenu-submenu-toggle="click"
                aria-haspopup="true"
              >
                <Link to="/home" className="kt-menu__link">
                  <span className="kt-menu__link-text">Contact Us</span>
                </Link>
              </li>

            </ul>
          </div>
        </div>
        {/* end: Header Menu */} {/* begin:: Header Topbar */}
        {
          !this.state.social_logged_in ?

            <div
              className="kt-header-menu-wrapper kt-grid__item"
              id="kt_header_menu_wrapper"
            >
              <div
                id="kt_header_menu"
                className="kt-header-menu kt-header-menu-mobile "
              >
                <ul className="kt-menu__nav ">
                  <li
                    className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                    data-ktmenu-submenu-toggle="click"
                    aria-haspopup="true"
                  >
                    <Link to="/register" className="kt-menu__link">
                      <span className="kt-menu__link-text">Sign up</span>
                    </Link>
                  </li>
                </ul>

                <ul className="kt-menu__nav ">
                  <li
                    className="kt-menu__item  kt-menu__item--submenu kt-menu__item--rel"
                    data-ktmenu-submenu-toggle="click"
                    aria-haspopup="true"
                  >
                    <Link to="/auth" className="kt-menu__link">
                      <span className="kt-menu__link-text">Sign in</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            : <div className="kt-header__topbar kt-grid__item kt-grid__item--fluid">
              {/*begin: User bar */}
              <div
                className="kt-header__topbar-item kt-header__topbar-item--user"
                id="kt_offcanvas_toolbar_profile_toggler_btn"
              >
                <div className="kt-header__topbar-welcome">Hello,</div>
                <div className="kt-header__topbar-username">{this.state.social_name}</div>
                <div className="kt-header__topbar-wrapper">
                  <img alt="Pic" src={this.state.social_profile_pic} />
                </div>
              </div>
              {/*end: User bar */}
            </div>
        }



        <div id="kt_header_mobile" className="kt-header-mobile  kt-header-mobile--fixed ">
          <div className="kt-header-mobile__logo">
            <Link to="/trips/all">
              <img
                alt="Logo"
                style={{ width: 150, filter: 'invert(100 %)' }}
                src="/assets/media/logos/logo-v4.png"
              />
            </Link>
          </div>
          <div className="kt-header-mobile__toolbar">
            <button className="kt-header-mobile__toolbar-toggler" id="kt_header_mobile_toggler"><span /></button>
            <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more" /></button>
          </div>
        </div>

        {/* {this.state.profileShowing ? <div className="kt-offcanvas-panel-overlay" /> : null} */}

        {/* fancy profile */}

        <div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel">
          <div className="kt-offcanvas-panel__head" kt-hidden-height={89} style={{}}>
            <h3 className="kt-offcanvas-panel__title">
              Profile
          </h3>
            <a href="#" className="kt-offcanvas-panel__close" id="kt_offcanvas_toolbar_profile_close"><i className="flaticon2-delete" /></a>
          </div>
          <div className="kt-offcanvas-panel__body kt-scroll ps ps--active-y" style={{ height: '500px', overflow: 'hidden' }}>
            <div className="kt-user-card-v3 kt-margin-b-30">
              <div className="kt-user-card-v3__avatar">
                <img src="https://placeimg.com/140/140/any" alt="" />
              </div>
              <div className="kt-user-card-v3__detalis">
                <a href="#" className="kt-user-card-v3__name">
                  {/* {this.state.userData[Object.keys(this.state.userData)[0]].user} */}
                </a>
                <div className="kt-user-card-v3__desc">
                  {/* {Object.keys(this.state.userData)[0]} */}
                </div>
                <div className="kt-user-card-v3__info">
                  <a href="#" className="kt-user-card-v3__item">
                    <i className="flaticon-email-black-circular-button kt-font-brand" />
                    <span className="kt-user-card-v3__tag">gathoni@smartkids.com</span>
                  </a>
                  <a href="#" className="kt-user-card-v3__item">
                    <i className="flaticon-twitter-logo-button kt-font-success" />
                    <span className="kt-user-card-v3__tag">@gathoni</span>
                  </a>
                </div>

                <button type="button" className="btn btn-brand btn-elevate btn-pill" >Sign out</button>
              </div>
            </div>
            <div className="ps__rail-x" style={{ left: '0px', bottom: '0px' }}><div className="ps__thumb-x" tabIndex={0} style={{ left: '0px', width: '0px' }} /></div><div className="ps__rail-y" style={{ top: '0px', height: '500px', right: '0px' }}><div className="ps__thumb-y" tabIndex={0} style={{ top: '0px', height: '300px' }} /></div></div>
        </div>
      </div>
    );
  }
}

export default Navbar;
