import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Data from "../../utils/data"; // Your data service
import Fuse from 'fuse.js'; // For fuzzy search

// Import and instantiate your modals (assuming they exist in these paths)
import AddModal from "./add";
import UploadModal from "./upload";
import EditModal from "./edit";
import DeleteModal from "./delete";

// Instantiate modals for use within the component
const addModalInstance = new AddModal();
const uploadModalInstance = new UploadModal();
const editModalInstance = new EditModal();
const deleteModalInstance = new DeleteModal();


// --- HELPER FUNCTION ---

/**
 * Safely retrieves a value from a nested object using a dot-notation string.
 * @param {object} obj The object to query.
 * @param {string} path The path to the value (e.g., 'parent.name').
 * @returns {*} The value found at the path, or an empty string if not found.
 */
const getNestedValue = (obj, path) => {
  if (!path) return '';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
};


// --- SKELETON LOADER SUB-COMPONENT ---

/**
 * Renders a set of skeleton rows to be displayed while data is loading.
 * @param {object} props - Component props.
 * @param {number} props.rows - The number of skeleton rows to render.
 * @param {number} props.cols - The number of columns each row should have.
 */
const TableSkeleton = ({ rows, cols }) => (
  <>
    {[...Array(rows)].map((_, i) => (
      <tr key={`skeleton-row-${i}`} className="v6-skeleton-row">
        {[...Array(cols)].map((_, j) => (
          <td key={`skeleton-cell-${i}-${j}`}><div className="v6-skeleton-text" /></td>
        ))}
      </tr>
    ))}
  </>
);


/**
 * V6: The definitive, production-ready data table with robust loading,
 * as-is data rendering, and a polished Metronic-style UI.
 */
export default function StudentDataTableV6() {
  // --- STATE MANAGEMENT ---
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
      students: false, routes: false, parents: false, classes: false
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: 'names', direction: 'ascending' });
  
  // --- NEW --- State to track newly added student IDs for highlighting
  const [newlyAddedIds, setNewlyAddedIds] = useState(new Set());
  // --- NEW --- Ref to hold timers to prevent state updates on unmounted components
  const newRecordTimers = useRef(new Map());

  // --- DATA FETCHING & SUBSCRIPTIONS ---
  useEffect(() => {
    const allLoaded = Object.values(dataLoaded).every(Boolean);
    if (allLoaded) {
      setLoading(false);
    }
  }, [dataLoaded]);
  
  useEffect(() => {
    const cachedStudents = Data.students.list();
    if(cachedStudents.length > 0) {
      setStudents(cachedStudents);
      setDataLoaded(prev => ({ ...prev, students: true }));
    } 
    Data.students.subscribe(({ students }) => {
      setStudents(students);
      setDataLoaded(prev => ({ ...prev, students: true }));
    });
    const cachedRoutes = Data.routes.list();
    if(cachedRoutes.length > 0) {
      setRoutes(cachedRoutes);
      setDataLoaded(prev => ({ ...prev, routes: true }));
    } 
    Data.routes.subscribe(({ routes }) => {
      setRoutes(routes);
      setDataLoaded(prev => ({ ...prev, routes: true }));
    });
    const cachedParents = Data.parents.list();
    if(cachedParents.length > 0) {
      setParents(cachedParents);
      setDataLoaded(prev => ({ ...prev, parents: true }));
    } 
    Data.parents.subscribe(({ parents }) => {
      setParents(parents);
      setDataLoaded(prev => ({ ...prev, parents: true }));
    });
    const cachedClasses = Data.classes.list();
    if(cachedClasses.length > 0) {
      setClasses(cachedClasses);
      setDataLoaded(prev => ({ ...prev, classes: true }));
    } 
    Data.classes.subscribe(({ classes }) => {
      setClasses(classes);
      setDataLoaded(prev => ({ ...prev, classes: true }));
    });

    return () => {
      // studentSub.unsubscribe();
      // routeSub.unsubscribe();
      // parentSub.unsubscribe();
      // classSub.unsubscribe();
      // // --- NEW --- Clear all pending fade-out timers when component unmounts
      newRecordTimers.current.forEach(timerId => clearTimeout(timerId));
    };
  }, []); 

  // --- HEADERS CONFIGURATION ---
  const headers = useMemo(() => [
      { key: 'names', label: 'Student Name' },
      { key: 'registration', label: 'Registration' },
      { key: 'class_name', label: 'Class' },
      { key: 'route_name', label: 'Route' },
      { key: 'parent_name', label: 'Parent' },
  ], []);

  // --- DERIVED STATE & DATA PROCESSING ---
  const duplicateIds = useMemo(() => {
    const valueCounts = new Map();
    const duplicateCheckKey = 'registration';
    students.forEach(s => {
        const reg = getNestedValue(s, duplicateCheckKey).trim();
        if (reg) valueCounts.set(reg, (valueCounts.get(reg) || 0) + 1);
    });
    const duplicateValues = new Set();
    valueCounts.forEach((count, value) => { if (count > 1) duplicateValues.add(value); });
    const ids = new Set();
    students.forEach(s => { if (duplicateValues.has(getNestedValue(s, duplicateCheckKey).trim())) ids.add(s.id); });
    return ids;
  }, [students]);

  const fuse = useMemo(() => new Fuse(students, { keys: headers.map(h => h.key), threshold: 0.3 }), [students, headers]);

  // --- MODIFIED --- Processing logic updated to handle "new" records
  const processedData = useMemo(() => {
    let results = students;

    if (activeSearch.trim()) {
      results = fuse.search(activeSearch).map(r => r.item);
    }

    if (sortConfig !== null) {
      results = [...results].sort((a, b) => {
        // --- NEW --- Prioritize sorting newly added records to the top
        const aIsNew = newlyAddedIds.has(a.id);
        const bIsNew = newlyAddedIds.has(b.id);
        
        if (aIsNew && !bIsNew) return -1; // a comes first
        if (!aIsNew && bIsNew) return 1;  // b comes first

        // Fallback to the original sorting logic if both are new or both are old
        const valA = getNestedValue(a, sortConfig.key);
        const valB = getNestedValue(b, sortConfig.key);
        return valA.toString().localeCompare(valB.toString()) * (sortConfig.direction === 'ascending' ? 1 : -1);
      });
    }
    return results;
  }, [students, activeSearch, sortConfig, fuse, newlyAddedIds]); // --- MODIFIED --- Added newlyAddedIds dependency

  const paginatedData = useMemo(() => processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [processedData, currentPage, rowsPerPage]);
  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // --- EVENT HANDLERS ---
  const handleSearch = () => { setActiveSearch(searchTerm); setCurrentPage(1); };
  const handleClearSearch = () => { setSearchTerm(""); setActiveSearch(""); setCurrentPage(1); };
  
  const requestSort = useCallback((key) => {
    const isAsc = sortConfig?.key === key && sortConfig.direction === 'ascending';
    setSortConfig({ key, direction: isAsc ? 'descending' : 'ascending' });
    setCurrentPage(1);
  }, [sortConfig]);

  const handleEdit = (student) => { setEdit(student); editModalInstance.show(); };
  const handleDelete = (student) => { setRemove(student); deleteModalInstance.show(); };

  const [edit, setEdit] = useState(null);
  const [remove, setRemove] = useState(null);

  // --- NEW --- Handler to process newly created students
  const handleStudentCreated = (newStudent) => {
    if (!newStudent || !newStudent.id) return;

    // Add to the set of new IDs to trigger re-sort and highlight
    setNewlyAddedIds(prevIds => new Set(prevIds).add(newStudent.id));
    setCurrentPage(1); // Go to the first page to see the new record

    // Set a timer to remove the highlight after 5 seconds
    const FADE_DURATION = 5000;
    const timerId = setTimeout(() => {
      setNewlyAddedIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.delete(newStudent.id);
        return newIds;
      });
      newRecordTimers.current.delete(newStudent.id);
    }, FADE_DURATION);

    // Store the timer ID for potential cleanup
    newRecordTimers.current.set(newStudent.id, timerId);
  };

  // --- NEW --- Wrapper functions for creating students
  // This assumes `Data.students.create` returns the created student object with its new ID.
  const handleCreateStudent = async (student) => {
    const newStudent = await Data.students.create(student);
    handleStudentCreated(newStudent);
  };
  
  const handleUploadStudents = async (studentsToUpload) => {
    const creationPromises = studentsToUpload.map(s => Data.students.create(s));
    const newStudents = await Promise.all(creationPromises);
    newStudents.forEach(handleStudentCreated);
  };
  
  return (
    <div className="v6-datatable-container">
      {/* --- MODIFIED --- Modals now use the new handler functions */}
      <AddModal routes={routes} save={handleCreateStudent} />
      <UploadModal save={handleUploadStudents} />
      {edit && <EditModal edit={{...edit, school: undefined}} routes={routes} parents={parents} classes={classes} save={student => Data.students.update({...student, school: undefined})} />}
      {remove && (
        <DeleteModal
          remove={remove}
          save={async student => {
            console.log('Deleting student:', student);
            await Data.students.delete(student);
            console.log('Student deleted:', student);
          }}
        />
      )}

      <style>{`
        /* --- V6 SELF-CONTAINED STYLING --- */
        .v6-datatable-container {
          --v6-bg: #F9F9FB;
          --v6-content-bg: #FFFFFF;
          --v6-border-color: #EFF2F5;
          --v6-text-primary: #181C32;
          --v6-text-secondary: #7E8299;
          --v6-accent-color: #0095E8;
          --v6-accent-light: #F1FAFF;
          --v6-danger-color: #F64E60;
          --v6-danger-light: #FFE2E5; /* Light red for duplicate rows */
          --v6-success-light: #E8FFF3; /* --- NEW --- Light green for new rows */
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: var(--v6-bg);
        }
        .v6-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; }
        .v6-header-title { font-size: 1.25rem; font-weight: 600; color: var(--v6-text-primary); }
        .v6-header-actions { display: flex; align-items: center; gap: 1rem; }
        .v6-header-actions .btn { font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 0.42rem; border: none; cursor: pointer; }
        .v6-header-stat { text-align: right; }
        .v6-header-stat .value { font-size: 1.25rem; font-weight: 700; color: var(--v6-text-primary); }
        .v6-header-stat .label { font-size: 0.8rem; font-weight: 500; color: var(--v6-text-secondary); }
        .v6-main { margin: 0 2rem 2rem 2rem; background-color: var(--v6-content-bg); border-radius: 0.75rem; box-shadow: 0 0 20px 0 rgba(76,87,125,.02); }
        .v6-toolbar { padding: 1rem 2rem; border-bottom: 1px solid var(--v6-border-color); }
        .v6-search-group { display: flex; gap: 0.5rem; }
        .v6-search-input { flex-grow: 1; border: 1px solid #E4E6EF; border-radius: 0.42rem; padding: 0.75rem 1rem; font-size: 1rem; }
        .v6-search-input:focus { border-color: var(--v6-accent-color); outline: none; box-shadow: 0 0 0 2px var(--v6-accent-light); }
        .v6-search-group .btn { font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 0.42rem; border: none; cursor: pointer; }
        .v6-search-group .btn-search { background-color: var(--v6-accent-color); color: white; }
        .v6-search-group .btn-clear { background-color: var(--v6-border-color); color: var(--v6-text-secondary); }
        .v6-table-wrapper { overflow-x: auto; }
        .v6-table { width: 100%; border-collapse: collapse; }
        .v6-table th { text-align: left; padding: 1rem 2rem; color: #B5B5C3; text-transform: uppercase; font-size: 0.8rem; font-weight: 600; cursor: pointer; user-select: none; }
        .v6-table td { padding: 1.25rem 2rem; color: var(--v6-text-secondary); font-weight: 500; border-top: 1px solid var(--v6-border-color); white-space: nowrap; }
        .v6-table .td-primary { color: var(--v6-text-primary); font-weight: 600; }
        .v6-table tbody tr { transition: background-color 2s ease-out; /* --- NEW --- Smooth fade-out transition */ }
        .v6-table tbody tr:hover { background-color: var(--v6-accent-light); }
        .v6-table tbody tr.v6-duplicate-row { background-color: var(--v6-danger-light) !important; }
        .v6-table tbody tr.v6-duplicate-row .td-primary { color: var(--v6-danger-color); font-weight: 700; }
        /* --- NEW --- Style for newly added rows */
        .v6-table tbody tr.v6-new-row {
          background-color: var(--v6-success-light) !important;
        }
        .v6-table-actions button { background: none; border: none; cursor: pointer; padding: 0.5rem; font-size: 1.1rem; color: #B5B5C3; }
        .v6-table-actions button:hover { color: var(--v6-accent-color); }
        .v6-skeleton-row td { padding: 1rem 2rem; }
        .v6-skeleton-text { height: 1.5rem; border-radius: 0.375rem; background: linear-gradient(90deg, #EFF2F5 25%, #E4E6EF 50%, #EFF2F5 75%); background-size: 200% 100%; animation: v6-shimmer 1.5s infinite; }
        @keyframes v6-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .v6-pagination { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 2rem; border-top: 1px solid var(--v6-border-color); }
        .v6-pagination-info { font-size: 0.9rem; color: var(--v6-text-secondary); font-weight: 500; }
        .v6-pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
        .v6-pagination-controls .btn-nav { font-weight: 500; padding: 0.5rem 1rem; border-radius: 0.42rem; border: 1px solid #E4E6EF; background-color: white; cursor: pointer; }
        .v6-pagination-controls .btn-nav:disabled { background-color: #F9F9FB; cursor: not-allowed; color: #D1D5DB; }
        .v6-pagination-controls .page-indicator { font-weight: 500; color: var(--v6-text-primary); }
        .v6-pagination-controls .form-select { border-color: #E4E6EF; font-weight: 500; }
      `}</style>
    
      {/* Header and Toolbar - no changes needed here */}
      <div className="v6-header">
        <h2 className="v6-header-title">Student Directory</h2>
        <div className="v6-header-actions">
          <div className="v6-header-stat">
            <div className="value">{loading ? '-' : students.length}</div>
            <div className="label">Total Students</div>
          </div>
          <button onClick={() => uploadModalInstance.show()} className="btn" style={{backgroundColor: '#F3F6F9', color: '#3F4254'}}>Upload</button>
          <button onClick={() => addModalInstance.show()} className="btn" style={{backgroundColor: '#0095E8', color: 'white'}}>Add Student</button>
        </div>
      </div>

      <div className="v6-main">
        <div className="v6-toolbar">
          <div className="v6-search-group">
            <input type="text" className="v6-search-input" placeholder="Search by name, registration, parent..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="btn btn-search" onClick={handleSearch}>Search</button>
            {activeSearch && <button className="btn btn-clear" onClick={handleClearSearch}>Clear</button>}
          </div>
        </div>

        <div className="v6-table-wrapper">
          <table className="v6-table">
            <thead>
              <tr>
                {headers.map(h => (<th key={h.key} onClick={() => requestSort(h.key)}>{h.label}</th>))}
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={rowsPerPage} cols={headers.length + 1} />
              ) : paginatedData.length > 0 ? (
                paginatedData.map(row => {
                  // --- NEW --- Combine class names for different states
                  const isDuplicate = duplicateIds.has(row.id);
                  const isNew = newlyAddedIds.has(row.id);
                  let rowClass = '';
                  if (isNew) rowClass = 'v6-new-row';
                  else if (isDuplicate) rowClass = 'v6-duplicate-row';

                  return (
                    <tr key={row.id} className={rowClass}>
                      {headers.map(h => (
                        <td key={h.key} className={h.key === 'names' ? 'td-primary' : ''}>
                          {getNestedValue(row, h.key)}
                        </td>
                      ))}
                      <td className="v6-table-actions" style={{textAlign: 'right'}}>
                          <button title="Edit Student" onClick={() => handleEdit(row)}><i className="la la-edit" style={{fontSize: '1.5rem'}}></i></button>
                          <button title="Delete Student" onClick={() => handleDelete(row)}><i className="la la-trash" style={{fontSize: '1.5rem'}}></i></button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={headers.length + 1} style={{ textAlign: 'center', padding: '4rem', color: '#B5B5C3' }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 0 && (
          <div className="v6-pagination">
            {/* Pagination controls - no changes needed here */}
            <div className="v6-pagination-info">
                Showing <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>-<strong>{Math.min(currentPage * rowsPerPage, processedData.length)}</strong> of <strong>{processedData.length}</strong>
            </div>
            <div className="v6-pagination-controls">
                <span className="me-3">Rows:</span>
                <select className="form-select form-select-sm" value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    {[15, 30, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
                <button className="btn-nav ms-3" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</button>
                <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                <button className="btn-nav" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}