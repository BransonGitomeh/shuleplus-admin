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
        manualPaymentNotes: "",

        expandedParent: null,
        sendingSms: false
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
        
        // 1. Identify the parent context
        let parentPhone = student.parent?.phone;
        if (!parentPhone && student.parent?.id) {
            const parent = this.state.parents.find(p => p.id === student.parent.id);
            if (parent) parentPhone = parent.phone;
        }

        if (!parentPhone) return { expected: classFee, paid: 0, balance: classFee, history: [] };

        // 2. Filter payments by THIS student specifically
        // We check for: p.student (actual field), p.student.id (expanded field), or p.metadata.studentId (legacy/custom field)
        let relatedPayments = payments.filter(p => {
            const isParentPayment = p.phone === parentPhone;
            if (!isParentPayment) return false;

            const targetStudentId = student.id;
            const paymentStudentId = p.student?.id || p.student || (p.metadata && p.metadata.studentId);
            
            // If the payment is explicitly linked to a different student, skip it
            if (paymentStudentId && paymentStudentId !== targetStudentId) return false;
            
            // If the payment is unallocated (no student ID) and we are calculating for a specific student,
            // we might want to skip it or eventually have a 'unallocated' bucket. 
            // For now, let's only attribute payments that match the student ID or are completely unlinked 
            // but come from this parent (optional: but that's what caused the double counting).
            // BETTER: only count it if it matches this student.
            return paymentStudentId === targetStudentId;
        });
        
        // 3. Apply Term filtering if active
        if (term && term.startDate && term.endDate) {
             const start = new Date(term.startDate).getTime();
             const end = new Date(term.endDate).getTime();
             relatedPayments = relatedPayments.filter(p => {
                 const t = new Date(p.transactionDate || p.createdAt).getTime();
                 return t >= start && t <= end;
             });
        }

        // 4. Sum up the amounts (handling both amount and ammount for backward compatibility)
        const paid = relatedPayments.reduce((sum, p) => {
            const val = parseFloat(p.amount || p.ammount || 0);
            return sum + val;
        }, 0);
        
        return {
            expected: classFee,
            paid,
            balance: classFee - paid,
            history: relatedPayments
        };
    };

    sendBalanceSms = async (parentData) => {
        const { students, parent } = parentData;
        if (!parent?.phone) return;
        
        this.setState({ sendingSms: true });
        const studentNames = students.map(s => s.names).join(", ");
        const totalBalance = students.reduce((sum, s) => sum + this.getStudentBalance(s).balance, 0);
        
        const msg = `Dear Parent, the current school fee balance for ${studentNames} is KES ${totalBalance.toLocaleString()}. Please clear it soon. Thank you.`;
        
        try {
            await Data.communication.sms.create({
                phone: parent.phone,
                message: msg
            });
            if(window.toastr) window.toastr.success("Balance SMS sent to parent!");
        } catch(e) {
            console.error(e);
            if(window.toastr) window.toastr.error("Failed to send SMS");
        } finally {
            this.setState({ sendingSms: false });
        }
    };

    printStatement = (parentData) => {
        const { students, parent } = parentData;
        const school = Data.schools.getSelected();
        
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
            <head>
                <title>Fee Statement - ${parent.name}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { backgroundColor: #f8f9fa; }
                    .total { text-align: right; font-size: 1.2rem; fontWeight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${school.name}</h2>
                    <p>${school.address || ''}</p>
                    <p>${school.phone} | ${school.email}</p>
                    <h3>FEE STATEMENT</h3>
                </div>
                <div class="details">
                    <div>
                        <p><strong>Parent:</strong> ${parent.name}</p>
                        <p><strong>Phone:</strong> ${parent.phone}</p>
                    </div>
                    <div style="text-align: right">
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Expected</th>
                            <th>Paid</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => {
                            const bal = this.getStudentBalance(s);
                            return `
                                <tr>
                                    <td>${s.names}</td>
                                    <td>${s.class?.name || s.class_name || 'N/A'}</td>
                                    <td>${bal.expected.toLocaleString()}</td>
                                    <td>${bal.paid.toLocaleString()}</td>
                                    <td>${bal.balance.toLocaleString()}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="total">
                    Total Balance: KES ${students.reduce((sum, s) => sum + this.getStudentBalance(s).balance, 0).toLocaleString()}
                </div>
                <p style="margin-top: 50px; text-align: center; color: #888">Generated by ShulePlus</p>
                <script>window.print();</script>
            </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
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
        const { classes, terms, selectedClass, selectedTerm, students, parents, expandedParent, sendingSms } = this.state;
        
        const filteredStudents = selectedClass 
            ? students.filter(s => s.class === selectedClass || s.class?.id === selectedClass)
            : students;

        // Grouping by Parent
        const parentGroups = {};
        filteredStudents.forEach(student => {
            const pId = student.parent?.id || student.parent;
            if (!pId) return;
            if (!parentGroups[pId]) {
                const parentObj = parents.find(p => p.id === pId) || student.parent;
                parentGroups[pId] = { parent: parentObj, students: [] };
            }
            parentGroups[pId].students.push(student);
        });

        const parentList = Object.values(parentGroups);

        return (
          <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper" id="kt_wrapper">
              <Navbar />
              <Subheader links={["Finance", "Fees"]} />

              <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" style={{height:"100vh"}} id="kt_content">
                <div className="kt-container  kt-grid__item kt-grid__item--fluid">

                    <div className="card card-custom">
                        <div className="card-header">
                            <h3 className="card-title">Fees Management (Parent View)</h3>
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
                                    <label>Filter by Class</label>
                                    <select className="form-control" value={selectedClass} onChange={e => this.setState({ selectedClass: e.target.value })}>
                                        <option value="">All Classes</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* PARENT ACCORDION */}
                            <div className="accordion accordion-light accordion-toggle-arrow" id="parentAccordion">
                                {parentList.map(group => {
                                    const isExpanded = expandedParent === group.parent.id;
                                    const totalPaid = group.students.reduce((sum, s) => sum + this.getStudentBalance(s).paid, 0);
                                    const totalBal = group.students.reduce((sum, s) => sum + this.getStudentBalance(s).balance, 0);

                                    return (
                                        <div className="card" key={group.parent.id} style={{ marginBottom: '10px', border: '1px solid #efefef' }}>
                                            <div className="card-header" style={{ padding: '0.5rem 1.25rem' }}>
                                                <div className="card-title d-flex justify-content-between align-items-center w-100" 
                                                     onClick={() => this.setState({ expandedParent: isExpanded ? null : group.parent.id })}
                                                     style={{ cursor: 'pointer' }}>
                                                    <div>
                                                        <span className="font-weight-bold" style={{ fontSize: '1.1rem' }}>{group.parent.name || "Unknown Parent"}</span>
                                                        <span className="text-muted ml-3">{group.parent.phone}</span>
                                                        <span className="badge badge-light-info ml-3">{group.students.length} Student(s)</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-success mr-4">Paid: {totalPaid.toLocaleString()}</span>
                                                        <span className={`font-weight-bolder ${totalBal > 0 ? 'text-danger' : 'text-success'}`}>
                                                            Bal: {totalBal.toLocaleString()}
                                                        </span>
                                                        <i className={`flaticon2-arrow-${isExpanded ? 'up' : 'down'} ml-4`} style={{ fontSize: '0.8rem' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="card-body p-4 bg-light-o-50">
                                                    <div className="row mb-3">
                                                        <div className="col-12 text-right">
                                                            <button 
                                                                className="btn btn-sm btn-light-primary mr-2" 
                                                                onClick={() => this.sendBalanceSms(group)}
                                                                disabled={sendingSms}
                                                            >
                                                                <i className="fa fa-paper-plane mr-2"></i> SMS Balance
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-light-success"
                                                                onClick={() => this.printStatement(group)}
                                                            >
                                                                <i className="fa fa-print mr-2"></i> Print Statement
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <table className="table table-head-bg-brand table-vertical-center">
                                                        <thead>
                                                            <tr className="text-uppercase">
                                                                <th>Student</th>
                                                                <th>Class</th>
                                                                <th>Paid</th>
                                                                <th>Balance</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.students.map(student => {
                                                                const { paid, balance } = this.getStudentBalance(student);
                                                                return (
                                                                    <tr key={student.id}>
                                                                        <td className="font-weight-bold">{student.names}</td>
                                                                        <td>{student.class?.name || student.class_name || 'N/A'}</td>
                                                                        <td className="text-success">{paid.toLocaleString()}</td>
                                                                        <td className={balance > 0 ? "text-danger" : "text-success"}>{balance.toLocaleString()}</td>
                                                                        <td>
                                                                            <div className="btn-group">
                                                                                <button className="btn btn-xs btn-primary" onClick={() => this.openPaymentModal(student)}>M-Pesa</button>
                                                                                <button className="btn btn-xs btn-outline-secondary" onClick={() => this.openManualPaymentModal(student)}>Manual</button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {parentList.length === 0 && <div className="text-center p-5 text-muted">No records found matching filters.</div>}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            {/* Same modals as before (payment modals) */}
            {this.state.showPaymentModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">M-Pesa Push: {this.state.paymentStudent?.names}</h5>
                                <button type="button" className="close" onClick={() => this.setState({ showPaymentModal: false })}><span>&times;</span></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group"><label>Parent Phone</label><input type="text" className="form-control" value={this.state.parentPhone} disabled /></div>
                                <div className="form-group"><label>Amount (KES)</label><input type="number" className="form-control" value={this.state.paymentAmount} onChange={e => this.setState({ paymentAmount: e.target.value })} /></div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => this.setState({ showPaymentModal: false })}>Cancel</button>
                                <button className="btn btn-primary" disabled={this.state.processingPayment} onClick={this.initiatePayment}>{this.state.processingPayment ? "Sending..." : "Send Request"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {this.state.showManualPaymentModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Record Manual Payment</h5>
                                <button type="button" className="close" onClick={() => this.setState({ showManualPaymentModal: false })}><span>&times;</span></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Method</label>
                                    <select className="form-control" value={this.state.manualPaymentMethod} onChange={e => this.setState({ manualPaymentMethod: e.target.value })}><option value="CASH">Cash</option><option value="BANK">Bank</option><option value="CHEQUE">Cheque</option><option value="OTHER">Other</option></select>
                                </div>
                                <div className="form-group"><label>Amount (KES)</label><input type="number" className="form-control" value={this.state.paymentAmount} onChange={e => this.setState({ paymentAmount: e.target.value })} /></div>
                                <div className="form-group"><label>Reference / Notes</label><input type="text" className="form-control" value={this.state.manualPaymentNotes} onChange={e => this.setState({ manualPaymentNotes: e.target.value })} /></div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => this.setState({ showManualPaymentModal: false })}>Cancel</button>
                                <button className="btn btn-success" disabled={this.state.processingPayment} onClick={this.recordManualPayment}>{this.state.processingPayment ? "Saving..." : "Record"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
    }
}

export default FeesManagement;
