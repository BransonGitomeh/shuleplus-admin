import React from "react";
import { withRouter } from "react-router";
import Data from "../utils/data";

const MIN_BALANCE = 300

class Subheader extends React.Component {
  componentDidMount() {
    const userData = JSON.parse(localStorage.getItem("user"))

    // Data.onReady(() => {
    const schools = Data.schools.list();
    const school = Data.schools.getSelected();

    // console.log("before", { schools })
    this.setState({ schools, school });

    Data.schools.subscribe(({ schools }) => {
      this.setState({
        selectedSchool: schools[0],
        availableSchools: schools
      })
    });

  }
  state = {
    profileShowing: false,
    selectedSchool: {},
    availableSchools: Data.schools.list()
  };
  render() {
    return (
      <>
        <div id="kt_subheader" className="kt-subheader kt-grid__item ">
          <div className="kt-container  kt-container--fluid ">
            {/* begin:: Subheader Title */}
            <div className="kt-subheader__title">
              <div className="kt-subheader__breadcrumbs">
                {this.props.links.map(link => {
                  return (
                    <span key={link}>
                      <a
                        href="#"
                        className={
                          "kt-subheader__breadcrumbs-link " +
                          (this.props.links.indexOf(link) === 0
                            ? "kt-subheader__breadcrumbs-link--home"
                            : "")
                        }
                      >
                        {link}
                      </a>
                      {this.props.links.indexOf(link) !==
                        this.props.links.length - 1 ? (
                          <span className="kt-subheader__breadcrumbs-separator" />
                        ) : (
                          ""
                        )}
                      {/* <a href="#" className="kt-subheader__breadcrumbs-link ">
                      List
                    </a> */}
                    </span>
                  );
                })}
              </div>
            </div>
            {/* end:: Subheader Title */} {/* begin:: Sub-header toolbar */}
            {/* <div className="kt-subheader__toolbar">
            <div className="kt-subheader__toolbar-wrapper">
              <a href="#" className="btn btn-default btn-sm btn-bold btn-upper">
                Create
              </a>
              <a href="#" className="btn btn-default btn-sm btn-bold btn-upper">
                Import From Excel
              </a>
            </div>
          </div> */}
            {/* <div className="kt-subheader__toolbar">
            <div className="kt-subheader__toolbar-wrapper">
              
            </div>
          </div> */}
            {/* end:: Sub-header toolbar */}{" "}
          </div>
        </div>


        {this.state.selectedSchool.financial?.balance < MIN_BALANCE ? "" : <div id="kt_subheader" className="kt-subheader kt-grid__item " style={{ backgroundColor: "rgb(130 86 33)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ margin: "0 10px" }} className="kt-subheader__title">
            <div className="kt-subheader__breadcrumbs">
              Your balance is below KSH {MIN_BALANCE}. Top up to avoid service disruption
            </div>
          </div>
          <div className="kt-subheader__toolbar">
            <div className="kt-subheader__toolbar-wrapper">
              <button className="btn btn-primary btn-sm btn-bold btn-upper" style={{ backgroundColor: "#4CB050", borderColor: "#4CB050", float: "right", margin: "0 10px" }} onClick={() => this.props.history.push({
                pathname: "/finance/topup",
                search: "?" + new URLSearchParams({ popup: true }).toString()
              })}><i className="la la-mobile" style={{ marginRight: 5 }}></i>Mpesa Top Up</button>
            </div>
          </div>
        </div>}
      </>
    );
  }
}

export default withRouter(Subheader);
