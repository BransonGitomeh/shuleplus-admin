// components/students/StudentDataTableV7.js

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Data from "../../utils/data";
import Fuse from 'fuse.js';

// Modals can be used as before
import AddModal from "./add";
import UploadModal from "./upload";
import EditModal from "./edit";
import DeleteModal from "./delete";

const addModalInstance = new AddModal();
const uploadModalInstance = new UploadModal();
const editModalInstance = new EditModal();
const deleteModalInstance = new DeleteModal();

const getNestedValue = (obj, path) => {
  if (!path) return '';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
};

// --- V7: PRODUCTION DATATABLE WITH SERVER-SIDE PAGINATION ---
export default function StudentDataTableV7() {
  // --- STATE MANAGEMENT ---
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  
  // State for related data for modals/dropdowns
  const [routes, setRoutes] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Loading states: `initialLoading` for the first load, `isPaginating` for subsequent fetches
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // The search term that is actually applied

  // Pagination & Sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: 'names', direction: 'ascending' });

  // State for highlighting newly added records
  const [newlyAddedIds, setNewlyAddedIds] = useState(new Set());
  const newRecordTimers = useRef(new Map());

  // --- DATA FETCHING & SUBSCRIPTIONS ---
  const fetchPageData = useCallback(async (page, limit, search, sort) => {
    // Use the `isPaginating` state for subsequent loads
    if (!initialLoading) setIsPaginating(true);

    try {
        const pageRes = await Data.students.getPage({
            page,
            limit,
            search,
            sort,
        });
        console.log(pageRes)
        const { students: fetchedStudents, totalCount } = pageRes;
        setStudents(fetchedStudents);
        setTotalStudents(totalCount);
    } catch (error) {
        console.error("Failed to fetch student page:", error);
        // Optionally, set an error state here to show a message to the user
    } finally {
        setInitialLoading(false);
        setIsPaginating(false);
    }
  }, [initialLoading]);

  // Effect to fetch data when pagination, sort, or search changes
  useEffect(() => {
    fetchPageData(currentPage, rowsPerPage, activeSearch, sortConfig);
  }, [currentPage, rowsPerPage, activeSearch, sortConfig, fetchPageData]);

  // Effect for initial data and subscriptions
  useEffect(() => {
    // Setup subscription for real-time updates (like new records)
    Data.students.subscribe(({ students: initialStudents, totalCount }) => {
        setStudents(initialStudents);
        setTotalStudents(totalCount);
        setInitialLoading(false);
    });
    
    // Fetch related data for modals
    // setRoutes(Data.students.getRoutes());
    // setParents(Data.students.getParents());
    // setClasses(Data.students.getClasses());

    return () => {
      // Clean up timers on unmount
      newRecordTimers.current.forEach(timerId => clearTimeout(timerId));
    };
  }, []);

  // --- HEADERS CONFIGURATION ---
  const headers = useMemo(() => [
      { key: 'names', label: 'Student Name', sortable: true },
      { key: 'registration', label: 'Registration', sortable: true },
      { key: 'class_name', label: 'Class', sortable: true },
      { key: 'route_name', label: 'Route', sortable: true },
      { key: 'parent_name', label: 'Parent', sortable: true },
  ], []);

  // --- DERIVED STATE ---
  // Since data is pre-sorted and paginated by the server, `processedData` is just the `students` state.
  const totalPages = Math.ceil(totalStudents / rowsPerPage);

  // --- EVENT HANDLERS ---
  const handleSearch = () => {
    setCurrentPage(1); // Reset to page 1 on new search
    setActiveSearch(searchTerm);
  };
  const handleClearSearch = () => {
    setSearchTerm("");
    if (activeSearch) {
      setCurrentPage(1);
      setActiveSearch("");
    }
  };
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setCurrentPage(1); // Reset to page 1 on sort change
    setSortConfig({ key, direction });
  };

  const [edit, setEdit] = useState(null);
  const [remove, setRemove] = useState(null);
  const handleEdit = (student) => { setEdit(student); editModalInstance.show(); };
  const handleDelete = (student) => { setRemove(student); deleteModalInstance.show(); };

  const handleStudentCreated = (newStudent) => {
    if (!newStudent || !newStudent.id) return;

    // Prepend the new student to the current page for immediate feedback
    setStudents(prev => [newStudent, ...prev.slice(0, rowsPerPage - 1)]);
    setTotalStudents(prev => prev + 1); // Increment total count
    setNewlyAddedIds(prev => new Set(prev).add(newStudent.id));
    setCurrentPage(1); // Go to the first page to see the new record

    const timerId = setTimeout(() => {
        setNewlyAddedIds(prev => {
            const newIds = new Set(prev);
            newIds.delete(newStudent.id);
            return newIds;
        });
        newRecordTimers.current.delete(newStudent.id);
    }, 5000);
    newRecordTimers.current.set(newStudent.id, timerId);
  };

  const handleCreateStudent = async (studentData) => {
    try {
        const newStudent = await Data.students.create(studentData);
        handleStudentCreated(newStudent);
    } catch (error) {
        console.error("Failed to create student:", error);
    }
  };
  
  const handleAfterAction = () => {
    // Refetch current page data after an edit or delete
    fetchPageData(currentPage, rowsPerPage, activeSearch, sortConfig);
  }

  return (
    <div className="v7-datatable-container">
      <AddModal routes={routes} save={handleCreateStudent} />
      <UploadModal save={() => { /* Upload logic would now post to backend and then refetch */ }} />
      {edit && <EditModal edit={edit} routes={routes} parents={parents} classes={classes} save={async student => { await Data.students.update(student); handleAfterAction(); }} />}
      {remove && <DeleteModal remove={remove} save={async student => { await Data.students.delete(student); handleAfterAction(); }} />}

      <style>{`
        /* --- V7 STYLING --- */
        .v7-datatable-container {
            --v7-bg: #F9F9FB;
            --v7-content-bg: #FFFFFF;
            --v7-border-color: #EFF2F5;
            --v7-text-primary: #181C32;
            --v7-text-secondary: #7E8299;
            --v7-accent-color: #0095E8;
            --v7-accent-light: #F1FAFF;
            --v7-danger-color: #F64E60;
            --v7-danger-light: #FFE2E5;
            --v7-success-light: #E8FFF3;
            font-family: 'Poppins', sans-serif;
            background-color: var(--v7-bg);
        }
        .v7-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; }
        .v7-header-title { font-size: 1.25rem; font-weight: 600; color: var(--v7-text-primary); }
        .v7-header-actions { display: flex; align-items: center; gap: 1rem; }
        .v7-header-stat { text-align: right; }
        .v7-header-stat .value { font-size: 1.25rem; font-weight: 700; color: var(--v7-text-primary); min-width: 30px; }
        .v7-header-stat .label { font-size: 0.8rem; font-weight: 500; color: var(--v7-text-secondary); }
        .v7-main { margin: 0 2rem 2rem; background-color: var(--v7-content-bg); border-radius: 0.75rem; box-shadow: 0 0 20px 0 rgba(76,87,125,.02); position: relative; }
        .v7-table-loader {
            position: absolute; top: 120px; /* Below toolbar */ left: 0; right: 0; bottom: 68px; /* Above pagination */
            background-color: rgba(255, 255, 255, 0.7);
            display: flex; align-items: center; justify-content: center;
            z-index: 10;
            opacity: 0; visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        .v7-table-loader.v7-loading { opacity: 1; visibility: visible; }
        .v7-spinner {
            border: 4px solid var(--v7-border-color);
            border-top: 4px solid var(--v7-accent-color);
            border-radius: 50%;
            width: 40px; height: 40px;
            animation: v7-spin 1s linear infinite;
        }
        @keyframes v7-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        /* ... other styles are similar to V6 but with v7 prefix ... */
        .v7-table th.sortable { cursor: pointer; }
        .v7-table th .sort-icon {
            display: inline-block;
            margin-left: 0.5rem;
            color: #B5B5C3;
            opacity: 0.5;
            transition: all 0.2s;
        }
        .v7-table th:hover .sort-icon { opacity: 1; }
        .v7-table th .sort-icon.active { color: var(--v7-accent-color); opacity: 1; }

        /* Copied from V6 for brevity */
        .v7-header-actions .btn { font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 0.42rem; border: none; cursor: pointer; }
        .v7-toolbar { padding: 1rem 2rem; border-bottom: 1px solid var(--v7-border-color); }
        .v7-search-group { display: flex; gap: 0.5rem; }
        .v7-search-input { flex-grow: 1; border: 1px solid #E4E6EF; border-radius: 0.42rem; padding: 0.75rem 1rem; font-size: 1rem; }
        .v7-table-wrapper { overflow-x: auto; }
        .v7-table { width: 100%; border-collapse: collapse; }
        .v7-table th { text-align: left; padding: 1rem 2rem; color: #B5B5C3; text-transform: uppercase; font-size: 0.8rem; font-weight: 600; user-select: none; }
        .v7-table td { padding: 1.25rem 2rem; color: var(--v7-text-secondary); font-weight: 500; border-top: 1px solid var(--v7-border-color); white-space: nowrap; }
        .v7-table .td-primary { color: var(--v7-text-primary); font-weight: 600; }
        .v7-table tbody tr { transition: background-color 2s ease-out; }
        .v7-table tbody tr:hover { background-color: var(--v7-accent-light); }
        .v7-table tbody tr.v7-duplicate-row { background-color: var(--v7-danger-light) !important; }
        .v7-table tbody tr.v7-new-row { background-color: var(--v7-success-light) !important; }
        .v7-table-actions button { background: none; border: none; cursor: pointer; padding: 0.5rem; font-size: 1.1rem; color: #B5B5C3; }
        .v7-table-actions button:hover { color: var(--v7-accent-color); }
        .v7-pagination { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 2rem; border-top: 1px solid var(--v7-border-color); }
        .v7-pagination-info { font-size: 0.9rem; color: var(--v7-text-secondary); font-weight: 500; }
        .v7-pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
        .v7-pagination-controls .btn-nav { font-weight: 500; padding: 0.5rem 1rem; border-radius: 0.42rem; border: 1px solid #E4E6EF; background-color: white; cursor: pointer; }
        .v7-pagination-controls .btn-nav:disabled { background-color: #F9F9FB; cursor: not-allowed; color: #D1D5DB; }
        .v7-pagination-controls .page-indicator { font-weight: 500; color: var(--v7-text-primary); }
        .v7-pagination-controls .form-select { border-color: #E4E6EF; font-weight: 500; }
      `}</style>
    
      <div className="v7-header">
        <h2 className="v7-header-title">Student Directory (V7)</h2>
        <div className="v7-header-actions">
          <div className="v7-header-stat">
            <div className="value">{initialLoading ? <div className="v7-spinner" style={{width: 20, height: 20}}></div> : totalStudents}</div>
            <div className="label">Total Students</div>
          </div>
          <button onClick={() => uploadModalInstance.show()} className="btn" style={{backgroundColor: '#F3F6F9', color: '#3F4254'}}>Upload</button>
          <button onClick={() => addModalInstance.show()} className="btn" style={{backgroundColor: '#0095E8', color: 'white'}}>Add Student</button>
        </div>
      </div>

      <div className="v7-main">
        <div className={`v7-table-loader ${isPaginating ? 'v7-loading' : ''}`}>
            <div className="v7-spinner"></div>
        </div>
        <div className="v7-toolbar">
            <div className="v7-search-group">
                <input type="text" className="v7-search-input" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <button className="btn" onClick={handleSearch} style={{backgroundColor: 'var(--v7-accent-color)', color: 'white'}}>Search</button>
                {activeSearch && <button className="btn" onClick={handleClearSearch} style={{backgroundColor: 'var(--v7-border-color)', color: 'var(--v7-text-secondary)'}}>Clear</button>}
            </div>
        </div>
        <div className="v7-table-wrapper">
          <table className="v7-table">
            <thead>
              <tr>
                {headers.map(h => (
                    <th key={h.key} className={h.sortable ? 'sortable' : ''} onClick={() => h.sortable && requestSort(h.key)}>
                        {h.label}
                        {h.sortable && (
                            <span className={`sort-icon ${sortConfig.key === h.key ? 'active' : ''}`}>
                                {sortConfig.key === h.key && sortConfig.direction === 'ascending' ? '▲' : '▼'}
                            </span>
                        )}
                    </th>
                ))}
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialLoading ? (
                [...Array(rowsPerPage)].map((_, i) => <tr key={i}><td colSpan={headers.length + 1}><div style={{height: '2rem', backgroundColor: '#EFF2F5', borderRadius: '4px', margin: '1rem 0'}}></div></td></tr>)
              ) : students?.length > 0 ? (
                students?.map(row => {
                  const isNew = newlyAddedIds.has(row.id);
                  let rowClass = '';
                  if (isNew) rowClass = 'v7-new-row';
                  return (
                    <tr key={row.id} className={rowClass}>
                      {headers.map(h => <td key={h.key} className={h.key === 'names' ? 'td-primary' : ''}>{getNestedValue(row, h.key)}</td>)}
                      <td className="v7-table-actions" style={{textAlign: 'right'}}>
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
        
        {!initialLoading && totalStudents > 0 && (
          <div className="v7-pagination">
            <div className="v7-pagination-info">
                Showing <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>-<strong>{Math.min(currentPage * rowsPerPage, totalStudents)}</strong> of <strong>{totalStudents}</strong>
            </div>
            <div className="v7-pagination-controls">
                <span className="me-3">Rows:</span>
                <select className="form-select form-select-sm" value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    {[15, 30, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
                <button className="btn-nav ms-3" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || isPaginating}>Previous</button>
                <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                <button className="btn-nav" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || isPaginating}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}