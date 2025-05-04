import React from "react";
import { Link } from "react-router-dom";

const KTOffcanvasPanel = window.KTOffcanvasPanel
const KTUtil = window.KTUtil
const KTQuickSearch = window.KTQuickSearch

class ProfilePanel extends React.Component {
  componentDidMount() {
    KTOffcanvasPanel.init();

    if (KTUtil.get('kt_quick_search_dropdown')) {
      KTQuickSearch().init(KTUtil.get('kt_quick_search_dropdown'));
    }

    if (KTUtil.get('kt_quick_search_inline')) {
      KTQuickSearch().init(KTUtil.get('kt_quick_search_inline'));
    }

    if (KTUtil.get('kt_quick_search_offcanvas')) {
      KTQuickSearch().init(KTUtil.get('kt_quick_search_offcanvas'));
    }
  }
  render() {
    return (
      < div id="kt_offcanvas_toolbar_profile" className="kt-offcanvas-panel" >
        <div className="kt-offcanvas-panel__head">
          <h3 className="kt-offcanvas-panel__title">Profile</h3>
          <a
            href="#"
            className="kt-offcanvas-panel__close"
            id="kt_offcanvas_toolbar_profile_close"
          >
            <i className="flaticon2-delete" />
          </a>
        </div>
        <div className="kt-offcanvas-panel__body">
          <div className="kt-user-card-v3 kt-margin-b-30">
            <div className="kt-user-card-v3__avatar">
              <img src="./assets/media/users/300_21.jpg" alt="" />
            </div>
            <div className="kt-user-card-v3__detalis">
              <a href="#" className="kt-user-card-v3__name">
                James Jones
              </a>
              <div className="kt-user-card-v3__desc">Application Developer</div>
              <div className="kt-user-card-v3__info">
                <a href="#" className="kt-user-card-v3__item">
                  <i className="flaticon-email-black-circular-button kt-font-brand" />
                  <span className="kt-user-card-v3__tag">jm@softplus.com</span>
                </a>
                <a href="#" className="kt-user-card-v3__item">
                  <i className="flaticon-twitter-logo-button kt-font-success" />
                  <span className="kt-user-card-v3__tag">@jmdev</span>
                </a>
              </div>
            </div>
          </div>
          <div className="kt-offcanvas-panel__section kt-margin-t-50">
            Sales Stats
          </div>
          <div className="kt-widget-1">
            <div className="kt-widget-1__items">
              <div className="kt-widget-1__item">
                <div className="kt-widget-1__item-info">
                  <a href="#">
                    <div className="kt-widget-1__item-title">HTML 5 Templates</div>
                  </a>
                  <div className="kt-widget-1__item-desc">
                    Font-end,Admin &amp; Email
                  </div>
                </div>
                <div className="kt-widget-1__item-stats">
                  <div className="kt-widget-1__item-value">+79%</div>
                  <div className="kt-widget-1__item-progress">
                    <div className="progress">
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ width: "79%" }}
                        aria-valuenow={25}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="kt-widget-1__item">
                <div className="kt-widget-1__item-info">
                  <a href="#">
                    <div className="kt-widget-1__item-title">Wordpress Themes</div>
                  </a>
                  <div className="kt-widget-1__item-desc">
                    eCommerce Website, Plugin
                  </div>
                </div>
                <div className="kt-widget-1__item-stats">
                  <div className="kt-widget-1__item-value">+21%</div>
                  <div className="kt-widget-1__item-progress">
                    <div className="progress">
                      <div
                        className="progress-bar bg-brand"
                        role="progressbar"
                        style={{ width: "60%" }}
                        aria-valuenow={25}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="kt-widget-1__item">
                <div className="kt-widget-1__item-info">
                  <a href="#">
                    <div className="kt-widget-1__item-title">eCommerce Websites</div>
                  </a>
                  <div className="kt-widget-1__item-desc">
                    Shops, Fasion wep sites &amp; atc
                  </div>
                </div>
                <div className="kt-widget-1__item-stats">
                  <div className="kt-widget-1__item-value">-16%</div>
                  <div className="kt-widget-1__item-progress">
                    <div className="progress">
                      <div
                        className="progress-bar  bg-success"
                        role="progressbar"
                        style={{ width: "80%" }}
                        aria-valuenow={25}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="kt-widget-1__item">
                <div className="kt-widget-1__item-info">
                  <a href="#">
                    <div className="kt-widget-1__item-title">UI/UX Design</div>
                  </a>
                  <div className="kt-widget-1__item-desc">
                    Evrything you ever imagine
                  </div>
                </div>
                <div className="kt-widget-1__item-stats">
                  <div className="kt-widget-1__item-value">+4%</div>
                  <div className="kt-widget-1__item-progress">
                    <div className="progress">
                      <div
                        className="progress-bar bg-focus"
                        role="progressbar"
                        style={{ width: "90%" }}
                        aria-valuenow={25}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="kt-offcanvas-panel__section kt-margin-t-50">
            Top Products
          </div>
          <div className="kt-widget-4">
            <div className="kt-widget-4__items">
              <div className="kt-widget-4__item">
                <div className="kt-widget-4__item-content">
                  <div className="kt-widget-4__item-section">
                    <div className="kt-widget-4__item-pic">
                      <img
                        className
                        src="./assets/media/product-logos/logo1.png"
                        alt
                      />
                    </div>
                    <div className="kt-widget-4__item-info">
                      <a href="#">
                        <div className="kt-widget-4__item-username">
                          Circle Desige
                        </div>
                      </a>
                      <div className="kt-widget-4__item-desc">
                        UI/UX, Animation, Design
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kt-widget-4__item-content">
                  <div className="kt-widget-4__item-price">
                    <span className="kt-widget-4__item-badge">$</span>
                    <span className="kt-widget-4__item-number">2,830</span>
                  </div>
                </div>
              </div>
              <div className="kt-widget-4__item">
                <div className="kt-widget-4__item-content">
                  <div className="kt-widget-4__item-section">
                    <div className="kt-widget-4__item-pic">
                      <img
                        className
                        src="./assets/media/product-logos/logo2.png"
                        alt
                      />
                    </div>
                    <div className="kt-widget-4__item-info">
                      <a href="#">
                        <div className="kt-widget-4__item-username">Clip Code</div>
                      </a>
                      <div className="kt-widget-4__item-desc">
                        PHP, NET, Python, Ruby
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kt-widget-4__item-content">
                  <div className="kt-widget-4__item-price">
                    <span className="kt-widget-4__item-badge">$</span>
                    <span className="kt-widget-4__item-number">4,975</span>
                  </div>
                </div>
              </div>
              <div className="kt-widget-4__item">
                <div className="kt-widget-4__item-content">
                  <div className="kt-widget-4__item-section">
                    <div className="kt-widget-4__item-pic">
                      <img
                        className
                        src="./assets/media/product-logos/logo3.png"
                        alt
                      />
                    </div>
                    <div className="kt-widget-4__item-info">
                      <a href="#">
                        <div className="kt-widget-4__item-username">JS-Nijas</div>
                      </a>
                      <div className="kt-widget-4__item-desc">
                        jQuery, AngularJS, Recct
                      </div>
                    </div>
                  </div>
                </div>
                <div className="kt-widget-4__item-content">
                  <div className="kt-widget-4__item-price">
                    <span className="kt-widget-4__item-badge">$</span>
                    <span className="kt-widget-4__item-number">3.594</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="kt-margin-t-40">
            <button
              type="button"
              className="btn btn-brand btn-font-sm btn-upper btn-bold"
            >
              full profile
            </button>
          </div>
        </div>
      </div >
    );
  }
}

export default ProfilePanel;
