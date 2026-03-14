import React from 'react';

const ReportCard = ({ student, term, assessments, subjects, rubrics, assessmentTypes, school }) => {
    const themeColor = school?.themeColor || '#1a1a1a';
    
    // Helper to find score for a specific subject and assessment type
    const getScore = (subjectId, typeId) => {
        const a = assessments.find(a => 
            (a.student === student.id || a.student?.id === student.id) &&
            (a.subject === subjectId || a.subject?.id === subjectId) &&
            (a.term === term.id || a.term?.id === term.id) &&
            (a.assessmentType === typeId || a.assessmentType?.id === typeId)
        );
        return a ? parseFloat(a.score) : null;
    };

    const getRubric = (score) => {
        if (score === "" || score === null || isNaN(score)) return null;
        const s = parseFloat(score);
        return (rubrics || []).find(r => s >= r.minScore && s <= r.maxScore);
    };

    // Calculate totals and averages
    const subjectRows = subjects.map(subject => {
        let subjectPoints = 0;
        const typeScores = (assessmentTypes || []).map(type => {
            const score = getScore(subject.id, type.id);
            const rubric = getRubric(score);
            if (rubric && rubric.points) {
                subjectPoints += parseFloat(rubric.points);
            }
            return { type, score, rubric };
        });

        // Find if there's any student-specific comment for this subject in any assessment
        const assessmentWithComment = assessments.find(a => 
            (a.student === student.id || a.student?.id === student.id) &&
            (a.subject === subject.id || a.subject?.id === subject.id) &&
            (a.term === term.id || a.term?.id === term.id) &&
            a.teachersComment
        );

        return {
            subject,
            typeScores,
            totalPoints: subjectPoints,
            teachersComment: assessmentWithComment?.teachersComment || '-'
        };
    });

    const totalOverallPoints = subjectRows.reduce((sum, row) => sum + row.totalPoints, 0);

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
            color: '#1f2937', // Slate-800
            boxSizing: 'border-box',
            overflow: 'hidden' // Prevent spillover
        }}>
            {/* Premium Header Layout */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5cm' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '2.4rem', 
                        fontWeight: 900, 
                        color: themeColor, 
                        letterSpacing: '-1.5px',
                        lineHeight: '1.1',
                        textTransform: 'uppercase'
                    }}>
                        {school?.name || "SCHOOL NAME"}
                    </h1>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', fontWeight: 500 }}>
                            {school?.address || "Location / Address Information"}
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
                    Student Progress Report
                </h2>
                <div style={{ height: '4px', width: '80px', backgroundColor: themeColor, margin: '12px auto', borderRadius: '2px' }}></div>
            </div>

            {/* Student Infographic Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '15px', 
                backgroundColor: '#ffffff', 
                padding: '24px', 
                borderRadius: '16px', 
                marginBottom: '1cm',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>Name</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{student.names}</div>
                </div>
                <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>REG NO.</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{student.registration || '---'}</div>
                </div>
                <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '10px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>CLASS / GRADE</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{student.class?.name || student.class_name || 'N/A'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', marginBottom: '4px' }}>TERM</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{term?.name || 'N/A'}</div>
                </div>
            </div>

            {/* Premium Results Table */}
            <div style={{ marginBottom: '1cm', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: themeColor }}>
                            <th style={{ padding: '14px 18px', textAlign: 'left', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Learning Area</th>
                            {assessmentTypes?.map(type => (
                                <th key={type.id} style={{ padding: '14px 10px', textAlign: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{type.name}</th>
                            ))}
                            <th style={{ padding: '14px 10px', textAlign: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Points</th>
                            <th style={{ padding: '14px 18px', textAlign: 'left', color: 'white', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Remarks / Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectRows.map((row, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
                                    {row.subject.name}
                                </td>
                                {row.typeScores.map((ts, tIdx) => (
                                    <td key={tIdx} style={{ padding: '12px 10px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>{ts.score !== null ? ts.score : '-'}</span>
                                            {ts.rubric && (
                                                <div style={{ fontSize: '0.75rem', color: themeColor, fontWeight: 900, textTransform: 'uppercase' }}>
                                                    {ts.rubric.label}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                                <td style={{ padding: '12px 10px', borderBottom: '1px solid #f3f4f6', textAlign: 'center', fontWeight: 900, fontSize: '1.2rem', color: themeColor }}>
                                    {row.totalPoints}
                                </td>
                                <td style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic', maxWidth: '220px', lineHeight: '1.4' }}>
                                    {row.teachersComment}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <td style={{ padding: '16px 18px', fontWeight: 900, fontSize: '0.9rem', color: '#111827' }} colSpan={1 + (assessmentTypes?.length || 0)}>
                                AGGREGATE SUMMARY
                            </td>
                            <td style={{ padding: '16px 10px', textAlign: 'center', fontWeight: 900, fontSize: '1.4rem', color: themeColor }}>
                                {totalOverallPoints}
                            </td>
                            <td style={{ padding: '16px 18px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                                Total Learning Area Points
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Performance Metrics & Trend Blocks */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '1.5cm' }}>
                <div style={{ flex: 1, border: '2px solid #f3f4f6', padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff' }}>
                    <h5 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Performance Overview
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #f3f4f6' }}>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Overall Points Earned:</span>
                            <span style={{ fontWeight: 800, color: themeColor, fontSize: '1rem' }}>{totalOverallPoints}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #f3f4f6' }}>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Learning Areas Graded:</span>
                            <span style={{ fontWeight: 800, color: '#111827', fontSize: '1rem' }}>{subjects.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Learning Trend Status:</span>
                            <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.9rem', textTransform: 'uppercase' }}>Active Progress</span>
                        </div>
                    </div>
                </div>
                
                <div style={{ flex: 1.5, border: '2px solid #f3f4f6', padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff' }}>
                    <h5 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Academic Progress Trend
                    </h5>
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
                        if (data.length === 0) data.push({ name: term?.name || 'Current', value: parseInt(totalOverallPoints) || 0 });
                        const width = 350, height = 110, padding = 25, maxVal = 100;
                        if (data.length < 2) return <div style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Historic trend data will appear here over time.</div>;
                        const points = data.map((d, i) => {
                            const x = padding + (i * ((width - 2 * padding) / (data.length - 1)));
                            const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                            return `${x},${y}`;
                        }).join(' ');
                        return (
                            <div style={{ height: height }}>
                                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                                    <defs>
                                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: themeColor, stopOpacity: 0.2 }} />
                                            <stop offset="100%" style={{ stopColor: themeColor, stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <polyline fill="none" stroke="#e5e7eb" strokeWidth="1" points={`${padding},${height-padding} ${width-padding},${height-padding}`} />
                                    <polyline fill="none" stroke={themeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} />
                                    {data.map((d, i) => {
                                        const x = padding + (i * ((width - 2 * padding) / (data.length - 1)));
                                        const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                                        return (
                                            <g key={i}>
                                                <circle cx={x} cy={y} r="6" fill="white" stroke={themeColor} strokeWidth="3" />
                                                <text x={x} y={height - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#9ca3af">{d.name.substring(0,8)}</text>
                                                <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fontWeight="900" fill={themeColor}>{d.value}%</text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Signature Section - Pinned slightly above footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', marginBottom: '2.5cm', padding: '0 1cm' }}>
                <div style={{ width: '220px', textAlign: 'center' }}>
                    <div style={{ height: '40px' }}></div> {/* Spacer for digital signature/stamp */}
                    <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px' }}>
                        <p style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: '0.9rem', textTransform: 'uppercase' }}>Class Teacher</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>Signature & Date</p>
                    </div>
                </div>
                <div style={{ width: '220px', textAlign: 'center' }}>
                    <div style={{ height: '40px' }}></div>
                    <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px' }}>
                        <p style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: '0.9rem', textTransform: 'uppercase' }}>School Principal</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>Official Stamp & Date</p>
                    </div>
                </div>
            </div>

            {/* Premium Pinned ShulePlus Footer */}
            <div style={{ 
                position: 'absolute', 
                bottom: '1.2cm', 
                left: '2.0cm', 
                right: '2.0cm',
                borderTop: '2px double #f3f4f6',
                paddingTop: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Validation Status: <span style={{ color: '#10b981' }}>Authentic Record</span>
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
                <div style={{ height: '4px', background: `linear-gradient(to right, ${themeColor}, #FA064B)`, marginTop: '15px', borderRadius: '2px', opacity: 0.6 }}></div>
            </div>
        </div>
    );
};

export default ReportCard;
