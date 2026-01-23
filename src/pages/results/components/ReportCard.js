import React from 'react';

const ReportCard = ({ student, term, assessments, subjects, school }) => {
    // Helper to find score
    const getAssessment = (subjectId) => {
        return assessments.find(a => 
            (a.student === student.id || a.student?.id === student.id) &&
            (a.subject === subjectId || a.subject?.id === subjectId) &&
            (a.term === term.id || a.term?.id === term.id)
        );
    };

    // Calculate totals and averages
    let totalScore = 0;
    let subjectsTaken = 0;

    const subjectRows = subjects.map(subject => {
        const assessment = getAssessment(subject.id);
        const score = assessment ? parseInt(assessment.score, 10) : null;
        
        let grade = '-';
        let remarks = '-';

        if (score !== null && !isNaN(score)) {
            totalScore += score;
            subjectsTaken++;
            
            // Basic Grading Logic (Can be customized)
            if (score >= 80) { grade = 'A'; remarks = 'Excellent'; }
            else if (score >= 70) { grade = 'B'; remarks = 'Good'; }
            else if (score >= 60) { grade = 'C'; remarks = 'Fair'; }
            else if (score >= 50) { grade = 'D'; remarks = 'Pass'; }
            else { grade = 'E'; remarks = 'Fail'; }
        }

        return {
            subject,
            score: score !== null ? score : '-',
            grade,
            remarks
        };
    });

    const average = subjectsTaken > 0 ? (totalScore / subjectsTaken).toFixed(1) : 0;

    return (
        <div className="report-card-container" style={{ 
            padding: '40px', 
            backgroundColor: 'white', 
            minHeight: '29.7cm', // A4 Height
            width: '21cm', // A4 Width
            margin: '0 auto', 
            pageBreakAfter: 'always',
            position: 'relative'
        }}>
            {/* Header */}
            <div className="text-center mb-5" style={{ borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                {school?.logo && (
                    <img src={school.logo} alt="Logo" style={{ height: '80px', marginBottom: '10px' }} />
                )}
                <h2 style={{ margin: 0, textTransform: 'uppercase' }}>{school?.name || "School Name"}</h2>
                <p style={{ margin: '5px 0' }}>{school?.address || "Address Info"}</p>
                <p style={{ margin: 0 }}>{school?.phone} | {school?.email}</p>
                <h3 style={{ marginTop: '20px', textDecoration: 'underline' }}>Student Report Form</h3>
            </div>

            {/* Student Details */}
            <div className="row mb-4" style={{ fontSize: '1.1rem' }}>
                <div className="col-md-6" style={{ float: 'left', width: '50%' }}>
                    <p><strong>Name:</strong> {student.names}</p>
                    <p><strong>Reg Number:</strong> {student.registration || 'N/A'}</p>
                </div>
                <div className="col-md-6 text-right" style={{ float: 'right', width: '50%', textAlign: 'right' }}>
                    <p><strong>Class:</strong> {student.class?.name || student.class_name || 'N/A'}</p>
                    <p><strong>Term:</strong> {term?.name || 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <div style={{ clear: 'both' }}></div>
            </div>

            {/* Results Table */}
            <table className="table table-bordered table-sm" style={{ border: '1px solid #000', width: '100%', marginBottom: '30px' }}>
                <thead style={{ backgroundColor: '#f0f0f0' }}>
                    <tr>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Subject</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Score</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Grade</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {subjectRows.map((row, idx) => (
                        <tr key={idx}>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row.subject.name}</td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{row.score}</td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{row.grade}</td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row.remarks}</td>
                        </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>TOTAL</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{totalScore}</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }} colSpan="2">
                            Average: {average}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Performance Summary and Trend */}
            <div className="mb-5 row" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                <div className="col-md-5">
                    <h5>Performance Summary</h5>
                    <p><strong>Total Marks:</strong> {totalScore} / {subjectsTaken * 100}</p>
                    <p><strong>Mean Score:</strong> {average}</p>
                    <p><strong>Grade:</strong> {/* Logic for overall grade? */}</p>
                </div>
                <div className="col-md-7">
                     {/* SVG Trend Chart */}
                     {(() => {
                         // 1. Calculate History
                         const historyMap = {};
                         if (assessments && Array.isArray(assessments)) {
                             assessments.forEach(a => {
                                 const sId = a.student?.id || a.student;
                                 if (sId !== student.id) return;

                                 const tId = a.term?.id || a.term;
                                 const tName = a.term?.name || 'Term'; // Optimization: Need term name map if assessment doesn't include it
                                 
                                 // Note: if 'term' is just ID, we might need a map passed as prop. 
                                 // For now assuming term object populates or we use ID. 
                                 // If assessment doesn't have term name populated, we might show ID or default.
                                 
                                 if (!historyMap[tId]) historyMap[tId] = { name: tName, total: 0, count: 0 };
                                 const val = parseInt(a.score, 10);
                                 if (!isNaN(val)) {
                                     historyMap[tId].total += val;
                                     historyMap[tId].count++;
                                 }
                             });
                         }
                         
                         const data = Object.values(historyMap)
                             // Basic sort (maybe not perfect without dates/order)
                             // .sort((a,b) => a.name.localeCompare(b.name)) 
                             .map(d => ({ name: d.name, value: d.count ? Math.round(d.total/d.count) : 0 }));
                         
                         // Ensure at least current term is there if history missing
                         if (data.length === 0) data.push({ name: term?.name || 'Current', value: parseInt(average) || 0 });

                         // 2. SVG Drawing
                         const width = 300;
                         const height = 150;
                         const padding = 20;
                         const maxVal = 100;
                         
                         if (data.length < 2) return null; // Need comparison for trend

                         const points = data.map((d, i) => {
                             const x = padding + (i * ((width - 2 * padding) / (data.length - 1)));
                             const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                             return `${x},${y}`;
                         }).join(' ');

                         return (
                             <div className="text-center">
                                 <h6>Performance Trend</h6>
                                 <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ border: '0px solid #eee' }}>
                                     {/* Axis */}
                                     {/* <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#999" />
                                     <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#999" /> */}
                                     
                                     {/* Line */}
                                     <polyline fill="none" stroke="#007bff" strokeWidth="2" points={points} />
                                     
                                     {/* Dots & Labels */}
                                     {data.map((d, i) => {
                                         const x = padding + (i * ((width - 2 * padding) / (data.length - 1)));
                                         const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                                         return (
                                             <g key={i}>
                                                 <circle cx={x} cy={y} r="4" fill="#007bff" />
                                                 <text x={x} y={y - 10} textAnchor="middle" fontSize="10">{d.value}</text>
                                                 <text x={x} y={height - 5} textAnchor="middle" fontSize="9">{d.name.substring(0,6)}</text>
                                             </g>
                                         );
                                     })}
                                 </svg>
                             </div>
                         );
                     })()}
                </div>
            </div>

            {/* Signatures */}
            <div style={{ position: 'absolute', bottom: '50px', width: '90%' }}>
                <div style={{ width: '45%', float: 'left', borderTop: '1px solid #000', paddingTop: '10px' }}>
                    <p>Class Teacher's Signature</p>
                </div>
                <div style={{ width: '45%', float: 'right', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'right' }}>
                    <p>Principal's Signature & Stamp</p>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
