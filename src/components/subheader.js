import React from "react";
import { withRouter } from "react-router";
import Data from "../utils/data";

const MIN_BALANCE = 100

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
                    <>
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
                    </>
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


        {this.state.selectedSchool.financial?.balance < MIN_BALANCE ? "" : <div id="kt_subheader" className="kt-subheader kt-grid__item " style={{ backgroundColor: "#FA064B", color: "white" }}>
          <div className="kt-container  kt-container--fluid ">
            <div className="kt-subheader__title">
              <div className="kt-subheader__breadcrumbs">
                Your account balance is currently bellow KSH {MIN_BALANCE}, please top up your account to avoid service disruption

                <button onClick={() => this.props.history.push({
                pathname: "/finance/topup",
                search: "?" + new URLSearchParams({ popup: true }).toString()
              })} class="btn btn-success btn-sm btn-bold btn-upper float-right">Top Up Using Mpesa</button>
              </div>
            </div>
          </div>
        </div>}
      </>
    );
  }
}

export default withRouter(Subheader);
