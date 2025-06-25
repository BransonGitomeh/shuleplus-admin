import React from "react";
import ErrorMessage from "../components/error-toast"; // Assuming this path is correct

// --- Draft.js and react-draft-wysiwyg Imports ---
import { EditorState, ContentState } from 'draft-js'; // Removed convertToRaw as not used here directly for save
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from 'draft-js-export-html';
import Data from "../../../utils/data"; 
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// --- Image Compression ---
import imageCompression from 'browser-image-compression';

import AddOptionModal from "../options/add";
import EditOptionModal from "../options/edit";
import DeleteOptionModal from "../options/delete";

import Table from "../components/table";

const toastr = window.toastr

const IErrorMessage = new ErrorMessage();
const $ = window.$; // Assuming jQuery is available globally

const contentTypes = ['SINGLECHOICE', 'MULTICHOICE', 'CAMERA'];
const modalNumber = `contentModal_${Math.random().toString(36).substr(2, 9)}`;
const generateId = () => `item_${Math.random().toString(36).substr(2, 9)}`;

const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    url = url.trim();
    let videoId = null;
    const watchMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (watchMatch && watchMatch[2].length === 11) videoId = watchMatch[2];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    if (url.includes("youtube.com/embed/")) {
        const embedIdMatch = url.match(/embed\/([^#\&\?]+)/);
        if (embedIdMatch && embedIdMatch[1].length === 11) return url;
    }
    return null;
};

const tableOptions = { reorderable: true, linkable: true, editable: true, deleteable: true };



const Search = () => {
  return (
    <div className="kt-form kt-fork--label-right kt-margin-t-20">
      <div className="row align-items-center">
        <div className="col-sm-12 col-md-12 col-xl-12 order-2 order-xl-1">
          <div className="form-group">
            <div className="kt-input-icon kt-input-icon--left">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                onChange={(e) => Data.search(e.target.value)}
              />
              <span className="kt-input-icon__icon kt-input-icon__icon--left">
                <span>
                  <i className="la la-search" />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

class Modal extends React.Component {
  addOptionModalRef = React.createRef(); editOptionModalRef = React.createRef(); deleteOptionModalRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = this.getInitialState(props);
    this.editorRef = React.createRef();
    this.imageFileInputRef = React.createRef();
    this.attachmentFileInputRef = React.createRef();
  }

  getInitialState = (props) => ({
    loading: false,
    isCompressingImages: false,
    question: {
      subtopic: props?.subtopic || "", type: props?.type || "",
      videos: [], uploadedImages: [], uploadedAttachments: [],
    },
    editorState: EditorState.createEmpty(),
    videoUrlsInput: "", generationPrompt: "", isGenerating: false,
  });

  resetState = () => {
    (this.state.question.uploadedImages || []).forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview);
    });
    this.setState(this.getInitialState(this.props));
    if (this.imageFileInputRef.current) this.imageFileInputRef.current.value = null;
    if (this.attachmentFileInputRef.current) this.attachmentFileInputRef.current.value = null;
  }

  onEditorStateChange = (editorState) => this.setState({ editorState });

  handleGenerateContent = async () => {
    if (!this.state.generationPrompt.trim()) { IErrorMessage.show({ message: "Please enter a prompt." }); return; }
    this.setState({ isGenerating: true });
    await new Promise(resolve => setTimeout(resolve, 1500));
    const generatedHtml = `<h2>Generated for: ${this.state.generationPrompt}</h2><p>Example <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Point 1</li><li>Point 2</li></ul>`;
    const blocksFromHtml = htmlToDraft(generatedHtml);
    if (blocksFromHtml) {
      const { contentBlocks, entityMap } = blocksFromHtml;
      // For Add modal, we usually want to replace content, not append.
      this.onEditorStateChange(EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocks, entityMap)));
    } else { IErrorMessage.show({ message: "Could not generate content." }); }
    this.setState({ isGenerating: false, generationPrompt: "" });
  };

  handleVideoUrlsInputChange = (event) => this.setState({ videoUrlsInput: event.target.value });

  handleAddVideoUrls = () => {
    const urls = this.state.videoUrlsInput.split('\n').map(url => url.trim()).filter(url => url);
    if (!urls.length) { IErrorMessage.show({ message: "Please enter YouTube URLs." }); return; }
    const newVideos = []; let invalidUrlFound = false;
    urls.forEach(originalUrl => {
      const embedUrl = getYoutubeEmbedUrl(originalUrl);
      if (embedUrl) {
        if (!(this.state.question.videos || []).some(v => v.embedUrl === embedUrl) && !newVideos.some(v => v.embedUrl === embedUrl)) {
          newVideos.push({ id: generateId(), embedUrl, originalUrl });
        }
      } else { IErrorMessage.show({ message: `Invalid URL: ${originalUrl.substring(0, 40)}...` }); invalidUrlFound = true; }
    });
    if (newVideos.length > 0) {
      this.setState(prevState => ({
        question: { ...prevState.question, videos: [...(prevState.question.videos || []), ...newVideos] },
        videoUrlsInput: ""
      }));
    } else if (!invalidUrlFound) { IErrorMessage.show({ message: "No new valid URLs or duplicates." }); }
  };

  handleCreate = async (entity, data, parentId, parentKey) => {
      const payload = parentId ? { ...data, [parentKey]: parentId } : data;
      this.onEntityCreated(entity.slice(0, -1)); 
      var createdOption =  await Data[entity].create(payload);
      this.setState({
        addedOptions:[...this.state.addedOptions, createdOption],
        filteredOptions:[...this.state.filteredOptions, createdOption],
      })
    }

    handleUpdate = (entity, data) => async () => {
      console.log(`Updating ${entity}:`, data);
      const startTime = performance.now();
      console.log(`Started updating ${entity} at ${new Date(startTime).toLocaleString()}`);
      await Data[entity].update(data);
      const endTime = performance.now();
      console.log(`Finished updating ${entity} at ${new Date(endTime).toLocaleString()}`);
      console.log(`Update of ${entity} took ${endTime - startTime}ms`);
      this.onEntityUpdated(entity.slice(0, -1));
    }
    handleDelete = (entity, item, parentId, parentKey) => async () => {
      const payload = parentId ? { id: item.id, [parentKey]: parentId } : { id: item.id };
      await Data[entity].delete(payload);
      this.onEntityDeleted(entity.slice(0, -1));
    }

  onEntityCreated = (entityName) => { toastr.success(`${entityName} has been CREATED successfully!`, `Create ${entityName}`); }

  removeVideo = (idToRemove) => this.setState(prevState => ({ question: { ...prevState.question, videos: (prevState.question.videos || []).filter(v => v.id !== idToRemove) } }));

  triggerImageFileInput = () => this.imageFileInputRef.current.click();

  handleImageFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    this.setState({ isCompressingImages: true });
    const imageProcessingPromises = files.map(async (file) => {
      if (!file.type.startsWith('image/')) { IErrorMessage.show({ message: `${file.name} is not an image.` }); return null; }
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve({
            id: generateId(), name: compressedFile.name, data: reader.result,
            preview: URL.createObjectURL(compressedFile), originalSize: file.size,
            compressedSize: compressedFile.size,
          });
          reader.onerror = (err) => { IErrorMessage.show({ message: `Error reading ${file.name}.` }); reject(err); };
          reader.readAsDataURL(compressedFile);
        });
      } catch (error) { console.error("Image compression error for", file.name, error); IErrorMessage.show({ message: `Error compressing ${file.name}.` }); return null; }
    });
    try {
        const newImages = (await Promise.all(imageProcessingPromises)).filter(img => img !== null);
        if (newImages.length > 0) {
            this.setState(prevState => ({
                question: { ...prevState.question, uploadedImages: [...(prevState.question.uploadedImages || []), ...newImages] }
            }));
        }
    } catch (error) { console.error("Error processing images:", error); IErrorMessage.show({ message: "An error occurred adding images."}); } 
    finally {
        this.setState({ isCompressingImages: false });
        if (event.target) event.target.value = null;
    }
  };

  removeUploadedImage = (idToRemove) => {
    this.setState(prevState => {
      const imgToRemove = (prevState.question.uploadedImages || []).find(i => i.id === idToRemove);
      if (imgToRemove && imgToRemove.preview && imgToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imgToRemove.preview);
      }
      return { question: { ...prevState.question, uploadedImages: (prevState.question.uploadedImages || []).filter(i => i.id !== idToRemove) } };
    });
  };

  triggerAttachmentFileInput = () => this.attachmentFileInputRef.current.click();

  handleAttachmentFileSelect = (event) => {
    const newAtt = Array.from(event.target.files).map(file => ({ id: generateId(), file }));
    this.setState(prevState => ({ question: { ...prevState.question, uploadedAttachments: [...(prevState.question.uploadedAttachments || []), ...newAtt] } }));
    if (event.target) event.target.value = null;
  };

  removeUploadedAttachment = (idToRemove) => this.setState(prevState => ({ question: { ...prevState.question, uploadedAttachments: (prevState.question.uploadedAttachments || []).filter(a => a.id !== idToRemove) } }));
  
  handleTypeChange = (event) => {
    const selectedType = event?.target?.value;
    this.setState(prevState => ({ question: { ...prevState.question, type: selectedType } }));
  };

  componentDidMount() {
    this.setState({
      addedOptions:[],
      filteredOptions:[],
    })
    const _this = this;
    $("#" + modalNumber + " form").validate({
      errorClass: "invalid-feedback", errorElement: "div",
      highlight: (el) => !$(el).closest('.rdw-editor-wrapper').length && !$(el).is(':file') && $(el).addClass("is-invalid"),
      unhighlight: (el) => !$(el).closest('.rdw-editor-wrapper').length && !$(el).is(':file') && $(el).removeClass("is-invalid"),
      ignore: ".rdw-editor-wrapper *, .wysiwyg-content, :hidden:not(.form-control):not(select)", 
      async submitHandler(form, event) {
        event.preventDefault();
        if (_this.state.isCompressingImages) { IErrorMessage.show({ message: "Please wait, images are being processed." }); return; }
        if (!_this.state.editorState.getCurrentContent().hasText() && _this.state.editorState.getCurrentContent().getBlockMap().first().getType() !== 'atomic') { IErrorMessage.show({ message: "Description empty." }); return; }
        if (!_this.props.subtopic) { IErrorMessage.show({ message: "Subtopic missing." }); return; }
        if (!_this.state.question.type) { IErrorMessage.show({ message: "Select content type." }); return; } // Validation for type

        _this.setState({ loading: true });
        try {
          const data = {
            name: stateToHTML(_this.state.editorState.getCurrentContent()),
            subtopic: _this.props.subtopic, // Use subtopic from props for consistency
            type: _this.state.question.type,
            videos: (_this.state.question.videos || []).map(v => v.embedUrl),
            images: (_this.state.question.uploadedImages || []).map(img => img.data), 
            attachments: (_this.state.question.uploadedAttachments || []).map(att => att.file.name)
          };
          
          console.log("Saving content with data:", data);
          const { id } = await _this.props.save(data); 
          console.log("Saved content with id:", id);
          _this.setState({selectedQuestion:id,loading:false})
          // _this.hide(); // Will also call resetState
        } catch (error) { 
          _this.setState({ loading: false }); 
          const errorMessage = error?.response?.data?.message || error?.message || "Error saving content.";
          IErrorMessage.show({ message: errorMessage }); 
        }
      }
    });

    const modalId = `#${this.props.modalId}`; // Assuming you pass a unique ID as a prop

    $(modalId).on('shown.bs.modal', () => {
        // Bootstrap's default z-index is 1050. The main content modal is likely there.
        // We set this new modal higher.
        $(modalId).css('z-index', '1060');

        // Find the newly created backdrop for this modal and move it up too.
        // The last backdrop in the body is the one for the newest modal.
        $('.modal-backdrop').last().css('z-index', '1055');
    });

    $(modalId).on('hidden.bs.modal', () => {
        // When this modal closes, check if another modal is still open.
        // If so, re-apply the body class to prevent scrolling.
        if ($('.modal.show').length) {
            $('body').addClass('modal-open');
        }
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.subtopic !== prevProps.subtopic) this.setState(pS => ({ question: { ...pS.question, subtopic: this.props.subtopic||"" } }));
    // For Add modal, type might be pre-filled via prop, or user selects.
    // If props.type changes and current state.question.type is empty or forced, update it.
    if (this.props.type !== prevProps.type && (!this.state.question.type || this.props.forceTypeUpdate)) {
         this.setState(pS => ({ question: { ...pS.question, type: this.props.type||"" } }));
    }
  }

  show = (initialData = {}) => { // initialData is not typically used for a fresh "Add" modal but can be for consistency
    this.resetState(); // Always reset for Add modal to ensure fresh state
    // If there's ever a need to pre-fill parts of an "Add" form based on context:
    if (initialData.name) { /* ... populate editor ... */ }
    this.setState(prevState => ({
        question: { 
            ...prevState.question, // Keep reset state (empty videos, images, etc.)
            type: initialData.type || this.props.type || prevState.question.type || "", // Prioritize prop for type if available
            subtopic: initialData.subtopic || this.props.subtopic || "", // Subtopic from props
        }
    }));
    $("#" + modalNumber).modal({ show: true, backdrop: "static", keyboard: false });
  }

  hide = () => { 
    $("#" + modalNumber).modal("hide"); 
    this.resetState(); // Also reset on hide for "Add" modal
    this.setState({ loading: false, isCompressingImages: false });
  }

  generateLivePreviewHtml = () => {
    const { editorState, question } = this.state; let html = "";
    html += `<div class="editor-preview-content mb-3">${stateToHTML(editorState.getCurrentContent())}</div>`;
    if ((question.videos || []).length) {
        html += `<h5 class="preview-section-title">Videos:</h5><div class="videos-preview-container">`;
        (question.videos || []).forEach(v => { html += `<div class="video-embed-preview-item"><iframe width="100%" height="200" src="${v.embedUrl}" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>`; });
        html += `</div>`;
    }
    if ((question.uploadedImages || []).length) {
        html += `<h5 class="preview-section-title mt-3">Images:</h5><div class="images-preview-container">`;
        (question.uploadedImages || []).forEach(img => { html += `<div class="image-preview-item"><img src="${img.preview}" alt="${img.name}" title="${img.name}" /></div>`; });
        html += `</div>`;
    }
    if ((question.uploadedAttachments || []).length) {
        html += `<h5 class="preview-section-title mt-3">Attachments:</h5><ul class="attachments-preview-list">`;
        (question.uploadedAttachments || []).forEach(att => { html += `<li><i class="fas fa-paperclip mr-1 text-muted"></i> <a href="#" onclick="event.preventDefault(); return false;">${att.file.name}</a> ${att.file.size ? `<small>(${(att.file.size / 1024).toFixed(2)} KB)</small>` : ''}</li>`; });
        html += `</ul>`;
    }
    if (!html.replace(/<[^>]*>/g, '').trim() && !(question.videos || []).length && !(question.uploadedImages || []).length && !(question.uploadedAttachments || []).length) {
        return `<p class="text-muted text-center py-4">Start adding content, videos, images, or attachments to see a preview.</p>`;
    }
    return html;
  }

  render() {
    const { editorState, question = {}, videoUrlsInput, generationPrompt, isGenerating, loading, isCompressingImages } = this.state;
    const livePreviewHTML = this.generateLivePreviewHtml();
    const isSaveDisabled = loading || isGenerating || isCompressingImages;
    const currentVideos = question.videos || [];
    const currentImages = question.uploadedImages || [];
    const currentAttachments = question.uploadedAttachments || [];

    return (
      <div>
        <style>{`
            .modal-actions-bar { 
                padding: 0.75rem 1rem; 
                border-bottom: 1px solid #dee2e6; 
                display: flex; 
                justify-content: flex-end; 
                align-items: center; 
                background-color: #f8f9fa; 
            }
            .modal-actions-bar .btn + .btn { margin-left: 0.5rem; }
            .preview-section-title { font-size: 1.1rem; color: #495057; margin-bottom: 0.5rem; }
            .videos-preview-container { display: flex; flex-wrap: wrap; gap: 15px; }
            .video-embed-preview-item { flex: 1 1 320px; min-width: 280px; }
            .images-preview-container { display: flex; flex-wrap: wrap; gap: 10px; }
            .image-preview-item img { max-width: 120px; max-height:120px; height: auto; border: 1px solid #ddd; border-radius: 4px; object-fit: cover; }
            .attachments-preview-list { list-style: none; padding-left: 0; }
            .attachments-preview-list li { margin-bottom: 0.3rem; font-size: 0.9rem; }
            .rdw-editor-wrapper { border: 1px solid #ced4da; border-radius: .25rem; }
            .rdw-editor-main { min-height: 120px; padding: 5px 10px; font-size:0.9rem; }
            .rdw-editor-toolbar { margin-bottom: 0; border-bottom: 1px solid #ced4da; background-color: #f8f9fa; padding: 4px; }
            
            .preview-column {
                background-color: #f8f9fa; /* Lighter background for contrast */
                border-left: 1px solid #e9ecef;
                padding: 1rem;
                max-height: calc(100vh - 180px); /* Adjust as needed */
                overflow-y: auto;
            }
            .form-column {
                max-height: calc(100vh - 180px); /* Adjust as needed */
                overflow-y: auto;
                padding: 1rem; /* Consistent padding with preview */
            }
            .preview-card {
                background-color: #ffffff; /* White card background */
                border: 1px solid #dee2e6;
                border-radius: .35rem; /* Slightly more rounded */
                box-shadow: 0 .125rem .25rem rgba(0,0,0,.075); /* Subtle shadow */
            }
            .preview-card-body {
                padding: 1.25rem; /* More padding inside the card */
                min-height: 150px;
                font-size:0.9rem;
            }
             .sticky-preview-title { /* Renamed for clarity */
                position: sticky;
                top: -1rem; /* Adjust to align with padding of .preview-column */
                background-color: #f8f9fa; /* Match .preview-column background */
                padding-top: 1rem; /* To push content below it */
                padding-bottom: 0.5rem;
                z-index: 10; /* Ensure it's above scrolling content */
                margin-bottom: 0.5rem; /* Space after title */
            }
        `}</style>

        <div className="modal fade" id={modalNumber} tabIndex={-1} role="dialog" aria-labelledby={`${modalNumber}Label`} aria-hidden="true">
          <div className="modal-dialog modal-xl modal-dialog-centered"> {/* modal-dialog-scrollable removed for column scroll */ }
            <div className="modal-content">
              <form id={`${modalNumber}_form_actual`} className="kt-form" onSubmit={e => e.preventDefault()} noValidate>
                <div className="modal-header py-2">
                  <h5 className="modal-title" id={`${modalNumber}Label`}>{this.props.editingContent ? "Edit Content" : "Create New Content"}</h5>
                  <button type="button" className="close" aria-label="Close" onClick={this.hide}><span aria-hidden="true">×</span></button>
                </div>
                
                {/* Action bar moved above the row for two columns */}
                <div className="modal-actions-bar">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={this.hide} disabled={isSaveDisabled}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-primary" disabled={isSaveDisabled}> 
                      {loading && <span className="spinner-border spinner-border-sm mr-1"/>}
                      {isCompressingImages && <span className="spinner-border spinner-border-sm mr-1"/>}
                      {(loading || isCompressingImages) ? 'Processing...' : (this.props.editingContent ? "Update Content" : "Save Content")}
                    </button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={this.hide} disabled={isSaveDisabled}>Done</button>
                </div>

                <div className="modal-body pt-0"> {/* Removed top padding for modal-body */}
                  <div className="row no-gutters"> {/* no-gutters to remove default column spacing */}
                    {/* Left Column: Form Inputs */}
                    <div className="col-lg-7 form-column">
                        <div className="form-row mb-3">
                            <div className="col-md-9">
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    placeholder="Prompt to generate content (Optional)" 
                                    value={generationPrompt} 
                                    onChange={(e) => this.setState({ generationPrompt: e.target.value })} 
                                    disabled={isGenerating || isSaveDisabled}
                                />
                            </div>
                            <div className="col-md-3">
                                <button 
                                    type="button" 
                                    className="btn btn-sm btn-outline-secondary btn-block" 
                                    onClick={this.handleGenerateContent} 
                                    disabled={isGenerating || isSaveDisabled || !generationPrompt.trim()}
                                >
                                    {isGenerating ? <span className="spinner-border spinner-border-sm"/> : "Generate"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group mb-3">
                            <label className="mb-1 small">Content Description <span className="text-danger">*</span></label>
                            <Editor 
                                ref={this.editorRef} 
                                editorState={editorState} 
                                onEditorStateChange={this.onEditorStateChange} 
                                wrapperClassName="rdw-editor-wrapper" 
                                editorClassName="rdw-editor-main" 
                                toolbarClassName="rdw-editor-toolbar" 
                                toolbar={{ 
                                    options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'], 
                                    image: { previewImage: true, alt: { present: true, mandatory: false }, inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',},
                                    embedded: { defaultSize: { height: 'auto', width: 'auto' },},
                                }}
                                readOnly={isSaveDisabled}
                            />
                        </div>
                        
                        <div className="form-group mb-3">
                            <label className="mb-1 small">Content Type <span className="text-danger">*</span></label>
                            <select 
                                name="type_select" 
                                className="form-control form-control-sm" 
                                value={question.type} 
                                onChange={this.handleTypeChange} 
                                disabled={isSaveDisabled}
                                required
                            >
                                <option value="">Select Type...</option>
                                {contentTypes.map(type => (<option key={type} value={type}>{type.replace('_', ' ')}</option>))}
                            </select>
                        </div>
                        <hr className="mt-2 mb-3"/>

                        <h6 className="mb-2 small text-muted">VIDEOS (YOUTUBE URLS, ONE PER LINE)</h6>
                        <div className="form-group mb-2">
                            <textarea 
                                className="form-control form-control-sm" 
                                rows="2" 
                                placeholder="Paste YouTube video URLs here..." 
                                value={videoUrlsInput} 
                                onChange={this.handleVideoUrlsInputChange} 
                                disabled={isSaveDisabled}
                            />
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary mb-2" 
                            onClick={this.handleAddVideoUrls} 
                            disabled={isSaveDisabled || !videoUrlsInput.trim()}
                        >
                            <i className="fas fa-plus-circle mr-1"></i> Add Videos
                        </button>
                        {currentVideos.length > 0 && (
                            <div className="mb-3 border p-2 rounded" style={{ maxHeight: '280px', overflowY: 'auto', background:'#f8f9fa' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {currentVideos.map((video) => (
                                <div key={video.id} style={{ flex: '0 0 220px', position: 'relative', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '5px', background: '#fff', boxShadow: '0 0 5px rgba(0,0,0,.05)' }}>
                                    <iframe width="100%" height="120" src={video.embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                                    <small className="d-block text-muted text-truncate mt-1" title={video.originalUrl} style={{fontSize: '0.7rem'}}>{video.originalUrl}</small>
                                    <button type="button" className="btn btn-xs btn-danger" style={{ position: 'absolute', top: '3px', right: '3px', zIndex: 10, padding: '0.05rem 0.25rem', fontSize:'0.65rem' }} onClick={() => this.removeVideo(video.id)} disabled={isSaveDisabled} title="Remove"><i className="fas fa-times"></i></button>
                                </div>
                                ))}
                            </div>
                            </div>
                        )}
                        <hr className="mt-2 mb-3"/>

                        <div className="form-row">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <h6 className="mb-2 small text-muted">IMAGES {isCompressingImages && <span className="text-primary">(Compressing...)</span>}</h6>
                                <div className="form-group mb-md-0">
                                    <input type="file" multiple accept="image/*" ref={this.imageFileInputRef} onChange={this.handleImageFileSelect} style={{ display: 'none' }} disabled={isSaveDisabled}/>
                                    <button type="button" className="btn btn-sm btn-outline-info btn-block" onClick={this.triggerImageFileInput} disabled={isSaveDisabled}><i className="fas fa-images mr-1"></i> Add Images</button>
                                </div>
                                {currentImages.length > 0 && (
                                    <div className="mt-2 border rounded p-2" style={{maxHeight: '180px', overflowY:'auto', background:'#f8f9fa'}}>
                                        {currentImages.map((img) => (
                                            <div key={img.id} className="d-flex align-items-center p-1 border-bottom bg-white mb-1 rounded shadow-sm">
                                                <img src={img.preview} alt={img.name} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight:'8px', borderRadius:'3px' }}/>
                                                <small className="text-truncate flex-grow-1 mr-2" title={img.name}>{img.name}
                                                    {img.compressedSize && img.originalSize && ` (${(img.originalSize / 1024).toFixed(0)}KB -> ${(img.compressedSize / 1024).toFixed(0)}KB)`}
                                                </small>
                                                <button type="button" className="btn btn-xs btn-outline-danger" style={{padding:'0.05rem 0.25rem'}} onClick={() => this.removeUploadedImage(img.id)} disabled={isSaveDisabled}><i className="fas fa-times"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6">
                                <h6 className="mb-2 small text-muted">ATTACHMENTS</h6>
                                <div className="form-group mb-0">
                                    <input type="file" multiple ref={this.attachmentFileInputRef} onChange={this.handleAttachmentFileSelect} style={{ display: 'none' }} disabled={isSaveDisabled}/>
                                    <button type="button" className="btn btn-sm btn-outline-secondary btn-block" onClick={this.triggerAttachmentFileInput} disabled={isSaveDisabled}><i className="fas fa-paperclip mr-1"></i> Add Attachments</button>
                                </div>
                                {currentAttachments.length > 0 && (
                                    <ul className="list-unstyled mt-2 mb-0 border rounded p-2" style={{maxHeight: '180px', overflowY:'auto', background:'#f8f9fa'}}>
                                        {currentAttachments.map((att) => (
                                            <li key={att.id} className="d-flex align-items-center p-1 border-bottom bg-white mb-1 rounded shadow-sm">
                                                <i className="fas fa-file-alt mr-2 text-muted"></i>
                                                <small className="text-truncate flex-grow-1 mr-2" title={att.file.name}>{att.file.name}</small>
                                                <button type="button" className="btn btn-xs btn-outline-danger" style={{padding:'0.05rem 0.25rem'}} onClick={() => this.removeUploadedAttachment(att.id)} disabled={isSaveDisabled}><i className="fas fa-times"></i></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div> {/* End Left Column (form-column) */}

                    {/* Right Column: Live Preview */}
                    <div className="col-lg-5 preview-column px-3 py-2">
                        <h6 className="text-center text-muted small sticky-preview-title">LIVE CONTENT PREVIEW</h6>
                        <div className="preview-card"> {/* Added card styling */}
                            <div 
                                className="preview-card-body" // Added card-body for padding
                                dangerouslySetInnerHTML={{ __html: livePreviewHTML }}
                            >
                            </div>
                        </div>

                        {this.state.selectedQuestion && (
                          <div className="col-md-12">
                            <div className="kt-portlet__head">
                              <div className="kt-portlet__head-label">
                                <div className="kt-portlet__head-title">Responses</div>
                              </div>
                              <div style={{ paddingTop: 10 }}>
                                <button type="button" className="btn btn-icon btn-sm pull-right" onClick={() => this.addOptionModalRef.current.show()} title="Add Option">
                                  <i className="la la-plus-circle"></i>
                                </button>
                              </div>
                            </div>
                            <div className="kt-portlet__body">
                              <Search title="answers" onSearch={this.onOptionSearch} value={""} />
                              <Table listId={`options-list-${"selectedQuestion"}`} headers={[{ label: "Answer", key: "value" }]} data={this.state.addedOptions || []} options={{ ...tableOptions, linkable: false, editable: true, deleteable: true }} edit={option => this.setState({ optionToEdit: option }, () => this.editOptionModalRef?.current?.show())} deleteItemProp={option => this.setState({ optionToDelete: option }, () => this.deleteOptionModalRef?.current?.show())} onOrderChange={() => this._handleReorder('option')} />
                            </div>
                          </div>
                        )}
                        {!this.state.selectedQuestion && (
                          <div className="col-md-12">
                            <div className="kt-portlet__head">
                              <div className="kt-portlet__head-label">
                                <div className="kt-portlet__head-title">Responses</div>
                              </div>
                            </div>
                            <div className="kt-portlet__body" style={{ height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                              <p className="text-center small text-muted">Please save content first to be able to add responses.</p>
                            </div>
                          </div>
                        )}

                    </div> {/* End Right Column (preview-column) */}
                  </div> {/* End Row */}
                </div> {/* End modal-body */}
              </form>
            </div>
          </div>
        </div>
        
        {/* --- Render all modals here to pass them props and refs --- */}
        {/* Options */}
        {this.state.selectedQuestion && <AddOptionModal ref={this.addOptionModalRef} save={(data) => this.handleCreate('options', data, this.state.selectedQuestion, 'question')} question={this.state.selectedQuestion} />}
        {this.state.selectedQuestion && <EditOptionModal ref={this.editOptionModalRef} option={this.state.optionToEdit}  edit={(data) => this.handleUpdate('options', data)()} />}
        {this.state.selectedQuestion && <DeleteOptionModal ref={this.deleteOptionModalRef} option={this.state.optionToDelete} delete={() => this.handleDelete('options', this.state.optionToDelete, this.state.selectedQuestion, 'questionId')()} />}
      </div>
    );
  }
}

export default Modal;