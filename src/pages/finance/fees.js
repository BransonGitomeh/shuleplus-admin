import React, { Component } from "react";
import Data from "../../utils/data";
import Navbar from "../../components/navbar";
import Subheader from "../../components/subheader";
// StatCard removed, using inline

class FeesManagement extends Component {
    // ... state ...
    state = {
        // ... previous state ...
        classes: [],
        terms: [],
        students: [],
        payments: [],
        parents: [],
        
        selectedClass: "",
        selectedTerm: "",
        
        loading: true,
        
        // Modal State
        showPaymentModal: false,
        paymentStudent: null,
        paymentAmount: 0,
        parentPhone: "",
        processingPayment: false,

        // Manual Payment
        showManualPaymentModal: false,
        manualPaymentMethod: "CASH",
        manualPaymentNotes: ""
    };
    
    // ... componentDidMount / Unmount ...
    componentDidMount() {
        this.unsubClasses = Data.classes.subscribe(({ classes }) => this.setState({ classes }));
        this.unsubTerms = Data.terms?.subscribe(({ terms }) => {
            this.setState({ terms });
             if(terms && terms.length) this.setState({ selectedTerm: terms[terms.length-1].id });
        });
        this.unsubStudents = Data.students.subscribe(({ students }) => this.setState({ students }));
        this.unsubParents = Data.parents.subscribe(({ parents }) => this.setState({ parents }));
        if (Data.payments) {
            this.unsubPayments = Data.payments.subscribe(({ payments }) => this.setState({ payments }));
        }
        setTimeout(() => this.setState({ loading: false }), 1000);
    }

    componentWillUnmount() {
        if (this.unsubClasses) this.unsubClasses();
        if (this.unsubTerms) this.unsubTerms();
        if (this.unsubStudents) this.unsubStudents();
        if (this.unsubParents) this.unsubParents();
        if (this.unsubPayments) this.unsubPayments();
    }

    getFeesForClass = (classId) => {
        const cls = this.state.classes.find(c => c.id === classId);
        return cls ? (cls.feeAmount || 0) : 0;
    };

    getStudentBalance = (student) => {
        const { payments, selectedTerm, terms } = this.state;
        const term = terms?.find(t => t.id === selectedTerm);
        const classFee = this.getFeesForClass(student.class?.id || student.class); 
        
        let parentPhone = student.parent?.phone;
        if (!parentPhone && student.parent?.id) {
            // Lookup in parents list if missing from student object
            const parent = this.state.parents.find(p => p.id === student.parent.id);
            if (parent) parentPhone = parent.phone;
        }

        if (!parentPhone) return { expected: classFee, paid: 0, balance: classFee, history: [] };

        let relatedPayments = payments.filter(p => p.phone === parentPhone);
        
        if (term && term.startDate && term.endDate) {
             const start = new Date(term.startDate).getTime();
             const end = new Date(term.endDate).getTime();
             relatedPayments = relatedPayments.filter(p => {
                 const t = new Date(p.transactionDate || p.createdAt).getTime();
                 return t >= start && t <= end;
             });
        }

        const paid = relatedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        
        return {
            expected: classFee,
            paid,
            balance: classFee - paid,
            history: relatedPayments
        };
    };

    openPaymentModal = (student) => {
        const bal = this.getStudentBalance(student);
        const parentPhone = student.parent?.phone || this.state.parents.find(p => p.id === student.parent?.id)?.phone || "";
        this.setState({
            showPaymentModal: true,
            paymentStudent: student,
            paymentAmount: bal.balance > 0 ? bal.balance : 0,
            parentPhone: parentPhone
        });
    };
    
    openManualPaymentModal = (student) => {
        const bal = this.getStudentBalance(student);
        const parentPhone = student.parent?.phone || this.state.parents.find(p => p.id === student.parent?.id)?.phone || "";
        this.setState({
            showManualPaymentModal: true,
            paymentStudent: student,
            paymentAmount: bal.balance > 0 ? bal.balance : 0,
            parentPhone: parentPhone,
            manualPaymentMethod: "CASH",
            manualPaymentNotes: ""
        });
    };

    initiatePayment = async () => {
        const { paymentAmount, parentPhone } = this.state;
        if (!parentPhone) {
            if(window.toastr) window.toastr.error("Parent phone is missing");
            return;
        }
        this.setState({ processingPayment: true });
        try {
            await Data.schools.charge(parentPhone, paymentAmount);
            if(window.toastr) window.toastr.success("STK Push sent! Payment will appear once completed.");
            this.setState({ showPaymentModal: false });
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed: " + (e.message || e));
        } finally {
            this.setState({ processingPayment: false });
        }
    };
    
    recordManualPayment = async () => {
        const { paymentAmount, parentPhone, manualPaymentMethod, manualPaymentNotes, paymentStudent } = this.state;
        if (!parentPhone) {
             if(window.toastr) window.toastr.error("Parent phone is required to link payment.");
             return;
        }
        
        this.setState({ processingPayment: true });
        try {
            await Data.payments.create({
                school: localStorage.getItem('school'),
                phone: parentPhone,
                amount: String(paymentAmount),
                status: 'COMPLETED', // Manual is always completed?
                resultDesc: `Manual Payment (${manualPaymentMethod}) - ${manualPaymentNotes}`,
                metadata: {
                    manual: true,
                    studentId: paymentStudent.id,
                    method: manualPaymentMethod
                }
            });
            
            if(window.toastr) window.toastr.success("Payment recorded!");
            this.setState({ showManualPaymentModal: false });
        } catch (e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to record: " + (e.message || e));
        } finally {
            this.setState({ processingPayment: false });
        }
    };

    render() {
        const { classes, terms, selectedClass, selectedTerm, students } = this.state;
        
        const filteredStudents = selectedClass 
            ? students.filter(s => s.class === selectedClass || s.class?.id === selectedClass)
            : [];

        return (
          <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper" id="kt_wrapper">
              <Navbar />
              <Subheader links={["Finance", "Fees"]} />

              <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" style={{height:"100vh"}} id="kt_content">
                <div className="kt-container  kt-grid__item kt-grid__item--fluid">

                    {/* EXISTING CONTENT START */}
                    <div className="card card-custom">
                        <div className="card-header">
                            <h3 className="card-title">Fees Management</h3>
                        </div>
                        <div className="card-body">
                            {/* FILTERS */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <label>Term (For Payment Filtering)</label>
                                    <select className="form-control" value={selectedTerm} onChange={e => this.setState({ selectedTerm: e.target.value })}>
                                        <option value="">All Time / No Term Filter</option>
                                        {terms && terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label>Class</label>
                                    <select className="form-control" value={selectedClass} onChange={e => this.setState({ selectedClass: e.target.value })}>
                                        <option value="">Select Class...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* TABLE */}
                            {selectedClass && (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Parent Phone</th>
                                                <th>Expected (Term)</th>
                                                <th>Paid (Term)</th>
                                                <th>Balance</th>
                                                <th style={{width: '250px'}}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(student => {
                                                const { expected, paid, balance } = this.getStudentBalance(student);
                                                return (
                                                    <tr key={student.id}>
                                                        <td>{student.names}</td>
                                                        <td>{student.parent?.phone || this.state.parents.find(p => p.id === student.parent?.id)?.phone || "N/A"}</td>
                                                        <td>{expected.toLocaleString()}</td>
                                                        <td className="text-success">{paid.toLocaleString()}</td>
                                                        <td className={balance > 0 ? "text-danger font-weight-bold" : "text-success"}>
                                                            {balance.toLocaleString()}
                                                        </td>
                                                        <td>
                                                            <div className="btn-group">
                                                                <button 
                                                                    className="btn btn-sm btn-primary"
                                                                    disabled={!student.parent?.phone}
                                                                    onClick={() => this.openPaymentModal(student)}
                                                                    title="M-Pesa STK Push"
                                                                >
                                                                    M-Pesa
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => this.openManualPaymentModal(student)}
                                                                    title="Record Cash/Bank Payment"
                                                                >
                                                                    Manual
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filteredStudents.length === 0 && (
                                                <tr><td colSpan="6" className="text-center">No students found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* M-PESA MODAL */}
                        {this.state.showPaymentModal && (
                            <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">M-Pesa Payment: {this.state.paymentStudent?.names}</h5>
                                            <button type="button" className="close" onClick={() => this.setState({ showPaymentModal: false })}>
                                                <span>&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="form-group">
                                                <label>Parent Phone</label>
                                                <input type="text" className="form-control" value={this.state.parentPhone} disabled />
                                            </div>
                                            <div className="form-group">
                                                <label>Amount to Request (KES)</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    value={this.state.paymentAmount} 
                                                    onChange={e => this.setState({ paymentAmount: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-muted small">Sends an STK push. The payment updates automatically upon success.</p>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn btn-secondary" onClick={() => this.setState({ showPaymentModal: false })}>Cancel</button>
                                            <button 
                                                className="btn btn-primary" 
                                                disabled={this.state.processingPayment}
                                                onClick={this.initiatePayment}
                                            >
                                                {this.state.processingPayment ? "Sending..." : "Send Request"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* MANUAL PAYMENT MODAL */}
                        {this.state.showManualPaymentModal && (
                            <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Record Manual Payment</h5>
                                            <button type="button" className="close" onClick={() => this.setState({ showManualPaymentModal: false })}>
                                                <span>&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="form-group">
                                                <label>Method</label>
                                                <select 
                                                    className="form-control" 
                                                    value={this.state.manualPaymentMethod}
                                                    onChange={e => this.setState({ manualPaymentMethod: e.target.value })}
                                                >
                                                    <option value="CASH">Cash</option>
                                                    <option value="BANK">Bank Transfer</option>
                                                    <option value="CHEQUE">Cheque</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Amount (KES)</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    value={this.state.paymentAmount} 
                                                    onChange={e => this.setState({ paymentAmount: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Notes / Reference No.</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={this.state.manualPaymentNotes} 
                                                    onChange={e => this.setState({ manualPaymentNotes: e.target.value })}
                                                    placeholder="e.g. Receipt 1234"
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn btn-secondary" onClick={() => this.setState({ showManualPaymentModal: false })}>Cancel</button>
                                            <button 
                                                className="btn btn-success" 
                                                disabled={this.state.processingPayment}
                                                onClick={this.recordManualPayment}
                                            >
                                                {this.state.processingPayment ? "Saving..." : "Record Payment"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* EXISTING CONTENT END */}

                </div>
              </div>
            </div>
          </div>
        );
    }
}

export default FeesManagement;
