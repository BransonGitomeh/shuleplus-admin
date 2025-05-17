import React from "react";
import { withRouter } from "react-router";
import Data from "../utils/data";

const MIN_BALANCE = 300;

class Subheader extends React.Component {
    constructor(props) {
        super(props);
        const initialSchools = Data.schools.list() || [];
        // Ensure getSelected is called after list if it depends on it, or handle undefined
        let initialSelectedSchool = Data.schools.getSelected();
        if (!initialSelectedSchool && initialSchools.length > 0) {
            initialSelectedSchool = initialSchools[0];
        } else if (!initialSelectedSchool) {
            initialSelectedSchool = {}; // Default to empty object if no schools
        }


        this.state = {
            selectedSchool: initialSelectedSchool,
            availableSchools: initialSchools,
        };
        this.schoolUpdateSubscription = null;
    }

    componentDidMount() {
        this.loadInitialData(); // Load initial data first
        this.subscribeToSchoolUpdates(); // Then subscribe
    }

    // componentWillUnmount() {
    //     if (this.schoolUpdateSubscription) {
    //         // Assuming Data.schools.subscribe returns an unsubscribe function
    //         this.schoolUpdateSubscription();
    //     }
    // }

    loadInitialData = () => {
        const schools = Data.schools.list() || [];
        const selectedSchoolIdFromStorage = localStorage.getItem("school");
        let school = Data.schools.getSelected(); // Try to get from Data service first

        if (!school || !school.id) { // If not found or invalid from Data.schools.getSelected()
            if (selectedSchoolIdFromStorage) {
                school = schools.find(s => String(s.id) === String(selectedSchoolIdFromStorage));
            }
            if (!school || !school.id) { // If still not found, or not in storage, pick first
                 school = schools.length > 0 ? schools[0] : {};
            }
        }
        
        this.setState({
            availableSchools: schools,
            selectedSchool: school,
        });
    };

    handleSchoolUpdate = ({ schools: updatedSchoolsList }) => { // Destructure and rename for clarity
        const currentSelectedSchoolId = this.state.selectedSchool?.id || localStorage.getItem("school");
        let newSelectedSchool = updatedSchoolsList.find(s => String(s.id) === String(currentSelectedSchoolId));

        if (!newSelectedSchool && updatedSchoolsList.length > 0) {
            newSelectedSchool = updatedSchoolsList[0]; // Fallback to first school if current selection disappears
        } else if (!newSelectedSchool) {
            newSelectedSchool = {}; // Fallback to empty object
        }

        this.setState({
            availableSchools: updatedSchoolsList || [],
            selectedSchool: newSelectedSchool,
        });
    };

    subscribeToSchoolUpdates = () => {
        this.schoolUpdateSubscription = Data.schools.subscribe(this.handleSchoolUpdate);
    };

    renderBreadcrumbs = () => {
        const { links } = this.props;
        if (!links || !Array.isArray(links) || links.length === 0) {
            // Return a non-breaking space or an empty span to maintain structure if needed, or null
            return <span className="kt-subheader__separator kt-subheader__separator--v"></span>;
        }

        const [firstLink, ...remainingLinks] = links;

        return (
            <>
                {firstLink && (
                    <span className="kt-subheader__breadcrumbs-link kt-subheader__breadcrumbs-link--home">
                        <a className="kt-link kt-link--white">{firstLink}</a>
                    </span>
                )}
                {remainingLinks.map((link, index) => (
                    link && (
                        <React.Fragment key={`${link}-${index}`}>
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

    renderTopUpSection = () => {
        const { selectedSchool } = this.state;
        const balance = selectedSchool?.financial?.balance; // raw numerical balance
        const balanceFormated = selectedSchool?.financial?.balanceFormated; // "KES X.XX"

        if (balance === undefined && !balanceFormated) { // Still loading or no financial data
            return (
                <button
                    className="btn btn-secondary btn-sm btn-bold btn-upper"
                    disabled
                    style={{cursor: 'default'}}
                >
                    Checking Balance...
                </button>
            );
        }

        const isLowBalance = typeof balance === 'number' && balance < MIN_BALANCE;

        if (isLowBalance) {
            return (
                <button
                    className="btn btn-secondary btn-sm btn-bold btn-upper"
                    disabled
                    style={{cursor: 'default'}}
                    onClick={() =>
                        this.props.history.push({
                            pathname: "/finance/topup",
                            search: "?" + new URLSearchParams({ popup: true }).toString(),
                        })
                    }
                >
                    {/* Text as per screenshot, MIN_BALANCE makes it dynamic if that value changes */}
                    {`BALANCE IS < ${MIN_BALANCE}, TOP UP`}
                </button>
            );
        } else {
            // Display current balance if not low
            return (
                 <div className="kt-subheader__balance-display" style={{color: 'white', fontSize: '0.9rem', fontWeight: '500'}}>
                    <span className="kt-link kt-link--white">
                        Balance: {balanceFormated || (typeof balance === 'number' ? `KES ${balance.toFixed(2)}` : 'N/A')}
                    </span>
                 </div>
            );
        }
    }

    render() {
        return (
            <div id="kt_subheader" className="kt-subheader kt-grid__item">
                <div className="kt-container kt-container--fluid">
                    {/* Added align-items-center for vertical alignment */}
                    <div className="kt-subheader__main d-flex justify-content-between align-items-center">
                        <div className="kt-subheader__title">
                            <div className="kt-subheader__breadcrumbs">
                                {this.renderBreadcrumbs()}
                            </div>
                        </div>
                        <div className="kt-subheader__toolbar"> {/* Changed class to kt-subheader__toolbar for semantic correctness (actions/buttons) */}
                            {/* Kept kt-subheader__low-balance if it has specific styling, otherwise it can be removed */}
                            <div className="kt-subheader__low-balance"> 
                                {this.renderTopUpSection()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Subheader);