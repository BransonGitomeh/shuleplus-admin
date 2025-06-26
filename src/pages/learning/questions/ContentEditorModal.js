import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Assuming these components are available at the new path
import AddOptionModal from "../options/add";
import EditOptionModal from "../options/edit";
import DeleteOptionModal from "../options/delete";
import Table from "../components/table";

// --- Mock Data Service & Helpers (for standalone functionality) ---
// In your app, you would import your actual Data service.
const Data = {
  options: {
    create: async (payload) => ({ ...payload, id: `opt_${Math.random()}` }),
    update: async (payload) => payload,
    delete: async () => true,
  }
};
const toastr = window.toastr || { success: console.log, error: console.error, warning: console.warn };
const $ = window.$;
const generateId = () => `item_${Math.random().toString(36).substr(2, 9)}`;

// --- Initial State Helper ---
const createInitialState = () => ({
  id: null,
  name: '',
  type: 'SINGLECHOICE',
  subtopic: null,
  videos: [],
  images: [],
  attachments: [],
});

const ContentEditorModal = forwardRef(({ onSave, onFinished }, ref) => {
  // --- Core State ---
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  
  // Single state object for the content being edited
  const [content, setContent] = useState(createInitialState());
  
  // WYSIWYG Editor State
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  
  // State for Options/Responses
  const [options, setOptions] = useState([]);

  // --- Refs ---
  const addOptionModalRef = useRef();
  const editOptionModalRef = useRef();
  const deleteOptionModalRef = useRef();
  const fileInputRef = useRef({ image: null, attachment: null });

  // --- Imperative Handle to control modal from parent ---
  useImperativeHandle(ref, () => ({
    /**
     * Shows the modal to create or edit content.
     * @param {object|null} initialData - The content object to edit, or null to create new content.
     * @param {string} subtopicId - The ID of the subtopic this content belongs to.
     */
    show: (initialData = null, subtopicId) => {
      // Reset state for a fresh start
      setContent(createInitialState());
      setOptions([]);
      setEditorState(EditorState.createEmpty());
      
      if (initialData) {
        // Editing existing content
        setContent({
          id: initialData.id,
          name: initialData.name || '',
          type: initialData.type || 'SINGLECHOICE',
          subtopic: initialData.subtopic || subtopicId,
          // Normalize attachments to a consistent format
          videos: (initialData.videos || []).map(v => ({ id: generateId(), url: v, isExisting: true })),
          images: (initialData.images || []).map(i => ({ id: generateId(), preview: i.url, name: i.name, isExisting: true })),
          attachments: (initialData.attachments || []).map(a => ({ id: generateId(), name: a.name, isExisting: true })),
        });
        setOptions(initialData.options || []);
        
        // Populate editor from HTML
        const blocksFromHtml = htmlToDraft(initialData.name || '');
        if (blocksFromHtml) {
          const { contentBlocks, entityMap } = blocksFromHtml;
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
          setEditorState(EditorState.createWithContent(contentState));
        }

      } else {
        // Creating new content
        setContent(prev => ({ ...prev, subtopic: subtopicId }));
      }
      
      setActiveTab('content');
      setIsOpen(true);
    },
    hide: () => setIsOpen(false),
  }));

  // --- Modal Show/Hide Effect ---
  useEffect(() => {
    const modalId = '#content-editor-modal';
    if (isOpen) {
      $(modalId).modal({ show: true, backdrop: 'static', keyboard: false });
    } else {
      $(modalId).modal('hide');
    }
  }, [isOpen]);

  // --- Handlers ---
  const handleFieldChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    const html = stateToHTML(newEditorState.getCurrentContent());
    handleFieldChange('name', html);
  };
  
  const handleSave = async () => {
    if (!content.name.replace(/<[^>]*>/g, '').trim()) {
      toastr.warning("Content description cannot be empty.", "Validation");
      return;
    }
    
    setIsLoading(true);
    try {
      // The onSave prop is responsible for the actual API call
      const savedData = await onSave(content);
      
      // CRITICAL: Update local state with response from server (e.g., new ID, processed URLs)
      setContent(prev => ({ ...prev, ...savedData }));
      setOptions(savedData.options || []); // Sync options as well
      
      toastr.success("Content saved successfully!", "Success");
    } catch (error) {
      console.error("Save Error:", error);
      toastr.error(error.message || "Failed to save content.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    setIsOpen(false);
    if (onFinished) {
      onFinished(content); // Optionally pass final state to parent
    }
  };

  // --- Option/Response Handlers ---
  const handleCreateOption = async (data) => {
    const newOption = await Data.options.create({ ...data, question: content.id });
    setOptions(prev => [...prev, newOption]);
    addOptionModalRef.current.hide();
    toastr.success("Response created.", "Success");
  };

  const handleUpdateOption = async (data) => {
    await Data.options.update({ ...data, question: content.id });
    setOptions(prev => prev.map(opt => (opt.id === data.id ? { ...opt, ...data } : opt)));
    editOptionModalRef.current.hide();
    toastr.success("Response updated.", "Success");
  };

  const handleDeleteOption = async (optionToDelete) => {
    await Data.options.delete({ id: optionToDelete.id, questionId: content.id });
    setOptions(prev => prev.filter(opt => opt.id !== optionToDelete.id));
    deleteOptionModalRef.current.hide();
    toastr.success("Response deleted.", "Success");
  };

  // --- Derived State for UI ---
  const hasBeenSaved = !!content.id;
  const tableOptions = { reorderable: false, linkable: false, editable: true, deleteable: true };
  const correctOptionIds = options.filter(o => o.correct).map(o => o.id);

  return (
    <>
      <div className="modal fade" id="content-editor-modal" tabIndex="-1" role="dialog">
        {/* Inline styles for simplicity, can be moved to a CSS file */}
        <style>{`
          #content-editor-modal .modal-dialog { max-width: 1100px; }
          .editor-container { display: flex; height: 75vh; }
          .editor-nav-col { flex: 0 0 220px; background-color: #f8f9fa; border-right: 1px solid #dee2e6; padding: 1rem; }
          .editor-main-col { flex: 1; display: flex; flex-direction: column; }
          .editor-tab-content { padding: 1.5rem; overflow-y: auto; flex-grow: 1; }
          .editor-preview-col { flex: 0 0 400px; background-color: #f1f3f5; border-left: 1px solid #dee2e6; display: flex; flex-direction: column; }
          .preview-content, .responses-content { padding: 1.5rem; overflow-y: auto; }
          .responses-content { border-top: 1px solid #dee2e6; flex-shrink: 0; }
          .rdw-editor-wrapper { border: 1px solid #ced4da; border-radius: 0.25rem; }
          .rdw-editor-main { min-height: 300px; padding: 0 1rem; }
        `}</style>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{hasBeenSaved ? "Edit Content" : "Create New Content"}</h5>
              <button type="button" className="close" onClick={handleDone} aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body p-0">
              <div className="editor-container">
                {/* Left Column: Navigation & Form Tabs */}
                <div className="editor-nav-col">
                  <ul className="nav nav-pills flex-column">
                    <li className="nav-item">
                      <a className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('content')}>
                        <i className="fas fa-pencil-alt mr-2"></i>Content
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className={`nav-link ${activeTab === 'attachments' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('attachments')}>
                        <i className="fas fa-paperclip mr-2"></i>Attachments
                      </a>
                    </li>
                     <li className="nav-item">
                      <a className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('settings')}>
                        <i className="fas fa-cog mr-2"></i>Settings
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Middle Column: Editor Panes */}
                <div className="editor-main-col">
                  <div className="editor-tab-content">
                    {/* Content Tab */}
                    {activeTab === 'content' && (
                      <Editor
                        editorState={editorState}
                        onEditorStateChange={onEditorStateChange}
                        wrapperClassName="rdw-editor-wrapper"
                        editorClassName="rdw-editor-main"
                      />
                    )}
                    {/* Attachments Tab */}
                    {activeTab === 'attachments' && (
                       <div>
                         <h5>Attachments</h5>
                         {/* Placeholder for Video/Image/File upload UI */}
                         <p className="text-muted">Video, image, and file upload controls would go here.</p>
                       </div>
                    )}
                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                      <div>
                        <h5>Settings</h5>
                        <div className="form-group">
                          <label htmlFor="content-type">Content Type</label>
                          <select 
                            id="content-type" 
                            className="form-control" 
                            value={content.type} 
                            onChange={(e) => handleFieldChange('type', e.target.value)}
                          >
                            <option value="SINGLECHOICE">Single Choice</option>
                            <option value="MULTICHOICE">Multiple Choice</option>
                            <option value="CAMERA">Camera Input</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Preview & Responses */}
                <div className="editor-preview-col">
                  <div className="preview-content flex-grow-1">
                    <h6>Live Preview</h6>
                    <hr />
                    <div dangerouslySetInnerHTML={{ __html: content.name }} />
                  </div>
                  {hasBeenSaved && (
                    <div className="responses-content">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Responses</h6>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => addOptionModalRef.current?.show()}>
                          <i className="fas fa-plus mr-1"></i> Add
                        </button>
                      </div>
                      {options.length > 0 ? (
                        <Table
                          listId={`options-list-${content.id}`}
                          headers={[{ label: "Answer", key: "value" }]}
                          data={options}
                          options={tableOptions}
                          correctItemIds={correctOptionIds}
                          edit={(option) => editOptionModalRef.current?.show(option)}
                          delete={(option) => deleteOptionModalRef.current?.show(option)}
                        />
                      ) : (
                        <p className="text-center text-muted m-0 py-2">No responses added yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-success" onClick={handleDone}>
                Done
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
                {isLoading && <span className="spinner-border spinner-border-sm mr-2"></span>}
                {hasBeenSaved ? "Save Changes" : "Save & Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals for Options */}
      {hasBeenSaved && (
        <>
          <AddOptionModal ref={addOptionModalRef} save={handleCreateOption} question={content} />
          <EditOptionModal ref={editOptionModalRef} edit={handleUpdateOption} />
          <DeleteOptionModal ref={deleteOptionModalRef} delete={handleDeleteOption} />
        </>
      )}
    </>
  );
});

export default ContentEditorModal;