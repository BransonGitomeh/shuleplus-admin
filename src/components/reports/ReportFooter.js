import React from 'react';

const ReportFooter = ({ themeColor, validationStatus = "Authentic Record" }) => {
    const activeThemeColor = themeColor || '#1a1a1a';
    
    return (
        <div style={{ 
            marginTop: '1cm',
            borderTop: '2px double #f3f4f6',
            paddingTop: '20px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Validation Status: <span style={{ color: '#10b981' }}>{validationStatus}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#d1d5db', marginTop: '4px' }}>
                        Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })} at {new Date().toLocaleTimeString()}
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#374151', letterSpacing: '-0.3px' }}>
                            Powered by <span style={{ color: '#FA064B' }}>Shule</span><span style={{ color: '#1a1a1a' }}>Plus</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 500 }}>
                            Leading the Education Digital Frontier
                        </div>
                    </div>
                    <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        backgroundColor: '#FA064B', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(250, 6, 75, 0.2)'
                    }}>
                       <span style={{ color: 'white', fontWeight: 900, fontSize: '1.6rem', marginTop: '-2px' }}>+</span>
                    </div>
                </div>
            </div>
            
            {/* Subtle bottom line accent */}
            <div style={{ height: '4px', background: `linear-gradient(to right, ${activeThemeColor}, #FA064B)`, marginTop: '15px', borderRadius: '2px', opacity: 0.6 }}></div>
        </div>
    );
};

export default ReportFooter;
