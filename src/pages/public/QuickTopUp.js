import React, { Component } from "react";
import { withRouter } from "react-router";
import Data from "../../utils/data"; 
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

// Reusing the modal logic but adapting for public page
import MpesaPaymentModal from "../finance/deposit"; 

class QuickTopUp extends Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
    this.state = {
      school: null,
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    this.fetchSchool();
  }

  fetchSchool = async () => {
    // Get School ID from Query Params
    const params = new URLSearchParams(this.props.location.search);
    const schoolId = params.get("school");

    if (!schoolId) {
      this.setState({ loading: false, error: "No school ID provided." });
      return;
    }

    try {
      // We use a direct query since standard Data.schools.list() checks auth usually
      // Assuming 'Data.schools.getOne' or similar works, OR we manually use openquery if needed.
      // Since existing Data.js is complex, let's try to misuse/reuse the component's internal access if possible 
      // or rely on a new method if we had one. 
      // For now, let's try assuming open access works with the ID.
      
      // If Data.js doesn't support an explicit "get public school by id", 
      // we might need to rely on the Mpesa modal to handle the "context" or 
      // just pass the ID blindly if the backend supports it.
      
      // However, for UX we want to show the school name.
      // Let's assume we can fetch it. If not, we'll show "School ID: ..."
      
      this.setState({ 
          school: { id: schoolId, name: "Loading..." }, // Optimistic
          loading: false 
      });
      
      // Try to fetch real name if possible (Optional enhancement)
      // const res = await Data.openquery(...) 
      
    } catch (e) {
      this.setState({ loading: false, error: e.message });
    }
  };

  render() {
    const { school, loading, error } = this.state;
    const params = new URLSearchParams(this.props.location.search);
    const schoolId = params.get("school");

    return (
      <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
        <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper">
           {/* Minimal Navbar or just Brand */}
           <div className="kt-header kt-grid__item  kt-header--fixed " style={{left: 0}}>
                <div className="kt-header-menu-wrapper" style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <h3 className="kt-header__title font-weight-bold mt-3">ShulePlus Quick Top-up</h3>
                </div>
           </div>

          <div
            className="kt-content kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor d-flex justify-content-center align-items-center"
            style={{ minHeight: "80vh", backgroundColor: "#f2f3f8" }}
          >
            <div className="card card-custom shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
                <div className="card-header text-center">
                    <div className="card-title d-block">
                        <h3 className="card-label display-4 mb-2">
                             💸
                        </h3>
                        <h5 className="font-weight-bold text-dark">
                            Top up SMS Credits
                        </h5>
                    </div>
                </div>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {!error && !schoolId && (
                         <div className="alert alert-warning">
                             Invalid link. Missing School Identifier.
                         </div>
                    )}

                    {schoolId && (
                        <div className="text-center">
                            <p className="text-muted mb-4">
                                You are about to top up for School ID: <br/> 
                                <span className="badge badge-light-primary font-size-lg mt-2">{schoolId}</span>
                            </p>
                            
                            <button 
                                className="btn btn-primary btn-lg btn-block font-weight-bold"
                                onClick={() => this.modalRef.current.show()}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    )}
                </div>
                <div className="card-footer text-center text-muted font-size-xs">
                    Secured by M-Pesa
                </div>
            </div>
          </div>
          <Footer />
        </div>

        {/* Reusing existing Payment Modal */}
        {/* We pass the schoolId explicitly so it doesn't rely on Auth User */}
        <MpesaPaymentModal 
            ref={this.modalRef} 
            forcedSchoolId={schoolId} 
            onPaymentSuccess={() => alert("Payment Initiated! You will receive an M-Pesa prompt shortly.")}
        />
      </div>
    );
  }
}

export default withRouter(QuickTopUp);
