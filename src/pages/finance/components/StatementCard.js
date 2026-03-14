import React from 'react';
import ReportHeader from '../../components/reports/ReportHeader';
import ReportFooter from '../../components/reports/ReportFooter';

const StatementCard = ({ group, school, validStudentsData, totalValidExpected, totalValidPaid, totalValidBalance }) => {
    const themeColor = school?.themeColor || '#1a1a1a';
    
    return (
        <div className="report-card-container" style={{ 
            padding: '1.2cm 2.0cm', 
            backgroundColor: 'white', 
            minHeight: '28cm', 
            height: 'auto', 
            width: '21cm', 
            margin: '0 auto', 
            pageBreakAfter: 'auto',
            position: 'relative',
            fontFamily: "'Inter', 'Roboto', sans-serif",
            color: '#1f2937', 
            boxSizing: 'border-box',
            overflow: 'visible'
        }}>
            {/* Header */}
            <ReportHeader school={school} title="Fees Statement" themeColor={themeColor} />

            {/* Parent Details Block */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '15px', 
                backgroundColor: '#ffffff', 
                padding: '20px', 
                borderRadius: '16px', 
                marginBottom: '1cm',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>Billed To</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{group.parent.name}</div>
                </div>
                <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{group.parent.phone}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>Date Issued</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{new Date().toLocaleDateString('en-GB')}</div>
                </div>
            </div>

            {/* Summary Table (Fees + Charges) */}
            <div style={{ marginBottom: '1.0cm', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: themeColor }}>
                            <th style={{ padding: '14px 18px', textAlign: 'left', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', width: '40%' }}>Student / Charge Component</th>
                            <th style={{ padding: '14px 10px', textAlign: 'right', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Expected (Fees + Charges)</th>
                            <th style={{ padding: '14px 10px', textAlign: 'right', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Paid (KES)</th>
                            <th style={{ padding: '14px 18px', textAlign: 'right', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Balance (KES)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Class Fees */}
                        {validStudentsData.map((s, idx) => (
                            <tr key={'s-'+idx} style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
                                    Class Fee: {s.names}
                                </td>
                                <td style={{ padding: '14px 10px', textAlign: 'right', fontSize: '0.9rem' }}>{s.expected.toLocaleString()}</td>
                                <td style={{ padding: '14px 10px', textAlign: 'right', fontSize: '0.9rem' }}>{s.paid.toLocaleString()}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700 }}>{s.balance.toLocaleString()}</td>
                            </tr>
                        ))}

                        {/* Charges */}
                        {group.charges && group.charges.map((c, idx) => (
                            <tr key={'c-'+idx} style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '14px 18px', fontWeight: 600, fontSize: '0.9rem', color: '#6b7280' }}>
                                    Charge: {c.chargeType?.name || c.reason}
                                </td>
                                <td style={{ padding: '14px 10px', textAlign: 'right', fontSize: '0.9rem', color: '#6b7280' }}>{parseFloat(c.amount || 0).toLocaleString()}</td>
                                <td style={{ padding: '14px 10px', textAlign: 'right', fontSize: '0.9rem', color: '#6b7280' }}>-</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.9rem', color: '#6b7280' }}>-</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <td style={{ padding: '18px 18px', fontWeight: 900, fontSize: '1.0rem', color: '#111827' }}>
                                GRAND TOTAL
                            </td>
                            <td style={{ padding: '18px 10px', textAlign: 'right', fontWeight: 800, fontSize: '1.0rem', color: '#374151' }}>
                                {totalValidExpected.toLocaleString()}
                            </td>
                            <td style={{ padding: '18px 10px', textAlign: 'right', fontWeight: 800, fontSize: '1.0rem', color: '#10b981' }}>
                                {totalValidPaid.toLocaleString()}
                            </td>
                            <td style={{ padding: '18px 18px', textAlign: 'right', fontWeight: 900, fontSize: '1.2rem', color: themeColor }}>
                                {totalValidBalance.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Transaction History Table */}
            <div style={{ marginBottom: '0.8cm' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                    Transaction History
                </h3>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '10px 18px', textAlign: 'left', color: '#4b5563', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '20%' }}>Date</th>
                                <th style={{ padding: '10px 10px', textAlign: 'left', color: '#4b5563', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '40%' }}>Description</th>
                                <th style={{ padding: '10px 10px', textAlign: 'left', color: '#4b5563', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '20%' }}>Ref / ID</th>
                                <th style={{ padding: '10px 18px', textAlign: 'right', color: '#4b5563', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '20%' }}>Amount (KES)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group.history && group.history.length > 0 ? (
                                group.history.map((h, idx) => (
                                    <tr key={'h-'+idx} style={{ borderBottom: idx === group.history.length - 1 ? 'none' : '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '10px 18px', fontSize: '0.85rem', color: '#374151' }}>
                                            {new Date(h.time || h.createdAt || h.transactionDate).toLocaleDateString('en-GB')}
                                        </td>
                                        <td style={{ padding: '10px 10px', fontSize: '0.85rem', color: '#374151' }}>
                                            <div style={{ fontWeight: 600 }}>{h.paymentType || h.type || 'M-Pesa'}</div>
                                            {h.studentName && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>For: {h.studentName}</div>}
                                        </td>
                                        <td style={{ padding: '10px 10px', fontSize: '0.85rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                            {h.mpesaReceiptNumber || h.ref || '-'}
                                        </td>
                                        <td style={{ padding: '10px 18px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                                            {parseFloat(h.amount || h.ammount || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                        No transactions recorded for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Instructions / Disclaimer Block */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '1.5cm' }}>
                <div style={{ flex: 1, border: '2px solid #f3f4f6', padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Account Status
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                        The total outstanding balance for this account (including <strong>Class Fees</strong> and <strong>Extra Charges</strong>) is <strong>KES {totalValidBalance.toLocaleString()}</strong>. 
                        Please ensure timely payments to avoid interruptions. All payments should be made directly to the school's authorized collection points or digital paybills.
                    </p>
                </div>
            </div>

            {/* Premium Pinned ShulePlus Footer */}
            <ReportFooter themeColor={themeColor} validationStatus="Authentic Financial Record" />
        </div>
    );
};

export default StatementCard;
