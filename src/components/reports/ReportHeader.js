import React from 'react';

const ReportHeader = ({ school, title, themeColor }) => {
    const activeThemeColor = themeColor || school?.themeColor || '#1a1a1a';
    
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.0cm' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '2.4rem', 
                        fontWeight: 900, 
                        color: activeThemeColor, 
                        letterSpacing: '-1.5px',
                        lineHeight: '1.1',
                        textTransform: 'uppercase'
                    }}>
                        {school?.name || "SCHOOL NAME"}
                    </h1>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', fontWeight: 500 }}>
                            {school?.address || "Address Information"}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                            <span style={{ fontWeight: 600, color: '#374151' }}>Tel:</span> {school?.phone || "N/A"} 
                            <span style={{ margin: '0 10px', color: '#d1d5db' }}>|</span> 
                            <span style={{ fontWeight: 600, color: '#374151' }}>Email:</span> {school?.email || "N/A"}
                        </p>
                    </div>
                </div>
                {school?.logo && (
                    <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                        <img src={school.logo} alt="School Logo" style={{ maxHeight: '110px', maxWidth: '180px', objectFit: 'contain' }} />
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1cm', position: 'relative' }}>
                <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.6rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    color: '#111827',
                    letterSpacing: '2px'
                }}>
                    {title}
                </h2>
                <div style={{ height: '4px', width: '80px', backgroundColor: activeThemeColor, margin: '12px auto', borderRadius: '2px' }}></div>
            </div>
        </>
    );
};

export default ReportHeader;
