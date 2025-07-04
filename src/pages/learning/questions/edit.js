import React from "react";
import PropTypes from 'prop-types';
import ErrorMessage from "../components/error-toast";

// --- Draft.js and react-draft-wysiwyg Imports ---
import { EditorState, ContentState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from 'draft-js-export-html';
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// --- Data, Utils, and Components ---
import Data from "../../../utils/data";
import imageCompression from 'browser-image-compression';
import AddOptionModal from "../options/add";
import EditOptionModal from "../options/edit";
import DeleteOptionModal from "../options/delete";
import Table from "../components/table";

// --- Global Dependencies ---
const toastr = window.toastr;
const $ = window.$;
const IErrorMessage = new ErrorMessage();

// --- Constants ---
const modalId = `modal-edit-content-${Math.random().toString().split(".")[1]}`;
const contentTypes = ['SINGLECHOICE', 'MULTICHOICE', 'CAMERA'];
const generateId = () => `item_${Math.random().toString(36).substr(2, 9)}`;
const tableOptions = { reorderable: true, editable: true, deleteable: true };

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

class EditQuestionModal extends React.Component {
  // Refs for child modals and the form itself
  addOptionModalRef = React.createRef();
  editOptionModalRef = React.createRef();
  deleteOptionModalRef = React.createRef();
  formRef = React.createRef();
  imageFileInputRef = React.createRef();
  attachmentFileInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState = () => ({
    loading: false,
    isCompressingImages: false,
    editorState: EditorState.createEmpty(),
    questionState: {
      id: null,
      subtopic: "",
      type: 'SINGLECHOICE',
      videos: [],
      uploadedImages: [],
      uploadedAttachments: [],
    },
    videoUrlsInput: "",
    addedOptions: [],
    filteredOptions: [],
    optionToEdit: {},
    optionToDelete: {},
  });

  // --- LIFECYCLE MANAGEMENT ---
  componentDidMount() {
    $(this.formRef.current).validate({
      errorClass: "invalid-feedback", errorElement: "div",
      highlight: (el) => !$(el).closest('.rdw-editor-wrapper').length && $(el).addClass("is-invalid"),
      unhighlight: (el) => !$(el).closest('.rdw-editor-wrapper').length && $(el).removeClass("is-invalid"),
      ignore: ".rdw-editor-wrapper *, .wysiwyg-content, :hidden:not(.form-control):not(select)",
    });
    $(`#${modalId}`).on('hidden.bs.modal', this.props.onClose);
  }

  componentDidUpdate(prevProps) {
    const hasNewQuestion = this.props.question && this.props.question.id;
    const hadOldQuestion = prevProps.question && prevProps.question.id;
    const isDifferentQuestion = hasNewQuestion && hadOldQuestion && this.props.question.id !== prevProps.question.id;

    if (hasNewQuestion && (!hadOldQuestion || isDifferentQuestion)) {
        this.initializeFromProps(this.props.question);
        if(!hadOldQuestion) $(`#${modalId}`).modal('show');
    } else if (!hasNewQuestion && hadOldQuestion) {
        $(`#${modalId}`).modal('hide');
        this.resetState();
    }
  }

  componentWillUnmount() {
    if ($(this.formRef.current).data('validator')) $(this.formRef.current).data('validator').destroy();
    $(`#${modalId}`).off('hidden.bs.modal', this.props.onClose);
    $(`#${modalId}`).modal('hide');
  }

  show = () => {
    $(`#${modalId}`).modal({
      show: true,
      backdrop: "static",
      keyboard: false,
    });
  };

  hide = () => {
    $(`#${modalId}`).modal("hide");
  };

  resetState = () => {
    (this.state.questionState.uploadedImages || []).forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview);
    });
    this.setState(this.getInitialState());
    if ($(this.formRef.current).data('validator')) $(this.formRef.current).data('validator').resetForm();
  }

  // --- DATA INITIALIZATION ---
  initializeFromProps = (content) => {
    let editorState = EditorState.createEmpty();
    if (content.name) {
      const blocksFromHtml = htmlToDraft(content.name);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        editorState = EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocks, entityMap));
      }
    }

    const videos = (content.videos || []).map(url => ({ id: generateId(), embedUrl: getYoutubeEmbedUrl(url), originalUrl: url, isExisting: true }));
    const uploadedImages = (content.images || []).map(url => ({ id: generateId(), name: url.split('/').pop(), preview: url, isExisting: true }));
    const uploadedAttachments = (content.attachments || []).map(att => ({ id: generateId(), file: { name: att.name, url: att.url }, isExisting: true }));
    const options = content.options || [];

    this.setState({
      editorState,
      questionState: {
        id: content.id,
        type: content.type || 'SINGLECHOICE',
        subtopic: this.props.subtopic,
        videos,
        uploadedImages,
        uploadedAttachments,
      },
      addedOptions: options,
      filteredOptions: options,
    });
  }

  // --- SUBMIT HANDLER ---
  handleSubmit = async (event) => {
    event.preventDefault();
    if (!$(this.formRef.current).valid()) return;
    if (this.state.isCompressingImages) { IErrorMessage.show({ message: "Please wait, images are processing." }); return; }
    if (!this.state.editorState.getCurrentContent().hasText()) { IErrorMessage.show({ message: "Content description cannot be empty." }); return; }

    this.setState({ loading: true });
    try {
      const { questionState, editorState } = this.state;
      const payload = {
        id: questionState.id,
        name: stateToHTML(editorState.getCurrentContent()),
        type: questionState.type,
        videos: (questionState.videos || []).map(v => v.originalUrl),
        // The backend needs to differentiate between new file data and existing URLs.
        // Sending the `isExisting` flag or separating into `newImages` / `existingImages` are common patterns.
        images: questionState.uploadedImages,
        attachments: questionState.uploadedAttachments,
      };

      await this.props.edit(payload);
      toastr.success("Content has been updated successfully!", "Update Content");
      // this.props.onClose();
      this.hide();

    } catch (error) {
      console.error(error)
      const errorMessage = error?.response?.data?.message || "An error occurred during update.";
      IErrorMessage.show({ message: errorMessage });
    } finally {
      this.setState({ loading: false });
    }
  }

  // --- FORM HANDLERS ---
  onEditorStateChange = (editorState) => this.setState({ editorState });

  handleTypeChange = (event) => {
    const selectedType = event.target.value;
    this.setState(prevState => ({
      questionState: { ...prevState.questionState, type: selectedType }
    }));
  };

  handleVideoUrlsInputChange = (event) => this.setState({ videoUrlsInput: event.target.value });

  handleAddVideoUrls = () => {
    const urls = this.state.videoUrlsInput.split('\n').map(url => url.trim()).filter(url => url);
    if (!urls.length) { IErrorMessage.show({ message: "Please enter YouTube URLs." }); return; }
    const newVideos = []; let invalidUrlFound = false;
    urls.forEach(originalUrl => {
      const embedUrl = getYoutubeEmbedUrl(originalUrl);
      if (embedUrl) {
        if (!(this.state.questionState.videos || []).some(v => v.embedUrl === embedUrl) && !newVideos.some(v => v.embedUrl === embedUrl)) {
          newVideos.push({ id: generateId(), embedUrl, originalUrl });
        }
      } else { IErrorMessage.show({ message: `Invalid URL: ${originalUrl.substring(0, 40)}...` }); invalidUrlFound = true; }
    });
    if (newVideos.length > 0) {
      this.setState(prevState => ({
        questionState: { ...prevState.questionState, videos: [...prevState.questionState.videos, ...newVideos] },
        videoUrlsInput: ""
      }));
    } else if (!invalidUrlFound) { IErrorMessage.show({ message: "No new valid URLs or all are duplicates." }); }
  };

  removeVideo = (idToRemove) => this.setState(prevState => ({
    questionState: { ...prevState.questionState, videos: prevState.questionState.videos.filter(v => v.id !== idToRemove) }
  }));

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
        return {
          id: generateId(), name: compressedFile.name, data: compressedFile, // Send file object directly
          preview: URL.createObjectURL(compressedFile), originalSize: file.size,
          compressedSize: compressedFile.size,
        };
      } catch (error) { console.error("Image compression error for", file.name, error); IErrorMessage.show({ message: `Error compressing ${file.name}.` }); return null; }
    });
    try {
      const newImages = (await Promise.all(imageProcessingPromises)).filter(img => img !== null);
      if (newImages.length > 0) {
        this.setState(prevState => ({
          questionState: { ...prevState.questionState, uploadedImages: [...prevState.questionState.uploadedImages, ...newImages] }
        }));
      }
    } catch (error) { console.error("Error processing images:", error); IErrorMessage.show({ message: "An error occurred adding images." }); }
    finally {
      this.setState({ isCompressingImages: false });
      if (event.target) event.target.value = null;
    }
  };

  removeUploadedImage = (idToRemove) => {
    this.setState(prevState => {
      const imgToRemove = prevState.questionState.uploadedImages.find(i => i.id === idToRemove);
      if (imgToRemove && imgToRemove.preview && imgToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imgToRemove.preview);
      }
      return { questionState: { ...prevState.questionState, uploadedImages: prevState.questionState.uploadedImages.filter(i => i.id !== idToRemove) } };
    });
  };

  triggerAttachmentFileInput = () => this.attachmentFileInputRef.current.click();

  handleAttachmentFileSelect = (event) => {
    const newAtt = Array.from(event.target.files).map(file => ({ id: generateId(), file }));
    this.setState(prevState => ({
      questionState: { ...prevState.questionState, uploadedAttachments: [...prevState.questionState.uploadedAttachments, ...newAtt] }
    }));
    if (event.target) event.target.value = null;
  };

  removeUploadedAttachment = (idToRemove) => this.setState(prevState => ({
    questionState: { ...prevState.questionState, uploadedAttachments: prevState.questionState.uploadedAttachments.filter(a => a.id !== idToRemove) }
  }));

  // --- Option/Response Handlers ---
  handleOptionCreated = (newOption) => this.setState(p => ({ addedOptions: [...p.addedOptions, newOption], filteredOptions: [...p.filteredOptions, newOption] }));
  handleOptionDeleted = (deletedOptionId) => this.setState(p => ({ addedOptions: p.addedOptions.filter(o => o.id !== deletedOptionId), filteredOptions: p.filteredOptions.filter(o => o.id !== deletedOptionId) }));
  handleOptionUpdated = (updatedOption) => this.setState(p => ({ addedOptions: p.addedOptions.map(o => o.id === updatedOption.id ? updatedOption : o), filteredOptions: p.filteredOptions.map(o => o.id === updatedOption.id ? updatedOption : o) }));

  // --- Live Preview Generator ---
  generateLivePreviewHtml = () => {
    const { editorState, questionState } = this.state; let html = "";
    html += `<div class="editor-preview-content mb-3">${stateToHTML(editorState.getCurrentContent())}</div>`;
    if (questionState.videos.length) {
      html += `<h5 class="preview-section-title">Videos:</h5><div class="videos-preview-container">`;
      questionState.videos.forEach(v => { html += `<div class="video-embed-preview-item"><iframe width="100%" height="200" src="${v.embedUrl}" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>`; });
      html += `</div>`;
    }
    if (questionState.uploadedImages.length) {
      html += `<h5 class="preview-section-title mt-3">Images:</h5><div class="images-preview-container">`;
      questionState.uploadedImages.forEach(img => { html += `<div class="image-preview-item"><img src="${img.preview}" alt="${img.name}" title="${img.name}" /></div>`; });
      html += `</div>`;
    }
    if (questionState.uploadedAttachments.length) {
      html += `<h5 class="preview-section-title mt-3">Attachments:</h5><ul class="attachments-preview-list">`;
      questionState.uploadedAttachments.forEach(att => { html += `<li><i class="fas fa-paperclip mr-1 text-muted"></i> <a href="#" onclick="event.preventDefault(); return false;">${att.file.name}</a> ${att.file.size ? `<small>(${(att.file.size / 1024).toFixed(2)} KB)</small>` : ''}</li>`; });
      html += `</ul>`;
    }
    if (!html.replace(/<[^>]*>/g, '').trim() && !questionState.videos.length && !questionState.uploadedImages.length && !questionState.uploadedAttachments.length) {
      return `<p class="text-muted text-center py-4">Start adding content to see a live preview.</p>`;
    }
    return html;
  }

  render() {
    const { editorState, questionState, loading, isCompressingImages, videoUrlsInput, filteredOptions, optionToEdit, optionToDelete } = this.state;
    const isSaveDisabled = loading || isCompressingImages;
    const livePreviewHTML = this.generateLivePreviewHtml();

    if (!this.props.question || !this.props.question.id) return null;

    const correctOptionIds = filteredOptions.filter(o => o.correct).map(o => o.id);

    return (
      <div>
        <style>{`
            .modal-xl { max-width: 90%; }
            .modal-body-columns { display: flex; padding: 0; }
            .form-column { flex: 7; padding: 1.5rem; overflow-y: auto; border-right: 1px solid #dee2e6; }
            .preview-column { flex: 5; padding: 1.5rem; overflow-y: auto; background-color: #f8f9fa; }
            .modal-content-full-height { max-height: calc(100vh - 120px); overflow-y: auto; }
            .sticky-preview-title { position: sticky; top: -1.5rem; background-color: #f8f9fa; padding: 1rem 0; z-index: 10; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
            .preview-card { background-color: #ffffff; border: 1px solid #dee2e6; border-radius: .35rem; box-shadow: 0 .125rem .25rem rgba(0,0,0,.075); min-height: 150px; }
            .preview-card-body { padding: 1.25rem; font-size:0.9rem; }
            .preview-section-title { font-size: 1.1rem; color: #495057; margin-bottom: 0.5rem; }
            .videos-preview-container { display: flex; flex-wrap: wrap; gap: 15px; }
            .video-embed-preview-item { flex: 1 1 320px; min-width: 280px; }
            .images-preview-container { display: flex; flex-wrap: wrap; gap: 10px; }
            .image-preview-item img { max-width: 120px; max-height:120px; height: auto; border: 1px solid #ddd; border-radius: 4px; object-fit: cover; }
            .attachments-preview-list { list-style: none; padding-left: 0; }
            .attachments-preview-list li { margin-bottom: 0.3rem; font-size: 0.9rem; }
            .rdw-editor-wrapper { border: 1px solid #ced4da; border-radius: .25rem; }
            .rdw-editor-main { min-height: 150px; padding: 10px; font-size: 0.95rem; }
            .rdw-editor-toolbar { margin-bottom: 0; border-bottom: 1px solid #ced4da; background-color: #f8f9fa; padding: 4px; }
            .section-card { border: 1px solid #e9ecef; border-radius: 0.3rem; margin-bottom: 1.5rem; }
            .section-card-header { background-color: #f8f9fa; padding: 0.5rem 1rem; font-weight: 600; font-size: 0.9rem; }
            .section-card-body { padding: 1rem; }
        `}</style>
        <div className="modal fade" id={modalId} tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content modal-content-full-height">
              <form ref={this.formRef} onSubmit={this.handleSubmit} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Content</h5>
                  <button type="button" className="close" onClick={this.props.onClose} disabled={isSaveDisabled}><span aria-hidden="true">×</span></button>
                </div>
                <div className="modal-body modal-body-columns">
                  {/* Left Column: Form Inputs */}
                  <div className="form-column">
                    <div className="form-group mb-4">
                      <label className="font-weight-bold">Content Description <span className="text-danger">*</span></label>
                      <Editor editorState={editorState} onEditorStateChange={this.onEditorStateChange} wrapperClassName="rdw-editor-wrapper" editorClassName="rdw-editor-main" toolbarClassName="rdw-editor-toolbar" readOnly={isSaveDisabled} />
                    </div>

                    <div className="form-group mb-4">
                      <label htmlFor="contentTypeSelect" className="font-weight-bold">Content Type <span className="text-danger">*</span></label>
                      <select id="contentTypeSelect" name="type_select" className="form-control" value={questionState.type} onChange={this.handleTypeChange} disabled={isSaveDisabled} required >
                        <option value="">Select Type...</option>
                        {contentTypes.map(type => (<option key={type} value={type}>{type.replace('_', ' ')}</option>))}
                      </select>
                    </div>

                    <div className="section-card">
                      <div className="section-card-header">Videos (YouTube)</div>
                      <div className="section-card-body">
                        <textarea className="form-control form-control-sm mb-2" rows="2" placeholder="Paste YouTube video URLs here (one per line)..." value={videoUrlsInput} onChange={this.handleVideoUrlsInputChange} disabled={isSaveDisabled} />
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={this.handleAddVideoUrls} disabled={isSaveDisabled || !videoUrlsInput.trim()}><i className="fas fa-plus-circle mr-1"></i> Add Videos</button>
                        {questionState.videos.length > 0 && (
                          <div className="mt-3 border p-2 rounded" style={{ maxHeight: '280px', overflowY: 'auto', background: '#f8f9fa' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {questionState.videos.map((video) => (
                                <div key={video.id} className="card" style={{ flex: '0 0 220px', position: 'relative' }}>
                                  <iframe width="100%" height="120" src={video.embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope;" allowFullScreen></iframe>
                                  <small className="d-block text-muted text-truncate p-1" title={video.originalUrl} style={{ fontSize: '0.7rem' }}>{video.originalUrl}</small>
                                  <button type="button" className="btn btn-xs btn-danger" style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 10, padding: '0.1rem 0.35rem', fontSize: '0.65rem' }} onClick={() => this.removeVideo(video.id)} disabled={isSaveDisabled} title="Remove"><i className="fas fa-times"></i></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="col-md-6">
                        <div className="section-card">
                          <div className="section-card-header">Images {isCompressingImages && <span className="text-primary font-weight-normal">(Compressing...)</span>}</div>
                          <div className="section-card-body">
                            <input type="file" multiple accept="image/*" ref={this.imageFileInputRef} onChange={this.handleImageFileSelect} style={{ display: 'none' }} disabled={isSaveDisabled} />
                            <button type="button" className="btn btn-sm btn-outline-info btn-block" onClick={this.triggerImageFileInput} disabled={isSaveDisabled}><i className="fas fa-images mr-1"></i> Add Images</button>
                            {questionState.uploadedImages.length > 0 && (
                              <div className="mt-2 border rounded p-2" style={{ maxHeight: '180px', overflowY: 'auto', background: '#f8f9fa' }}>
                                {questionState.uploadedImages.map((img) => (
                                  <div key={img.id} className="d-flex align-items-center p-1 border-bottom bg-white mb-1 rounded shadow-sm">
                                    <img src={img.preview} alt={img.name} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '8px', borderRadius: '3px' }} />
                                    <small className="text-truncate flex-grow-1 mr-2" title={img.name}>{img.name} {img.compressedSize && `(${(img.compressedSize / 1024).toFixed(0)}KB)`}</small>
                                    <button type="button" className="btn btn-xs btn-outline-danger" style={{ padding: '0.05rem 0.25rem' }} onClick={() => this.removeUploadedImage(img.id)} disabled={isSaveDisabled}><i className="fas fa-times"></i></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="section-card">
                          <div className="section-card-header">Attachments</div>
                          <div className="section-card-body">
                            <input type="file" multiple ref={this.attachmentFileInputRef} onChange={this.handleAttachmentFileSelect} style={{ display: 'none' }} disabled={isSaveDisabled} />
                            <button type="button" className="btn btn-sm btn-outline-secondary btn-block" onClick={this.triggerAttachmentFileInput} disabled={isSaveDisabled}><i className="fas fa-paperclip mr-1"></i> Add Attachments</button>
                            {questionState.uploadedAttachments.length > 0 && (
                              <ul className="list-unstyled mt-2 mb-0 border rounded p-2" style={{ maxHeight: '180px', overflowY: 'auto', background: '#f8f9fa' }}>
                                {questionState.uploadedAttachments.map((att) => (
                                  <li key={att.id} className="d-flex align-items-center p-1 border-bottom bg-white mb-1 rounded shadow-sm">
                                    <i className="fas fa-file-alt mr-2 text-muted"></i>
                                    <small className="text-truncate flex-grow-1 mr-2" title={att.file.name}>{att.file.name}</small>
                                    <button type="button" className="btn btn-xs btn-outline-danger" style={{ padding: '0.05rem 0.25rem' }} onClick={() => this.removeUploadedAttachment(att.id)} disabled={isSaveDisabled}><i className="fas fa-times"></i></button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right Column: Live Preview & Responses */}
                  <div className="preview-column">
                    <h6 className="text-center text-muted sticky-preview-title">Live Preview</h6>
                    <div className="preview-card mb-4">
                      <div className="preview-card-body" dangerouslySetInnerHTML={{ __html: livePreviewHTML }}></div>
                    </div>
                    <div className="card">
                      <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h6 className="m-0">Responses</h6>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => this.addOptionModalRef.current.show()}>
                          <i className="fas fa-plus mr-1"></i> Add
                        </button>
                      </div>
                      <div className="card-body p-0">
                        <Table
                          listId={`options-list-${questionState.id}`}
                          headers={[{ label: "Answer", key: "value" }]}
                          data={filteredOptions}
                          options={{ ...tableOptions, linkable: false }}
                          edit={option => this.setState({ optionToEdit: option }, () => this.editOptionModalRef.current.show())}
                          delete={option => this.setState({ optionToDelete: option }, () => this.deleteOptionModalRef.current.show())}
                          onOrderChange={(list) => this._handleReorder('options', list)}
                          correctItemIds={correctOptionIds}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-brand" onClick={this.hide} disabled={isSaveDisabled}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSaveDisabled}>
                    {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />) : ("Save Changes")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Modals for Options */}
        <AddOptionModal ref={this.addOptionModalRef} save={(data) => Data.options.create({ ...data, question: questionState.id }).then(this.handleOptionCreated)} />
        {optionToEdit.id && <EditOptionModal ref={this.editOptionModalRef} option={optionToEdit} edit={(data) => Data.options.update({ ...data, id: optionToEdit.id, question: questionState.id }).then(() => this.handleOptionUpdated({ ...data, id: optionToEdit.id }))} />}
        {optionToDelete.id && <DeleteOptionModal ref={this.deleteOptionModalRef} option={optionToDelete} delete={() => Data.options.delete({ id: optionToDelete.id, questionId: questionState.id }).then(() => this.handleOptionDeleted(optionToDelete.id))} onClose={() => this.setState({ optionToDelete: {} })} />}
      </div>
    );
  }
}

EditQuestionModal.propTypes = {
  question: PropTypes.object,
  subtopic: PropTypes.string,
  edit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditQuestionModal;