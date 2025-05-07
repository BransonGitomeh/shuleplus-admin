import React from "react";
import { withRouter } from "react-router";
import Data from "../utils/data";

const MIN_BALANCE = 300;

class Subheader extends React.Component {
    constructor(props) {
        super(props);
        // Initialize state directly if Data methods are synchronous and ready
        // Otherwise, initialize with empty/default and populate in componentDidMount
        const initialSchools = Data.schools.list() || [];
        const initialSelectedSchool = Data.schools.getSelected() || (initialSchools.length > 0 ? initialSchools[0] : {});

        this.state = {
            selectedSchool: initialSelectedSchool,
            availableSchools: initialSchools,
            // You might not need profileShowing in Subheader unless it controls something here
        };
        this.schoolUpdateSubscription = null; // To store the unsubscribe function
    }

    componentDidMount() {
        // If Data has an onReady method, use it:
        // Data.onReady(() => {
        //    this.loadInitialData();
        //    this.subscribeToSchoolUpdates();
        // });
        // If Data is always ready or loads synchronously before this:
        this.loadInitialData();
        this.subscribeToSchoolUpdates();
    }

    componentWillUnmount() {
        if (this.schoolUpdateSubscription) {
            // Assuming Data.schools.subscribe returns an unsubscribe function
            // or Data.schools has an unsubscribe method
            // e.g., this.schoolUpdateSubscription();
            // or Data.schools.unsubscribe(this.handleSchoolUpdate);
             if (typeof Data.schools.unsubscribe === 'function') {
                Data.schools.unsubscribe(this.handleSchoolUpdate);
            }
        }
    }

    loadInitialData = () => {
        const schools = Data.schools.list() || [];
        const selectedSchoolId = localStorage.getItem("school"); // Or some other selection logic
        let school = Data.schools.getSelected();

        if (!school || !school.id) { // If getSelected didn't find one or it's invalid
             if (selectedSchoolId) {
                school = schools.find(s => s.id == selectedSchoolId) || (schools.length > 0 ? schools[0] : {});
            } else {
                school = schools.length > 0 ? schools[0] : {};
            }
        }

        this.setState({
            availableSchools: schools,
            selectedSchool: school,
        });
    };

    handleSchoolUpdate = ({ schools }) => { // Renamed for clarity
        const currentSelectedSchoolId = this.state.selectedSchool?.id || localStorage.getItem("school");
        const newSelectedSchool = schools.find(s => s.id == currentSelectedSchoolId) || (schools.length > 0 ? schools[0] : {});

        this.setState({
            availableSchools: schools || [],
            selectedSchool: newSelectedSchool,
        });
    };

    subscribeToSchoolUpdates = () => {
        // Assuming Data.schools.subscribe calls the callback with an object like { schools: [...] }
        this.schoolUpdateSubscription = Data.schools.subscribe(this.handleSchoolUpdate);
    };

    renderBreadcrumbs = () => {
        const { links } = this.props;
        if (!links || !Array.isArray(links) || links.length === 0) {
            return null; // Or a default breadcrumb
        }

        return (
            <>
                <span className="kt-subheader__breadcrumbs-link kt-subheader__breadcrumbs-link--home">
                    <a className="kt-link kt-link--white">Management</a>
                </span>
                {links.map((link, index) => (
                    link && ( // Render only if link is not null/undefined/empty
                        <React.Fragment key={index}>
                            <span className="kt-subheader__breadcrumbs-separator" />
                            <span className="kt-subheader__breadcrumbs-link">
                                <a className="kt-link kt-link--white">{link}</a>
                            </span>
                        </React.Fragment>
                    )
                ))}
            </>
        );
    }

    renderLowBalanceWarning = () => {
        const { selectedSchool } = this.state;
        // Check selectedSchool and financial property before accessing balance
        // if (!selectedSchool || !selectedSchool.financial || selectedSchool.financial.balance >= MIN_BALANCE) {
        //     return null;
        // }

        return (
            <div
                className="kt-subheader__low-balance-warning" // Use a more specific class
                style={{
                    backgroundColor: "rgb(130 86 33)", // Consider SCSS variables for colors
                    color: "white",
                    padding: "10px 0", // Add some padding
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%", // Ensure it takes full width of its container
                }}
            >
                <div style={{ marginLeft: "25px", marginRight: "10px" }} className="kt-subheader__title"> {/* Match subheader padding */}
                    <div className="kt-subheader__breadcrumbs"> {/* Re-use breadcrumbs styling for consistency */}
                        Your balance is below KSH {MIN_BALANCE}.
                    </div>
                </div>
                <div className="kt-subheader__toolbar">
                    <div className="kt-subheader__toolbar-wrapper" style={{ marginRight: "25px" }}> {/* Match subheader padding */}
                        <button
                            className="btn btn-primary btn-sm btn-bold btn-upper"
                            style={{
                                backgroundColor: "#4CB050",
                                borderColor: "#4CB050",
                                // float: "right", // flexbox handles alignment
                            }}
                            onClick={() =>
                                this.props.history.push({
                                    pathname: "/finance/topup",
                                    search: "?" + new URLSearchParams({ popup: true }).toString(),
                                })
                            }
                        >
                            <i className="la la-mobile" style={{ marginRight: 5 }}></i>Top Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const lowBalanceWarning = this.renderLowBalanceWarning();

        return (
            // Use a wrapper div if you need to stack the subheader and the warning
            // Or, if the warning should be part of the subheader itself, place it inside
            <div className="subheader-wrapper"> {/* Optional wrapper */}
                <div id="kt_subheader" className="kt-subheader kt-grid__item">
                    <div className="kt-container kt-container--fluid">
                        {/* Main Subheader Content */}
                        <div className="kt-subheader__main"> {/* Added for potential flex structure */}
                            <div className="kt-subheader__title">
                                <div className="kt-subheader__breadcrumbs">
                                    {this.renderBreadcrumbs()}
                                </div>
                            </div>
                            {/* Toolbar can go here if needed for the main subheader */}
                            {/* <div className="kt-subheader__toolbar"> ... </div> */}
                        </div>

                        {/* Conditionally render the warning below the main content,
                            but still within the kt_container if you want consistent padding */}
                        {/* Or, if it's truly a separate banner, it can be outside kt_container
                            but then you'd manage its full-width styling separately */}
                    </div>
                </div>
                {/* Render the low balance warning. It will be a full-width bar below the main subheader */}
                {lowBalanceWarning}
            </div>
        );
    }
}

export default withRouter(Subheader);