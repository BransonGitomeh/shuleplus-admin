import React from "react";
import './login.css'
import { Link } from "react-router-dom";
import axios from "axios"
import { API } from "../../utils/requests"
import Data from "../../utils/data"

const $ = window.$;

class Register extends React.Component {
    state = {
        name: "",
        phone: "",
        email: "",
        address: ""
    }
    componentDidMount() {
        const _this = this;
        this.validator = $("#login").validate({
            errorClass: "invalid-feedback",
            errorElement: "div",

            highlight: function (element) {
                $(element).addClass("is-invalid");
            },

            unhighlight: function (element) {
                $(element).removeClass("is-invalid");
            },

            async submitHandler(form, event) {
                event.preventDefault();
                try {
                    const { name, phone, email, address } = _this.state
                    const res = await axios.post(`${API}/auth/register`, {
                        name, phone, email, address
                    })

                    const { data: { token, data } } = res

                    localStorage.setItem("authorization", token)
                    localStorage.setItem("user", JSON.stringify(data))

                    Data.init()

                    return _this.props.history.push({
                        pathname: '/trips/all'
                    })
                } catch (err) {
                    console.log({ err })
                    if (!err.response && !err.response.data)
                        _this.setState({ error: err.message })

                    _this.setState({ error: err.response.data.message })
                }
            }
        });
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
                            <div className="kt-login-v2__body">
                                {/*begin::Wrapper*/}
                                <div className="kt-login-v2__wrapper">
                                    <div className="kt-login-v2__container" style={{ "marginTop": "5vh" }}>
                                        <div className="kt-login-v2__title">
                                            {/* <h2>Welcome to Shule Plus!</h2> */}
                                            <h3>Tell us a few details about your school below</h3>
                                            <h4>we'll get in touch</h4>
                                        </div>

                                        {/*begin::Form*/}
                                        <form id="login" className="kt-login-v2__form kt-form" action="true" autoComplete="off">
                                            {this.state.error ? <div className="alert alert-danger">
                                                <div className="alert-text">{this.state.error}</div>
                                            </div> : null}
                                            <div className="form-group">
                                                <input onChange={(e) => this.setState({ name: e.target.value })} className="form-control" type="text" placeholder="Your name" name="name" autoComplete="off" required={true} />
                                            </div>
                                            <div className="form-group">
                                                <input onChange={(e) => this.setState({ name: e.target.value })} className="form-control" type="text" placeholder="Official school name" name="username" autoComplete="off" required={true} />
                                            </div>
                                            <div className="form-group">
                                                <input onChange={(e) => this.setState({ phone: e.target.value })} className="form-control" type="text" placeholder="Your Phone Number ie 07XXXXXXXX" name="username" autoComplete="off" required={true} />
                                            </div>
                                            <div className="form-group">
                                                <input onChange={(e) => this.setState({ email: e.target.value })} className="form-control" type="text" placeholder="Your Official Email ie mail@domain.com" name="username" autoComplete="off" required={true} />
                                            </div>
                                            <div className="form-group">
                                                <input onChange={(e) => this.setState({ address: e.target.value })} className="form-control" type="text" placeholder="Schools' Address ie PO Box 1234-00000 Someplace somewhere" name="username" autoComplete="off" required={true} />
                                            </div>
                                            {/*begin::Action*/}

                                            <div className="kt-login-v2__actions">
                                                <button type="submit" className="btn btn-brand btn-elevate btn-pill" >Sign me up!</button>
                                            </div>
                                            {/*end::Action*/}
                                        </form>
                                        {/*end::Form*/}
                                        {/*begin::Options*/}
                                        {/*end::Options*/}
                                    </div>
                                </div>
                                {/*end::Wrapper*/}
                            </div>
                            {/*begin::Body*/}
                        </div>
                        {/*end::Item*/}

                    </div>	</div>
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

export default Register;
