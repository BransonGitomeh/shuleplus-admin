import React from "react";
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ErrorMessage from "../components/error-toast";

// --- Draft.js and react-draft-wysiwyg Imports ---
import { EditorState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from 'draft-js-export-html';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// --- Data, Utils, and Components ---
import Data from "../../../utils/data";
import imageCompression from 'browser-image-compression';
import AddOptionModal from "../options/add";
import EditOptionModal from "../options/edit";
import DeleteOptionModal from "../options/delete";
import Table from "../components/table";
import Search from "../components/search";

// --- Global Dependencies ---
const toastr = window.toastr;
const $ = window.$;
const IErrorMessage = new ErrorMessage();

// --- Constants ---
const modalId = `modal-add-content-${Math.random().toString().split(".")[1]}`;
const generateId = (prefix = 'item') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

export const inputTypes = [
  { value: 'SINGLECHOICE', label: 'Single Choice', hasOptions: true },
  { value: 'MULTICHOICE', label: 'Multiple Choice', hasOptions: true },
  { value: 'TEXT', label: 'Text', hasOptions: false },
  { value: 'CAMERA', label: 'Camera', hasOptions: false },
];

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

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


class AddQuestionModal extends React.Component {
  addOptionModalRef = React.createRef();
  editOptionModalRef = React.createRef();
  deleteOptionModalRef = React.createRef();
  formRef = React.createRef();
  imageFileInputRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  // State initialization remains the same
  getInitialState = () => ({
    loading: false,
    isCompressingImages: false,
    contentBlocks: [
      { id: generateId('text'), type: 'TEXT', editorState: EditorState.createEmpty() }
    ],
    questionType: 'SINGLECHOICE',
    subtopic: this.props.subtopic || "",
    createdQuestionId: null,
    addedOptions: [],
    optionToEdit: null,
    optionToDelete: null,
    optionSearchTerm: '',
    videoUrlsInput: "",
    attachments: [],
  });

  // All class methods (componentDidMount, handleSubmit, etc.) remain unchanged as their logic is not tied to the layout.
  componentDidMount() {
    $(this.formRef.current).validate({
      errorClass: "invalid-feedback", errorElement: "div",
      highlight: (el) => $(el).addClass("is-invalid"),
      unhighlight: (el) => $(el).removeClass("is-invalid"),
      ignore: ":hidden:not(select)",
    });
    $(`#${modalId}`).on('hidden.bs.modal', this.resetState);
  }

  componentWillUnmount() {
    if ($(this.formRef.current).data('validator')) $(this.formRef.current).data('validator').destroy();
    $(`#${modalId}`).off('hidden.bs.modal', this.resetState);
  }

  show = () => {
    this.resetState();
    this.setState({ subtopic: this.props.subtopic });
    $(`#${modalId}`).modal({ show: true, backdrop: "static", keyboard: false });
  };

  hide = () => $(`#${modalId}`).modal("hide");

  resetState = () => {
    (this.state.contentBlocks || []).forEach(block => {
      if (block.type === 'IMAGE' && block.preview && block.preview.startsWith('blob:')) {
        URL.revokeObjectURL(block.preview);
      }
    });
    this.setState(this.getInitialState());
    if ($(this.formRef.current).data('validator')) {
      $(this.formRef.current).data('validator').resetForm();
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    if (!$(this.formRef.current).valid()) return;

    const textBlock = this.state.contentBlocks.find(b => b.type === 'TEXT');
    if (!textBlock || !textBlock.editorState.getCurrentContent().hasText()) {
      IErrorMessage.show({ message: "Content description cannot be empty." });
      return;
    }

    this.setState({ loading: true });

    try {
      let htmlContent = "";
      const images = [];
      const videos = [];
      const contentOrder = [];

      for (const block of this.state.contentBlocks) {
        switch (block.type) {
          case 'TEXT':
            htmlContent = stateToHTML(block.editorState.getCurrentContent());
            contentOrder.push({ type: 'TEXT' });
            break;
          case 'IMAGE':
            const imageBase64 = await toBase64(block.data);
            images.push({ id: block.id, name: block.name, base64: imageBase64 });
            contentOrder.push({ type: 'IMAGE', id: block.id });
            break;
          case 'VIDEO':
            videos.push({ id: block.id, embedUrl: block.embedUrl });
            contentOrder.push({ type: 'VIDEO', id: block.id });
            break;
          default:
            break;
        }
      }

      const serializedAttachments = await Promise.all(
        this.state.attachments.map(async (file) => {
          const fileBase64 = await toBase64(file);
          return { name: file.name, base64: fileBase64 };
        })
      );

      const payload = {
        name: htmlContent,
        subtopic: this.props.subtopic,
        type: this.state.questionType,
        videos: videos.map(v => v.embedUrl),
        images: images.map(i => i.base64),
        attachments: serializedAttachments,
        contentOrder: contentOrder.map(co => co.type),
      };

      const createdQuestion = await this.props.save(payload);
      this.setState({ createdQuestionId: createdQuestion.id, loading: false });

    } catch (error) {
      this.setState({ loading: false });
      const errorMessage = error?.response?.data?.message || "Error saving content.";
      IErrorMessage.show({ message: errorMessage });
    }
  };

  onEditorStateChange = (editorState) => {
    this.setState(prevState => ({
      contentBlocks: prevState.contentBlocks.map(block =>
        block.type === 'TEXT' ? { ...block, editorState } : block
      )
    }));
  };

  handleTypeChange = (event) => this.setState({ questionType: event.target.value });
  handleVideoUrlsInputChange = (event) => this.setState({ videoUrlsInput: event.target.value });

  handleAddVideoUrls = () => {
    const urls = this.state.videoUrlsInput.split('\n').map(url => url.trim()).filter(Boolean);
    if (!urls.length) return;

    const newVideoBlocks = urls.map(originalUrl => {
      const embedUrl = getYoutubeEmbedUrl(originalUrl);
      return embedUrl ? { id: generateId('video'), type: 'VIDEO', embedUrl, originalUrl } : null;
    }).filter(Boolean);

    if (newVideoBlocks.length > 0) {
      this.setState(prevState => ({
        contentBlocks: [...prevState.contentBlocks, ...newVideoBlocks],
        videoUrlsInput: ""
      }));
    }
  };

  handleImageFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    this.setState({ isCompressingImages: true });

    const imageBlockPromises = files.map(file =>
      imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024 })
        .then(compressedFile => ({
          id: generateId('image'),
          type: 'IMAGE',
          name: compressedFile.name,
          data: compressedFile,
          preview: URL.createObjectURL(compressedFile),
        }))
        .catch(error => { console.error("Error compressing image:", error); return null; })
    );

    const newImageBlocks = (await Promise.all(imageBlockPromises)).filter(Boolean);

    if (newImageBlocks.length > 0) {
      this.setState(prevState => ({
        contentBlocks: [...prevState.contentBlocks, ...newImageBlocks]
      }));
    }
    this.setState({ isCompressingImages: false });
  };

  removeContentBlock = (idToRemove) => {
    this.setState(prevState => {
      const blockToRemove = prevState.contentBlocks.find(b => b.id === idToRemove);
      if (blockToRemove?.type === 'IMAGE' && blockToRemove.preview) {
        URL.revokeObjectURL(blockToRemove.preview);
      }
      return {
        contentBlocks: prevState.contentBlocks.filter(b => b.id !== idToRemove)
      };
    });
  };

  onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedBlocks = Array.from(this.state.contentBlocks);
    const [removed] = reorderedBlocks.splice(source.index, 1);
    reorderedBlocks.splice(destination.index, 0, removed);

    this.setState({ contentBlocks: reorderedBlocks });
  };

  onOptionSearch = (e) => this.setState({ optionSearchTerm: e.target.value });
  handleCreateOption = async (data) => {
    const newOption = await Data.options.create({ ...data, question: this.state.createdQuestionId });
    this.setState(prevState => ({ addedOptions: [...prevState.addedOptions, newOption] }));
  };
  handleUpdateOption = async (data) => {
    await Data.options.update({ ...data, id: this.state.optionToEdit.id });
    this.setState(prevState => ({
      addedOptions: prevState.addedOptions.map(o => o.id === data.id ? data : o),
      optionToEdit: null,
    }));
  };
  handleDeleteOption = async () => {
    await Data.options.delete({ id: this.state.optionToDelete.id });
    this.setState(prevState => ({
      addedOptions: prevState.addedOptions.filter(o => o.id !== prevState.optionToDelete.id),
      optionToDelete: null,
    }));
  };
  handleOptionOrderChange = (reorderedOptions) => {
    this.setState({ addedOptions: reorderedOptions });
    Data.questions.update({ id: this.state.createdQuestionId, optionsOrder: reorderedOptions.map(o => o.id) });
  };

  renderContentBlock = (block) => {
    switch (block.type) {
      case 'TEXT':
        const html = stateToHTML(block.editorState.getCurrentContent());
        return <div className="content-preview" dangerouslySetInnerHTML={{ __html: html }} />;
      case 'IMAGE':
        return <img src={block.preview} alt="preview" className="img-fluid rounded" />;
      case 'VIDEO':
        return (
          <div className="video-embed-container">
            <iframe src={block.embedUrl} frameBorder="0" allowFullScreen title="YouTube Preview" />
          </div>
        );
      default:
        return null;
    }
  };

  render() {
    const { contentBlocks, questionType, loading, isCompressingImages, createdQuestionId, addedOptions, optionSearchTerm } = this.state;
    const isSaveDisabled = loading || isCompressingImages || !!createdQuestionId;
    const showOptionsSection = contentTypes.find(ct => ct.value === questionType)?.hasOptions;
    const filteredOptions = addedOptions.filter(opt => opt.value.toLowerCase().includes(optionSearchTerm.toLowerCase()));
    const correctOptionIds = addedOptions.filter(o => o.correct).map(o => o.id);
    const textBlock = contentBlocks.find(b => b.type === 'TEXT');

    return (
      <div>
        {/* --- STYLES - REMOVED FLEXBOX, KEPT COMPONENT-SPECIFIC STYLES --- */}
        <style>{`
            .modal-xl { max-width: 90%; }
            .modal-body {
              max-height: calc(100vh - 210px);
              overflow-y: auto;
            }
            .disabled-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.7); z-index: 100; cursor: not-allowed; }
            
            /* Styles for the Editor Card */
            .rdw-editor-wrapper.editor-card {
                border: 1px solid #E4E6EF;
                border-radius: .42rem;
            }
            .rdw-editor-toolbar {
                border-bottom: 1px solid #E4E6EF;
                background-color: #f8f9fa;
                border-top-left-radius: .42rem;
                border-top-right-radius: .42rem;
            }
            .rdw-editor-main {
                min-height: 250px;
                padding: 1rem 1.5rem;
            }

            /* Styles for Draggable Preview Blocks */
            .preview-block { position: relative; border: 1px dashed #ccc; background-color: #fff; border-radius: 5px; padding: 1rem; margin-bottom: 1rem; }
            .preview-block:hover { border-color: #007bff; }
            .drag-handle { position: absolute; top: 10px; left: -10px; background: #007bff; color: white; width: 20px; height: 30px; border-radius: 3px; cursor: grab; display: flex; align-items: center; justify-content: center; opacity: 0.5; transition: opacity 0.2s; }
            .preview-block:hover .drag-handle { opacity: 1; }
            .remove-block-btn { position: absolute; top: 5px; right: 5px; z-index: 10; }
            .video-embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; }
            .video-embed-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        `}</style>

        <div className="modal fade" id={modalId} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <form ref={this.formRef} onSubmit={this.handleSubmit} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">Create New Content</h5>
                  <button type="button" className="close" onClick={this.hide} disabled={loading}>×</button>
                </div>

                {/* --- REDESIGNED MODAL BODY WITH BOOTSTRAP GRID --- */}
                <div className="modal-body">
                  <div className="row">

                    {/* --- Left Column: Form Inputs (Stacks on mobile) --- */}
                    <div className="col-lg-7">
                      <div className="card card-custom shadow-sm mb-5 mb-lg-0">
                        <div className="card-header">
                            <div className="card-title">
                                <h3 className="card-label">Content Details</h3>
                            </div>
                        </div>
                        <div className="card-body" style={{ position: 'relative' }}>
                          {createdQuestionId && <div className="disabled-overlay"></div>}
                          
                          {/* Content Type */}
                          <div className="form-group mb-5">
                            <label className="font-weight-bold">Content Type <span className="text-danger">*</span></label>
                            <select className="form-control form-control-solid" value={questionType} onChange={this.handleTypeChange} required>
                              {contentTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                          </div>
                          
                          <div className="separator separator-dashed my-5"></div>

                          {/* Text Editor */}
                          {textBlock && (
                            <div className="form-group mb-5">
                              <label className="font-weight-bold mb-2">Content Description <span className="text-danger">*</span></label>
                              <Editor
                                editorState={textBlock.editorState}
                                onEditorStateChange={this.onEditorStateChange}
                                wrapperClassName="editor-card"
                                editorClassName="rdw-editor-main"
                              />
                            </div>
                          )}

                          <div className="separator separator-dashed my-5"></div>

                          {/* Video Uploader */}
                          <div className="form-group mb-5">
                            <label className="font-weight-bold">Add Videos (YouTube)</label>
                            <p className="text-muted font-size-sm">Paste one YouTube URL per line.</p>
                            <textarea className="form-control form-control-solid" rows="2" placeholder="https://www.youtube.com/watch?v=..." value={this.state.videoUrlsInput} onChange={this.handleVideoUrlsInputChange} />
                            <button type="button" className="btn btn-sm btn-light-primary font-weight-bolder mt-2" onClick={this.handleAddVideoUrls}>Add Videos</button>
                          </div>

                          <div className="separator separator-dashed my-5"></div>

                          {/* Image Uploader */}
                          <div className="form-group">
                            <label className="font-weight-bold">Add Images {isCompressingImages && <span className="text-primary">(Processing...)</span>}</label>
                            <input type="file" multiple accept="image/*" ref={this.imageFileInputRef} onChange={this.handleImageFileSelect} style={{ display: 'none' }} />
                            <button type="button" className="btn btn-block btn-light-info font-weight-bolder" onClick={() => this.imageFileInputRef.current.click()}>
                              <i className="fa fa-image"></i> Select Images from Device
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --- Right Column: Live Content & Responses (Stacks on mobile) --- */}
                    <div className="col-lg-5">
                      {/* Live Preview Card */}
                      <div className="card card-custom shadow-sm mb-5">
                        <div className="card-header">
                          <div className="card-title"><h3 className="card-label">Live Content (Drag to Reorder)</h3></div>
                        </div>
                        <div className="card-body">
                          <DragDropContext onDragEnd={this.onDragEnd}>
                            <Droppable droppableId="content-blocks">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                  {contentBlocks.length === 0 && <p className="text-muted text-center">Add content to see it here.</p>}
                                  {contentBlocks.map((block, index) => (
                                    <Draggable key={block.id} draggableId={block.id} index={index} isDragDisabled={!!createdQuestionId}>
                                      {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="preview-block">
                                          <div {...provided.dragHandleProps} className="drag-handle"><i className="fas fa-grip-vertical"></i></div>
                                          {!createdQuestionId && block.type !== 'TEXT' && (
                                            <button type="button" className="btn btn-xs btn-icon btn-light-danger remove-block-btn" onClick={() => this.removeContentBlock(block.id)}><i className="fa fa-times"></i></button>
                                          )}
                                          {this.renderContentBlock(block)}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </div>
                      </div>
                      
                      {/* Responses Card */}
                      <div className="card card-custom shadow-sm">
                        <div className="card-header">
                          <h3 className="card-title">Responses</h3>
                          <div className="card-toolbar">
                            {createdQuestionId && showOptionsSection && <button type="button" className="btn btn-primary btn-sm font-weight-bolder" onClick={() => this.addOptionModalRef.current.show()}>Add Response</button>}
                          </div>
                        </div>
                        <div className="card-body">
                          {!createdQuestionId ? <div className="text-center text-muted p-3">Save the content first to add responses.</div> :
                            !showOptionsSection ? <div className="text-center text-muted p-3">This content type does not require predefined responses.</div> :
                              (<>
                                <Search title="responses" onSearch={this.onOptionSearch} value={optionSearchTerm} />
                                <Table listId={`options-list-${createdQuestionId}`} headers={[{ label: "Answer", key: "value" }]} data={filteredOptions} options={{ reorderable: true, editable: true, deleteable: true }} edit={opt => this.setState({ optionToEdit: opt }, () => this.editOptionModalRef.current.show())} delete={opt => this.setState({ optionToDelete: opt }, () => this.deleteOptionModalRef.current.show())} onOrderChange={this.handleOptionOrderChange} correctItemIds={correctOptionIds} />
                              </>)
                          }
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={this.hide} disabled={loading}>Close</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }} disabled={isSaveDisabled}>
                    {loading ? <span className="spinner-border spinner-border-sm" /> : ''}
                    {createdQuestionId ? 'Saved' : 'Save Content'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {createdQuestionId && <AddOptionModal ref={this.addOptionModalRef} save={this.handleCreateOption} />}
        {this.state.optionToEdit && <EditOptionModal ref={this.editOptionModalRef} option={this.state.optionToEdit} edit={this.handleUpdateOption} />}
        {this.state.optionToDelete && <DeleteOptionModal ref={this.deleteOptionModalRef} option={this.state.optionToDelete} delete={this.handleDeleteOption} />}
      </div>
    );
  }
}

AddQuestionModal.propTypes = {
  subtopic: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
};

export default AddQuestionModal;