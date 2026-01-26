import React from 'react';

const ReportCard = ({ student, term, assessments, subjects, rubrics, school }) => {
    const themeColor = school?.themeColor || '#1a1a1a';
    
    // Helper to find score
    const getAssessment = (subjectId) => {
        return assessments.find(a => 
            (a.student === student.id || a.student?.id === student.id) &&
            (a.subject === subjectId || a.subject?.id === subjectId) &&
            (a.term === term.id || a.term?.id === term.id)
        );
    };

    const getRubric = (score) => {
        if (score === "" || score === null || isNaN(score)) return "-";
        const s = parseFloat(score);
        const rubric = (rubrics || []).find(r => s >= r.minScore && s <= r.maxScore);
        return rubric ? rubric.label : "-";
    };

    // Calculate totals and averages
    let totalScore = 0;
    let subjectsTaken = 0;

    const subjectRows = subjects.map(subject => {
        const assessment = getAssessment(subject.id);
        const score = assessment ? parseFloat(assessment.score) : null;
        const rubricLabel = getRubric(score);
        
        if (score !== null && !isNaN(score)) {
            totalScore += score;
            subjectsTaken++;
        }

        return {
            subject,
            score: score !== null ? score : '-',
            rubric: rubricLabel,
            remarks: assessment?.remarks || '-'
        };
    });

    const average = subjectsTaken > 0 ? (totalScore / subjectsTaken).toFixed(1) : 0;

    return (
        <div className="report-card-container" style={{ 
            padding: '2.5cm', 
            backgroundColor: 'white', 
            minHeight: '29.7cm', 
            width: '21cm', 
            margin: '0 auto', 
            pageBreakAfter: 'always',
            position: 'relative',
            fontFamily: "'Inter', 'Roboto', sans-serif",
            color: '#333'
        }}>
            {/* Elegant Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `4px solid ${themeColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: themeColor, letterSpacing: '-1px' }}>{school?.name || "SCHOOL NAME"}</h1>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>{school?.address || "Building, Street, City"}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>{school?.phone} • {school?.email}</p>
                </div>
                {school?.logo && (
                    <img src={school.logo} alt="Logo" style={{ maxHeight: '90px', maxWidth: '150px', objectFit: 'contain' }} />
                )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', color: '#1a1a1a' }}>Student Progress Report</h2>
                <div style={{ height: '2px', width: '60px', backgroundColor: themeColor, margin: '15px auto' }}></div>
            </div>

            {/* Student Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                <div>
                    <div style={{ marginBottom: '8px' }}><span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Student Name</span></div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{student.names}</div>
                </div>
                <div>
                    <div style={{ marginBottom: '8px' }}><span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Registration Number</span></div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{student.registration || 'N/A'}</div>
                </div>
                <div>
                    <div style={{ marginBottom: '8px' }}><span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Class / Grade</span></div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{student.class?.name || student.class_name || 'N/A'}</div>
                </div>
                <div>
                    <div style={{ marginBottom: '8px' }}><span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Academic Period</span></div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{term?.name || 'N/A'} • {new Date().getFullYear()}</div>
                </div>
            </div>

            {/* Results Table */}
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', marginBottom: '40px' }}>
                <thead>
                    <tr style={{ backgroundColor: themeColor }}>
                        <th style={{ padding: '15px', textAlign: 'left', color: 'white', borderRadius: '8px 0 0 0', fontSize: '0.9rem' }}>SUBJECT</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: 'white', fontSize: '0.9rem' }}>SCORE (%)</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: 'white', fontSize: '0.9rem' }}>ASSESSMENT</th>
                        <th style={{ padding: '15px', textAlign: 'left', color: 'white', borderRadius: '0 8px 0 0', fontSize: '0.9rem' }}>TEACHER REMARKS</th>
                    </tr>
                </thead>
                <tbody>
                    {subjectRows.map((row, idx) => (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee', fontWeight: 600 }}>{row.subject.name}</td>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{row.score}</td>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: '#eef2ff', color: themeColor, fontSize: '0.85rem', fontWeight: 600 }}>{row.rubric}</span>
                            </td>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee', color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>{row.remarks}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ backgroundColor: '#f4f7fe' }}>
                        <td style={{ padding: '15px', borderRadius: '0 0 0 8px', fontWeight: 800 }}>SUMMARY</td>
                        <td style={{ padding: '15px', textAlign: 'center', fontWeight: 800, fontSize: '1.2rem' }}>{average}%</td>
                        <td style={{ padding: '15px', textAlign: 'center' }} colSpan="2">
                            <span style={{ fontWeight: 600 }}>TOTAL MARKS:</span> {totalScore}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Performance Summary and Trend */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '60px' }}>
                <div style={{ flex: 1, border: '1px solid #eee', padding: '20px', borderRadius: '12px' }}>
                    <h5 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 700, color: '#444' }}>Performance Metrics</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Mean Score:</span>
                        <span style={{ fontWeight: 700 }}>{average}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Subjects Taken:</span>
                        <span style={{ fontWeight: 700 }}>{subjectsTaken}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Overall Rating:</span>
                        <span style={{ fontWeight: 700, color: themeColor }}>{getRubric(average)}</span>
                    </div>
                </div>
                <div style={{ flex: 1.5, border: '1px solid #eee', padding: '20px', borderRadius: '12px' }}>
                     {(() => {
                         const historyMap = {};
                         if (assessments && Array.isArray(assessments)) {
                             assessments.forEach(a => {
                                 const sId = a.student?.id || a.student;
                                 if (sId !== student.id) return;
                                 const tId = a.term?.id || a.term;
                                 const tName = a.term?.name || 'Term';
                                 if (!historyMap[tId]) historyMap[tId] = { name: tName, total: 0, count: 0 };
                                 const val = parseFloat(a.score);
                                 if (!isNaN(val)) { historyMap[tId].total += val; historyMap[tId].count++; }
                             });
                         }
                         const data = Object.values(historyMap).map(d => ({ name: d.name, value: d.count ? Math.round(d.total/d.count) : 0 }));
                         if (data.length === 0) data.push({ name: term?.name || 'Current', value: parseInt(average) || 0 });
                         const width = 300, height = 100, padding = 20, maxVal = 100;
                         if (data.length < 2) return <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Insufficient data for trend analysis</div>;
                         const points = data.map((d, i) => {
                             const x = padding + (i * ((width - 2 * padding) / (data.length - 1)));
                             const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                             return `${x},${y}`;
                         }).join(' ');
                         return (
                             <div className="text-center">
                                 <h6 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#444' }}>Academic Trend</h6>
                                 <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                                     <polyline fill="none" stroke={themeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
                                     {data.map((d, i) => {
                                         const x = padding + (i * ((width - 2 * padding) / (data.length - 1)));
                                         const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                                         return (
                                             <g key={i}>
                                                 <circle cx={x} cy={y} r="5" fill="white" stroke={themeColor} strokeWidth="2" />
                                                 <text x={x} y={height - 2} textAnchor="middle" fontSize="10" fill="#999">{d.name.substring(0,8)}</text>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '80px' }}>
                <div style={{ width: '200px', textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #ccc', paddingTop: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#555' }}>Class Teacher</p>
                    </div>
                </div>
                <div style={{ width: '200px', textAlign: 'center' }}>
                    <div style={{ borderTop: '1.5px solid #ccc', paddingTop: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#555' }}>Principal</p>
                    </div>
                </div>
            </div>

            {/* Premium Marketing Footer */}
            <div style={{ position: 'absolute', bottom: '1.5cm', left: '2.5cm', right: '2.5cm' }}>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>
                        Printed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444' }}>Powered by ShulePlus</div>
                            <div style={{ fontSize: '0.7rem', color: '#999' }}>The Premier Academic Management System</div>
                        </div>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#FA064B', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <span style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>+</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
