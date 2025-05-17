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
                // Data.schools.unsubscribe(this.handleSchoolUpdate);
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

    

    render() {
        
        return (
            <div id="kt_subheader" className="kt-subheader kt-grid__item">
                <div className="kt-container kt-container--fluid">
                    <div className="kt-subheader__main d-flex justify-content-between">
                        <div className="kt-subheader__title">
                            <div className="kt-subheader__breadcrumbs">
                                {this.renderBreadcrumbs()}
                            </div>
                        </div>
                        <div className="kt-subheader__subtitle">
                            <div className="kt-subheader__low-balance">
                                <button
                                    className="btn btn-primary btn-sm btn-bold btn-upper"
                                    style={{
                                        backgroundColor: "#4CB050",
                                        borderColor: "#4CB050",
                                    }}
                                    onClick={() =>
                                        this.props.history.push({
                                            pathname: "/finance/topup",
                                            search: "?" + new URLSearchParams({ popup: true }).toString(),
                                        })
                                    }
                                >
                                    <i className="la la-mobile" style={{ marginRight: 5 }}></i>{`Balance is < 300, Top Up`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Subheader);