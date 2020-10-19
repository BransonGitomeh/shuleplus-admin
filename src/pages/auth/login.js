import React from "react";
import './login.css'
import { Link } from "react-router-dom";
import axios from "axios"
import { API } from "../../utils/requests"
import Data from "../../utils/data"
import { FacebookLoginButton, MicrosoftLoginButton, GoogleLoginButton, TwitterLoginButton } from "react-social-login-buttons";
import $ from 'jquery'

class Login extends React.Component {
    state = {
        user: "",
        password: "",
        error: undefined
    }
    async FacebookLoginButton() {
        /*global FB*/
        FB.login(function (response) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                /*global FB*/
                FB.api('/me', function (response) {
                    console.log('Good to see you, ' + response.name + '.');
                });
            } else {
                alert('User cancelled login or did not fully authorize.');
            }
        });
    }
    MicrosoftLoginButton() {
        alert("MicrosoftLoginButton")
    }
    GoogleLoginButton() {
        alert("MicrosoftLoginButton")
    }
    TwitterLoginButton() {
        alert("MicrosoftLo`ginButton")
    }
    componentDidMount() {
        window.fbAsyncInit = function () {
            console.log("env", process.env)
            /*global FB*/
            FB.init({
                appId: "388407632531072",
                cookie: true,
                xfbml: true,
                version: 'v3.1'
            });

            /*global FB*/
            FB.AppEvents.logPageView();

        };


        // const _this = this;
        // this.validator = $("#login").validate({
        //     errorClass: "invalid-feedback",
        //     errorElement: "div",

        //     highlight: function (element) {
        //         $(element).addClass("is-invalid");
        //     },

        //     unhighlight: function (element) {
        //         $(element).removeClass("is-invalid");
        //     },

        //     async submitHandler(form, event) {
        //         event.preventDefault();
        //         try {
        //             const { user, password } = _this.state
        //             const res = await axios.post(`${API}/auth/login`, {
        //                 user,
        //                 password,
        //             })

        //             const { data: { token, data } } = res

        //             localStorage.setItem("authorization", token)
        //             localStorage.setItem("user", JSON.stringify(data))

        //             Data.init()

        //             return _this.props.history.push({
        //                 pathname: '/trips/all'
        //             })
        //         } catch (err) {
        //             console.log({ err })
        //             if (!err.response && !err.response.data)
        //                 _this.setState({ error: err.message })

        //             _this.setState({ error: err.response.data.message })
        //         }
        //     }
        // });
    }
    render() {
        return (
            <div>

                {/* begin:: Page */}
                <div className="kt-grid kt-grid--ver kt-grid--root">
                    <div className="kt-grid__item   kt-grid__item--fluid kt-grid  kt-grid kt-grid--hor kt-login-v2" id="kt_login_v2">
                        {/*begin::Item*/}
                        <div className="kt-grid__item  kt-grid  kt-grid--ver  kt-grid__item--fluid">
                            {/*begin::Body*/}
                            <div className="kt-login-v2__body" style={{
                                display: "flex"
                            }}>


                                {/* <div id="container">

                                    <div className="box" id="bluebox">
                                        <FacebookLoginButton onClick={() => alert("Hello")} />
                                    </div>
                                    <div className="box" id="redbox">
                                        <MicrosoftLoginButton onClick={() => alert("Hello")} />
                                    </div>
                                    <div className="box" id="redbox">
                                        <GoogleLoginButton onClick={() => alert("Hello")} />
                                    </div>

                                    <div className="box" id="redbox">
                                        <TwitterLoginButton onClick={() => alert("Hello")} />
                                    </div>

                                </div>; */}
                                <div className="container h-100" style={{ "marginTop": "20vh" }}>
                                    <div className="row h-100 justify-content-center align-items-center">
                                        <form className="col-12">
                                            <div className="form-group">
                                                <FacebookLoginButton onClick={() => this.FacebookLoginButton()} />
                                                {/* <div
                                                    className="fb-login-button"
                                                    data-size="large"
                                                    data-button-type="continue_with"
                                                    data-layout="default"
                                                    data-auto-logout-link="false"
                                                    data-use-continue-as="false"
                                                    data-width
                                                />; */}

                                            </div>
                                            <div className="form-group">
                                                <MicrosoftLoginButton onClick={() => this.MicrosoftLoginButton()} />
                                            </div>

                                            <div className="form-group">
                                                <GoogleLoginButton onClick={() => this.GoogleLoginButton()} />
                                            </div>

                                            <div className="form-group">
                                                <TwitterLoginButton onClick={() => this.TwitterLoginButton()} />
                                            </div>
                                        </form>
                                    </div>
                                </div>;



                                {/*  */}
                            </div>

                            {/*end::Wrapper*/}
                            {/* </div> */}
                            {/*begin::Body*/}
                        </div>
                        {/*end::Item*/}

                    </div>
                    <div className="kt-grid__item   kt-grid__item--fluid kt-grid  kt-grid kt-grid--hor kt-login-v2" id="kt_login_v2">
                        {/*begin::Item*/}
                        <div className="kt-grid__item  kt-grid  kt-grid--ver  kt-grid__item--fluid">
                            {/*begin::Body*/}
                            <div className="kt-login-v2__body">
                                <div className="kt-login-v2__wrapper">
                                    <div className="kt-login-v2__container" style={{ "marginTop": "20vh" }}>
                                        <div className="kt-login-v2__title">
                                            <h3>Sign to Account</h3>
                                        </div>

                                        {/*begin::Form*/}
                                        <form id="login" className="kt-login-v2__form kt-form" action="true" autoComplete="off">
                                            {this.state.error ? <div className="alert alert-danger">
                                                <div className="alert-text">{this.state.error}</div>
                                            </div> : null}

                                            <div className="form-group">
                                                <input onChange={(e) => this.setState({ user: e.target.value })} className="form-control" type="text" placeholder="Username" name="username" autoComplete="off" required={true} />
                                            </div>
                                            <div className="form-group">
                                                <input onChange={(e) => this.setState({ password: e.target.value })} className="form-control" type="password" placeholder="Password" name="password" autoComplete="off" required={true} />
                                            </div>
                                            {/*begin::Action*/}
                                            <div className="kt-login-v2__actions">
                                                <Link to="/recover" className="kt-link kt-link--brand">
                                                    <span className="kt-menu__link-text">Forgot Password ?</span>
                                                </Link>
                                                <button type="submit" className="btn btn-brand btn-elevate btn-pill" >Sign In</button>
                                            </div>

                                            {/*end::Action*/}
                                        </form>
                                        {/*end::Form*/}
                                        {/*begin::Options*/}
                                        {/*end::Options*/}
                                    </div>
                                </div>
                            </div>

                            {/*end::Wrapper*/}
                            {/* </div> */}
                            {/*begin::Body*/}
                        </div>
                        {/*end::Item*/}

                    </div>
                </div>
                {/* end:: Page */}
                {/* begin:: Aside */}
                <div className="kt-aside  kt-aside--fixed " id="kt_aside">
                    <div className="kt-aside__head">
                        <h3 className="kt-aside__title">
                            Dashboard
                </h3>
                        <a href="#" className="kt-aside__close" id="kt_aside_close"><i className="flaticon2-delete" /></a>
                    </div>
                    <div className="kt-aside__body">
                        {/* begin:: Aside Menu */}
                        <div className="kt-aside-menu-wrapper" id="kt_aside_menu_wrapper">
                            <div id="kt_aside_menu" className="kt-aside-menu " data-ktmenu-vertical={1} data-ktmenu-scroll={1}>
                                <ul className="kt-menu__nav ">
                                    <li className="kt-menu__section kt-menu__section--first">
                                        <h4 className="kt-menu__section-text">My Actions</h4>
                                        <i className="kt-menu__section-icon flaticon-more-v2" />
                                    </li><li className="kt-menu__item  kt-menu__item--active" aria-haspopup="true"><a href="#" className="kt-menu__link "><span className="kt-menu__link-text">Vendors To Approve</span></a></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><span className="kt-menu__link-text">Pending Vendors</span></a></li><li className="kt-menu__item  kt-menu__item--submenu" aria-haspopup="true" data-ktmenu-submenu-toggle="hover"><a href="javascript:;" className="kt-menu__link kt-menu__toggle"><span className="kt-menu__link-text">Active Vendors</span><i className="kt-menu__ver-arrow la la-angle-right" /></a><div className="kt-menu__submenu "><span className="kt-menu__arrow" /><ul className="kt-menu__subnav"><li className="kt-menu__item  kt-menu__item--parent" aria-haspopup="true"><span className="kt-menu__link"><span className="kt-menu__link-text">Active Vendors</span></span></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i><span className="kt-menu__link-text">Vendors Dashboard</span></a></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i><span className="kt-menu__link-text">Vendors Revenue</span></a></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i><span className="kt-menu__link-text">Sales Reports</span></a></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i><span className="kt-menu__link-text">Transactions</span></a></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i><span className="kt-menu__link-text">Statements</span></a></li></ul></div></li><li className="kt-menu__section ">
                                        <h4 className="kt-menu__section-text">Vendor Reports</h4>
                                        <i className="kt-menu__section-icon flaticon-more-v2" />
                                    </li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><span className="kt-menu__link-text">Statements</span></a></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><span className="kt-menu__link-text">Transactions</span></a></li><li className="kt-menu__item  kt-menu__item--submenu" aria-haspopup="true" data-ktmenu-submenu-toggle="hover"><a href="javascript:;" className="kt-menu__link kt-menu__toggle"><span className="kt-menu__link-text">Archive</span><i className="kt-menu__ver-arrow la la-angle-right" /></a><div className="kt-menu__submenu "><span className="kt-menu__arrow" /><ul className="kt-menu__subnav"><li className="kt-menu__item  kt-menu__item--parent" aria-haspopup="true"><span className="kt-menu__link"><span className="kt-menu__link-text">Archive</span></span></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i><span className="kt-menu__link-text">Base</span></a></li><li className="kt-menu__item " aria-haspopup="true"><a href="#" className="kt-menu__link "><i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span /></i><span className="kt-menu__link-text">Draggable</span></a></li></ul></div></li><li className="kt-menu__item " aria-haspopup="true"><a href="javascript:;" className="kt-menu__link "><span className="kt-menu__link-text">Invoices</span></a></li>				</ul>
                            </div>
                        </div>
                        {/* end:: Aside Menu */}
                    </div>
                </div>
                {/* end:: Aside */}
            </div>
        );
    }
}

export default Login;
