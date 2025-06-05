import React from "react";
import ErrorMessage from "../components/error-toast"; // Assuming this path is correct

// --- Draft.js and react-draft-wysiwyg Imports ---
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from 'draft-js-export-html';
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// --- Image Compression ---
import imageCompression from 'browser-image-compression';

const IErrorMessage = new ErrorMessage();
const $ = window.$; // Assuming jQuery is available globally

const contentTypes = ['SINGLECHOICE', 'MULTICHOICE', 'CAMERA']; // Keep consistent with Add modal
const modalNumber = `editContentModal_${Math.random().toString(36).substr(2, 9)}`;
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
        if (embedIdMatch && embedIdMatch[1].length === 11) return url; // Already an embed URL
    }
    return null;
};

class EditContentModal extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = this.getInitialState(props?.question); // Pass initial question data
    this.editorRef = React.createRef();
    this.imageFileInputRef = React.createRef();
    this.attachmentFileInputRef = React.createRef();
  }

  getInitialState = (questionToEdit = {}) => {
    let initialEditorState = EditorState.createEmpty();
    if (questionToEdit.name) {
        // Try to parse as Draft.js raw JSON first (if you ever save it this way)
        try {
            const rawContent = JSON.parse(questionToEdit.name);
            if (rawContent && rawContent.blocks && rawContent.entityMap) {
                const contentState = ContentState.createFromBlockArray(rawContent.blocks, rawContent.entityMap);
                initialEditorState = EditorState.createWithContent(contentState);
            } else {
                throw new Error("Not valid Draft.js raw JSON");
            }
        } catch (e) {
            // Fallback to HTML if not raw JSON or parsing failed
            const blocksFromHtml = htmlToDraft(questionToEdit.name);
            if (blocksFromHtml && blocksFromHtml.contentBlocks) {
                const { contentBlocks, entityMap } = blocksFromHtml;
                initialEditorState = EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocks, entityMap));
            }
        }
    }
    
    // Convert existing videos (array of embed URLs) to the {id, embedUrl, originalUrl} format
    const initialVideos = (questionToEdit.videos || []).map(videoUrlOrObj => {
        if (typeof videoUrlOrObj === 'string') { // If it's just an embed URL string
            const embedUrl = getYoutubeEmbedUrl(videoUrlOrObj); // Validate and normalize
            return embedUrl ? { id: generateId(), embedUrl: embedUrl, originalUrl: videoUrlOrObj } : null;
        } else if (typeof videoUrlOrObj === 'object' && videoUrlOrObj.embedUrl) { // If it's already an object
            return { ...videoUrlOrObj, id: videoUrlOrObj.id || generateId() };
        }
        return null;
    }).filter(v => v);

    // Convert existing images (array of base64 strings)
    const initialImages = (questionToEdit.images || []).map(base64Data => ({
        id: generateId(),
        name: `loaded_image_${generateId().substring(0,5)}.png`, // Placeholder name
        data: base64Data, // This is the base64 to be saved
        preview: base64Data, // Use base64 directly for preview of existing images
        isExisting: true, // Flag to differentiate from newly uploaded
    }));

    // Convert existing attachments (array of file names or objects)
    const initialAttachments = (questionToEdit.attachments || []).map(att => {
        if (typeof att === 'string') { // If just a name
            return { id: generateId(), file: { name: att }, isExisting: true, url: questionToEdit.attachmentUrls?.[att] }; // Assuming attachmentUrls map names to URLs
        } else if (typeof att === 'object' && att.name) { // If an object with name and maybe URL
            return { id: att.id || generateId(), file: { name: att.name, size: att.size || 0 }, isExisting: true, url: att.url };
        }
        return null;
    }).filter(a => a);


    return {
      loading: false,
      isCompressingImages: false,
      question: {
        id: questionToEdit?.id || null, // Crucial for editing
        subtopic: questionToEdit?.subtopic || this.props?.subtopic || "", // Use current subtopic from props as fallback
        type: questionToEdit?.type || "",
        videos: initialVideos,
        uploadedImages: initialImages, // Store existing and new images here
        uploadedAttachments: initialAttachments, // Store existing and new attachments here
        // `name` (HTML content) is derived from editorState on save
      },
      editorState: initialEditorState,
      videoUrlsInput: "",
      generationPrompt: "",
      isGenerating: false,
      attachmentsToRemove: [], // Keep track of existing attachments to be removed
      imagesToRemove: [], // Keep track of existing images to be removed
    };
  };

  resetState = (questionData = this.props.question) => { // Reset based on current/new question prop
    // Clean up old image previews
    this.state.question.uploadedImages.forEach(img => {
      if (img.preview && !img.isExisting && img.preview.startsWith('blob:')) { // Only revoke newly created blob URLs
        URL.revokeObjectURL(img.preview);
      }
    });
    this.setState(this.getInitialState(questionData));
    if (this.imageFileInputRef.current) this.imageFileInputRef.current.value = null;
    if (this.attachmentFileInputRef.current) this.attachmentFileInputRef.current.value = null;
  }

  onEditorStateChange = (editorState) => this.setState({ editorState });

  handleGenerateContent = async () => {
    if (!this.state.generationPrompt.trim()) { IErrorMessage.show({ message: "Please enter a prompt." }); return; }
    this.setState({ isGenerating: true });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    const generatedHtml = `<h2>Appended for: ${this.state.generationPrompt}</h2><p>More example <strong>bold</strong> and <em>italic</em> text.</p>`;
    const blocksFromHtml = htmlToDraft(generatedHtml);
    if (blocksFromHtml) {
      const { contentBlocks, entityMap } = blocksFromHtml;
      // Append to existing content
      this.onEditorStateChange(EditorState.push(this.state.editorState, ContentState.createFromBlockArray(contentBlocks, entityMap), 'insert-fragment'));
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
        if (!this.state.question.videos.some(v => v.embedUrl === embedUrl) && !newVideos.some(v => v.embedUrl === embedUrl)) {
          newVideos.push({ id: generateId(), embedUrl, originalUrl });
        }
      } else { IErrorMessage.show({ message: `Invalid URL: ${originalUrl.substring(0, 40)}...` }); invalidUrlFound = true; }
    });
    if (newVideos.length > 0) {
      this.setState(prevState => ({
        question: { ...prevState.question, videos: [...prevState.question.videos, ...newVideos] },
        videoUrlsInput: ""
      }));
    } else if (!invalidUrlFound) { IErrorMessage.show({ message: "No new valid URLs or duplicates." }); }
  };

  removeVideo = (idToRemove) => this.setState(prevState => ({ question: { ...prevState.question, videos: prevState.question.videos.filter(v => v.id !== idToRemove) } }));

  triggerImageFileInput = () => this.imageFileInputRef.current.click();

  handleImageFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    this.setState({ isCompressingImages: true });
    const imageProcessingPromises = files.map(async (file) => {
      // ... (same compression logic as Add modal)
      if (!file.type.startsWith('image/')) { /* ... */ return null; }
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve({
            id: generateId(), name: compressedFile.name, data: reader.result,
            preview: URL.createObjectURL(compressedFile), originalSize: file.size,
            compressedSize: compressedFile.size, isExisting: false // Mark as new
          });
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      } catch (error) { /* ... */ return null; }
    });
    try {
        const newImages = (await Promise.all(imageProcessingPromises)).filter(img => img !== null);
        if (newImages.length > 0) {
            this.setState(prevState => ({
                question: { ...prevState.question, uploadedImages: [...prevState.question.uploadedImages, ...newImages] }
            }));
        }
    } catch (error) { /* ... */ } 
    finally {
        this.setState({ isCompressingImages: false });
        if (event.target) event.target.value = null;
    }
  };

  removeUploadedImage = (idToRemove) => {
    this.setState(prevState => {
      const imgToRemove = prevState.question.uploadedImages.find(i => i.id === idToRemove);
      if (imgToRemove) {
        if (imgToRemove.preview && !imgToRemove.isExisting && imgToRemove.preview.startsWith('blob:')) {
          URL.revokeObjectURL(imgToRemove.preview);
        }
        // If it's an existing image, mark it for removal on the backend
        const imagesToRemove = imgToRemove.isExisting 
            ? [...prevState.imagesToRemove, imgToRemove.id] // or imgToRemove.original_identifier if you have one
            : prevState.imagesToRemove; 
        return { 
            question: { ...prevState.question, uploadedImages: prevState.question.uploadedImages.filter(i => i.id !== idToRemove) },
            imagesToRemove 
        };
      }
      return prevState;
    });
  };

  triggerAttachmentFileInput = () => this.attachmentFileInputRef.current.click();

  handleAttachmentFileSelect = (event) => {
    const newAtt = Array.from(event.target.files).map(file => ({ id: generateId(), file, isExisting: false }));
    this.setState(prevState => ({ question: { ...prevState.question, uploadedAttachments: [...prevState.question.uploadedAttachments, ...newAtt] } }));
    if (event.target) event.target.value = null;
  };

  removeUploadedAttachment = (idToRemove) => {
    this.setState(prevState => {
        const attToRemove = prevState.question.uploadedAttachments.find(a => a.id === idToRemove);
        const attachmentsToRemove = attToRemove && attToRemove.isExisting
            ? [...prevState.attachmentsToRemove, attToRemove.id] // or attToRemove.original_identifier
            : prevState.attachmentsToRemove;
        return { 
            question: { ...prevState.question, uploadedAttachments: prevState.question.uploadedAttachments.filter(a => a.id !== idToRemove) },
            attachmentsToRemove
        };
    });
  };
  
  handleTypeChange = (event) => {
    this.setState(prevState => ({ question: { ...prevState.question, type: event.target.value } }));
  };

  componentDidMount() {
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
        if (!_this.state.question.subtopic) { IErrorMessage.show({ message: "Subtopic missing." }); return; }
        if (!_this.state.question.type) { IErrorMessage.show({ message: "Select content type." }); return; }
        if (!_this.state.question.id) { IErrorMessage.show({ message: "Content ID missing. Cannot update."}); return; }

        _this.setState({ loading: true });
        try {
          const data = {
            id: _this.state.question.id, // Include ID for update
            name: stateToHTML(_this.state.editorState.getCurrentContent()),
            subtopic: _this.state.question.subtopic, // Use subtopic from state, which should be up-to-date
            type: _this.state.question.type,
            videos: _this.state.question.videos.map(v => v.embedUrl), // Send only embed URLs
            
            // Separate new images from existing ones for backend processing
            new_images: _this.state.question.uploadedImages.filter(img => !img.isExisting).map(img => img.data), // Base64 of new compressed images
            existing_images: _this.state.question.uploadedImages.filter(img => img.isExisting).map(img => img.data), // Or send original identifiers if backend prefers
            images_to_remove: _this.state.imagesToRemove, // IDs of existing images to delete

            // Similar for attachments
            new_attachments: _this.state.question.uploadedAttachments.filter(att => !att.isExisting).map(att => att.file), // Send actual File objects for new ones
            existing_attachments: _this.state.question.uploadedAttachments.filter(att => att.isExisting).map(att => att.file.name), // Names of existing ones to keep
            attachments_to_remove: _this.state.attachmentsToRemove, // IDs of existing attachments to delete
          };

          // Your props.edit should handle a FormData object if sending files, or a JSON object if sending base64/names
          // For simplicity here, assuming props.edit can take this structured 'data' object.
          // If sending files, you'd construct FormData:
          // const formData = new FormData();
          // Object.keys(data).forEach(key => {
          //   if (key === 'new_images' || key === 'new_attachments') { // Example for file arrays
          //     data[key].forEach(file => formData.append(`${key}[]`, file));
          //   } else if (Array.isArray(data[key])) {
          //       data[key].forEach(item => formData.append(`${key}[]`, item));
          //   } else {
          //       formData.append(key, data[key]);
          //   }
          // });
          // await _this.props.edit(formData); 
          
          await _this.props.edit(data); // Pass the structured data object
          _this.hide();
          // Parent component (BasicTable) should handle success message and data refresh via subscription
        } catch (error) { 
          _this.setState({ loading: false }); 
          const errorMessage = error?.response?.data?.message || error?.message || "Error updating content.";
          IErrorMessage.show({ message: errorMessage }); 
        }
      }
    });
  }

  componentDidUpdate(prevProps) {
    // If the 'question' prop itself changes (e.g., parent selects a different item to edit)
    if (this.props.question && prevProps.question !== this.props.question) {
        if (!this.props.question.id || (prevProps.question && prevProps.question.id !== this.props.question.id)) {
            this.resetState(this.props.question); // Re-initialize with the new question
        }
    } else if (!this.props.question && prevProps.question) {
        this.resetState(null); // Reset if question is removed
    }

    // If the subtopic prop changes and it's different from the one in state (e.g., parent navigates while modal is prepped)
    if (this.props.subtopic !== prevProps.subtopic && this.props.subtopic !== this.state.question.subtopic) {
        this.setState(prevState => ({
            question: { ...prevState.question, subtopic: this.props.subtopic || "" }
        }));
    }
  }

  show = (questionData) => { // questionData is the full question object to edit
    this.resetState(questionData || this.props.question); // Prioritize explicitly passed data
    $("#" + modalNumber).modal({ show: true, backdrop: "static", keyboard: false });
  }

  hide = () => { 
    $("#" + modalNumber).modal("hide"); 
    this.setState({ loading: false, isCompressingImages: false });
    // Don't reset state here entirely, parent might reopen with same data.
    // resetState is called in show() or if props change significantly.
  }

  generateLivePreviewHtml = () => {
    const { editorState, question } = this.state; let html = "";
    html += `<div class="editor-preview-content mb-3">${stateToHTML(editorState.getCurrentContent())}</div>`;
    if (question.videos.length) { /* ... same as Add modal ... */ 
        html += `<h5 class="preview-section-title">Videos:</h5><div class="videos-preview-container">`;
        question.videos.forEach(v => { html += `<div class="video-embed-preview-item"><iframe width="100%" height="200" src="${v.embedUrl}" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>`; });
        html += `</div>`;
    }
    if (question.uploadedImages.length) { /* ... same as Add modal ... */ 
        html += `<h5 class="preview-section-title mt-3">Images:</h5><div class="images-preview-container">`;
        question.uploadedImages.forEach(img => { html += `<div class="image-preview-item"><img src="${img.preview}" alt="${img.name}" title="${img.name}" /></div>`; });
        html += `</div>`;
    }
    if (question.uploadedAttachments.length) { /* ... same as Add modal ... */ 
        html += `<h5 class="preview-section-title mt-3">Attachments:</h5><ul class="attachments-preview-list">`;
        question.uploadedAttachments.forEach(att => { 
            const displayName = att.file?.name || (att.isExisting && 'Existing File');
            const displaySize = att.file?.size ? `(${(att.file.size / 1024).toFixed(2)} KB)` : '';
            const link = att.url ? `<a href="${att.url}" target="_blank" rel="noopener noreferrer">${displayName}</a>` : `<a href="#" onclick="event.preventDefault(); return false;">${displayName}</a>`;
            html += `<li><i class="fas fa-paperclip mr-1 text-muted"></i> ${link} <small>${displaySize}</small></li>`; 
        });
        html += `</ul>`;
    }
    if (!html.replace(/<[^>]*>/g, '').trim() && !question.videos.length && !question.uploadedImages.length && !question.uploadedAttachments.length) return `<p class="text-muted text-center py-4">Start adding content, videos, images, or attachments to see a preview.</p>`;
    return html;
  }

  render() {
    const { editorState, question, videoUrlsInput, generationPrompt, isGenerating, loading, isCompressingImages } = this.state;
    const livePreviewHTML = this.generateLivePreviewHtml();
    const isSaveDisabled = loading || isGenerating || isCompressingImages;

    return (
      <div>
        <style>{`
            /* ... (same styles as Add modal) ... */
            .modal-actions-bar { padding: 0.75rem 1rem; border-bottom: 1px solid #dee2e6; display: flex; justify-content: flex-end; align-items: center; background-color: #f8f9fa; margin-bottom: 1rem; }
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
        `}</style>

        <div className="modal fade" id={modalNumber} tabIndex={-1} role="dialog" aria-labelledby={`${modalNumber}Label`} aria-hidden="true">
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <form id={`${modalNumber}_form_actual`} className="kt-form" onSubmit={e => e.preventDefault()} noValidate>
                <div className="modal-header py-2">
                  <h5 className="modal-title" id={`${modalNumber}Label`}>Edit Content</h5>
                  <button type="button" className="close" aria-label="Close" onClick={this.hide}><span aria-hidden="true">×</span></button>
                </div>

                <div className="modal-body pt-2">
                  <div className="modal-actions-bar">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={this.hide} disabled={isSaveDisabled}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-primary" disabled={isSaveDisabled}> 
                      {loading && <span className="spinner-border spinner-border-sm mr-1"/>}
                      {isCompressingImages && <span className="spinner-border spinner-border-sm mr-1"/>}
                      {(loading || isCompressingImages) ? 'Processing...' : "Update Content"}
                    </button>
                  </div>

                  {/* Prompt for appending content */}
                  <div className="form-row mb-3">
                    <div className="col-md-9">
                        <input type="text" className="form-control form-control-sm" placeholder="Prompt to generate & append content (Optional)" value={generationPrompt} onChange={(e) => this.setState({ generationPrompt: e.target.value })} disabled={isGenerating || isSaveDisabled}/>
                    </div>
                    <div className="col-md-3">
                        <button type="button" className="btn btn-sm btn-outline-secondary btn-block" onClick={this.handleGenerateContent} disabled={isGenerating || isSaveDisabled || !generationPrompt.trim()}>
                            {isGenerating ? <span className="spinner-border spinner-border-sm"/> : "Generate & Append"}
                        </button>
                    </div>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="mb-1 small">Content Description <span className="text-danger">*</span></label>
                    <Editor 
                        ref={this.editorRef} 
                        editorState={editorState} 
                        onEditorStateChange={this.onEditorStateChange} 
                        wrapperClassName="rdw-editor-wrapper" editorClassName="rdw-editor-main" toolbarClassName="rdw-editor-toolbar" 
                        toolbar={{ /* ... (same toolbar options as Add) ... */ 
                            options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'], 
                            image: { previewImage: true, alt: { present: true, mandatory: false }, inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',},
                            embedded: { defaultSize: { height: 'auto', width: 'auto' } },
                        }}
                        readOnly={loading || isCompressingImages}
                    />
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="mb-1 small">Content Type <span className="text-danger">*</span></label>
                    <select name="type_select" className="form-control form-control-sm" value={question.type} onChange={this.handleTypeChange} disabled={isSaveDisabled} required>
                        <option value="">Select Type...</option>
                        {contentTypes.map(type => (<option key={type} value={type}>{type.replace('_', ' ')}</option>))}
                    </select>
                  </div>
                  <hr className="mt-2 mb-3"/>

                  {/* Video Section */}
                  <h6 className="mb-2 small text-muted">VIDEOS (YOUTUBE URLS, ONE PER LINE)</h6>
                  <div className="form-group mb-2">
                    <textarea className="form-control form-control-sm" rows="2" placeholder="Paste YouTube video URLs here..." value={videoUrlsInput} onChange={this.handleVideoUrlsInputChange} disabled={isSaveDisabled}/>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-primary mb-2" onClick={this.handleAddVideoUrls} disabled={isSaveDisabled || !videoUrlsInput.trim()}>
                    <i className="fas fa-plus-circle mr-1"></i> Add Videos
                  </button>
                  {question.videos.length > 0 && (
                    <div className="mb-3 border p-2 rounded" style={{ maxHeight: '280px', overflowY: 'auto', background:'#f8f9fa' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {question.videos.map((video) => (
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

                  {/* Image and Attachment Sections */}
                  <div className="form-row">
                    <div className="col-md-6">
                        <h6 className="mb-2 small text-muted">IMAGES {isCompressingImages && <span className="text-primary">(Compressing...)</span>}</h6>
                        <div className="form-group mb-md-0">
                            <input type="file" multiple accept="image/*" ref={this.imageFileInputRef} onChange={this.handleImageFileSelect} style={{ display: 'none' }} disabled={isSaveDisabled}/>
                            <button type="button" className="btn btn-sm btn-outline-info btn-block" onClick={this.triggerImageFileInput} disabled={isSaveDisabled}><i className="fas fa-images mr-1"></i> Add/Replace Images</button>
                        </div>
                        {question.uploadedImages.length > 0 && (
                            <div className="mt-2 border rounded p-2" style={{maxHeight: '180px', overflowY:'auto', background:'#f8f9fa'}}>
                                {question.uploadedImages.map((img) => (
                                    <div key={img.id} className="d-flex align-items-center p-1 border-bottom bg-white mb-1 rounded shadow-sm">
                                        <img src={img.preview} alt={img.name} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight:'8px', borderRadius:'3px' }}/>
                                        <small className="text-truncate flex-grow-1 mr-2" title={img.name}>
                                            {img.name} {img.isExisting ? <span className="badge badge-light">Existing</span> : (img.compressedSize && img.originalSize && `(${(img.originalSize / 1024).toFixed(0)}KB -> ${(img.compressedSize / 1024).toFixed(0)}KB)`) }
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
                            <button type="button" className="btn btn-sm btn-outline-secondary btn-block" onClick={this.triggerAttachmentFileInput} disabled={isSaveDisabled}><i className="fas fa-paperclip mr-1"></i> Add/Replace Attachments</button>
                        </div>
                        {question.uploadedAttachments.length > 0 && (
                            <ul className="list-unstyled mt-2 mb-0 border rounded p-2" style={{maxHeight: '180px', overflowY:'auto', background:'#f8f9fa'}}>
                                {question.uploadedAttachments.map((att) => (
                                    <li key={att.id} className="d-flex align-items-center p-1 border-bottom bg-white mb-1 rounded shadow-sm">
                                        <i className="fas fa-file-alt mr-2 text-muted"></i>
                                        <small className="text-truncate flex-grow-1 mr-2" title={att.file.name}>
                                            {att.file.name} {att.isExisting && <span className="badge badge-light">Existing</span>}
                                        </small>
                                        <button type="button" className="btn btn-xs btn-outline-danger" style={{padding:'0.05rem 0.25rem'}} onClick={() => this.removeUploadedAttachment(att.id)} disabled={isSaveDisabled}><i className="fas fa-times"></i></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                  </div>
                  <hr className="mt-3 mb-3"/>
                  
                  <h6 className="mb-2 text-center text-muted small">LIVE CONTENT PREVIEW</h6>
                  {/* <div className="border p-3 rounded" style={{ backgroundColor: '#fdfdfd', maxHeight: '100px', fontSize:'0.9rem', maxHeight: '400px', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: livePreviewHTML }}></div> */}
                </div> {/* End of modal-body */}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
// Expected props for EditContentModal:
// - question (Object): The existing content data to edit.
//   - id (String/Number, required for edit)
//   - name (String): HTML content (or Raw Draft.js JSON string if you adapt saving)
//   - subtopic (String/Number, required)
//   - type (String, required)
//   - videos (Array of Strings - embed URLs, Optional)
//   - images (Array of Strings - base64 image data, Optional)
//   - attachments (Array of Strings - file names, or objects with {name, url}, Optional)
//   - attachmentUrls (Object, Optional): A map of attachment names to their URLs if attachments are just names.
// - subtopic (String/Number): The current subtopic context (passed from BasicTable)
// - edit (Function): Async function that accepts the data object (or FormData) and handles the update.
// - (Optional) onUpdate: Callback after successful update (though usually handled by BasicTable's subscription).

export default EditContentModal;