import React from "react";
import ErrorMessage from "../components/error-toast";

// --- Draft.js and react-draft-wysiwyg Imports ---
import { EditorState, ContentState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from 'draft-js-export-html';
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
const { convertToRaw } = require('draft-js');
// --- End Imports ---

const IErrorMessage = new ErrorMessage();
const $ = window.$;

// Re-introduce the types array
const contentTypes = ['SINGLECHOICE', 'MULTICHOICE'];

const modalNumber = Math.random().toString().split(".")[1];

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      question: {
        name: "", // HTML content from editor
        subtopic: props?.subtopic || "", // Initialize from constructor props
        type: props?.type || "", // Initialize from props, but user can change
      },
      editorState: EditorState.createEmpty(),
      selectedFiles: [],
      generationPrompt: "",
      isGenerating: false,
    };
    this.fileInputRef = React.createRef();
  }

  onEditorStateChange = (editorState) => {
    this.setState({ editorState });
    const htmlContent = stateToHTML(editorState.getCurrentContent());
    this.setState(prevState => ({
      question: { ...prevState.question, name: htmlContent }
    }));
  };

  handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    this.setState(prevState => ({
      selectedFiles: [...prevState.selectedFiles, ...files.filter(
        newFile => !prevState.selectedFiles.some(existingFile => existingFile.name === newFile.name)
      )]
    }));
    if (event.target) {
        event.target.value = null;
    }
  };

  removeSelectedFile = (fileName) => {
    this.setState(prevState => ({
      selectedFiles: prevState.selectedFiles.filter(file => file.name !== fileName)
    }));
  };

  triggerFileInput = () => {
    this.fileInputRef.current.click();
  };

  handlePromptChange = (event) => {
    this.setState({ generationPrompt: event.target.value });
  };

  handleGenerateContent = async () => {
    if (!this.state.generationPrompt.trim()) {
      IErrorMessage.show({ message: "Please enter a prompt to generate content." });
      return;
    }
    this.setState({ isGenerating: true });
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const generatedHtml = `<h2>Generated Content for: ${this.state.generationPrompt}</h2><p>This is some <strong>bold text</strong> and <em>italic text</em> generated based on your prompt. You can add lists:</p><ul><li>Item 1</li><li>Item 2</li></ul><p>And more paragraphs.</p>`;
    
    const blocksFromHtml = htmlToDraft(generatedHtml);
    const { contentBlocks, entityMap } = blocksFromHtml;
    if (contentBlocks) {
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      const newEditorState = EditorState.push(this.state.editorState, contentState, 'insert-fragment');
      this.onEditorStateChange(newEditorState);
    } else {
      IErrorMessage.show({ message: "Could not generate content from the prompt." });
    }
    this.setState({ isGenerating: false, generationPrompt: "" });
  };

  show() {
    this.resetState(); 
    $("#" + modalNumber).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }

  hide() {
    $("#" + modalNumber).modal("hide");
  }

  resetState = () => {
    this.setState({
      loading: false,
      question: {
        name: "",
        subtopic: this.props?.subtopic || "",
        type: this.props?.type || "", // Reset to prop value or empty
      },
      editorState: EditorState.createEmpty(),
      selectedFiles: [],
      generationPrompt: "",
      isGenerating: false,
    });
    if (this.fileInputRef.current) {
        this.fileInputRef.current.value = null;
    }
  }

  componentDidUpdate(prevProps) {
    // Update subtopic from props if it changes
    if (this.props.subtopic !== prevProps.subtopic) {
        this.setState(prevState => ({
            question: {
                ...prevState.question,
                subtopic: this.props?.subtopic || "",
            }
        }));
    }
    // If type prop changes, update state.question.type, but user selection takes precedence if modal is open.
    // This primarily handles initial prop or prop changes when modal is not actively being used by user.
    // If user has already selected a type, this shouldn't override it unless new props are drastically different
    // (e.g., for an "edit" scenario where parent forces a type change).
    // For simplicity, let's assume props.type sets the *initial* type if provided.
    if (this.props.type !== prevProps.type && !this.state.question.type) { // Only update if type not already set by user
        this.setState(prevState => ({
            question: {
                ...prevState.question,
                type: this.props?.type || ""
            }
        }));
    }
  }

  // Handler for type selection change
  handleTypeChange = (event) => {
    const newType = event.target.value;
    this.setState(prevState => ({
        question: {
            ...prevState.question,
            type: newType
        }
    }));
  };

  componentDidMount() {
    const _this = this;
    this.validator = $("#" + modalNumber + "form").validate({
      errorClass: "invalid-feedback",
      errorElement: "div",
      highlight: function (element) {
        if (!$(element).closest('.rdw-editor-wrapper').length && !$(element).is(':file')) {
            $(element).addClass("is-invalid");
        }
      },
      unhighlight: function (element) {
         if (!$(element).closest('.rdw-editor-wrapper').length && !$(element).is(':file')) {
            $(element).removeClass("is-invalid");
        }
      },
      ignore: ".rdw-editor-wrapper *, .wysiwyg-content, :hidden:not(.do-not-ignore-validation)",
      rules: {
        type_select: { required: true } // Add rule for type select
      },
      messages: {
        type_select: "Please select a content type." // Custom message for type
      },
      async submitHandler(form, event) {
        event.preventDefault();

        const contentState = _this.state.editorState.getCurrentContent();
        if (!contentState.hasText() && contentState.getBlockMap().first().getType() !== 'atomic') {
          IErrorMessage.show({ message: "Content cannot be empty." });
          return;
        }
        
        if (!_this.state.question.subtopic) {
            IErrorMessage.show({ message: "Subtopic is missing. Please ensure it's provided via props."});
            return; 
        }
        // Manual check for type, though jQuery validate should also catch it
        if (!_this.state.question.type) {
            IErrorMessage.show({ message: "Please select a content type."});
            $('[name="type_select"]').addClass('is-invalid').focus();
            return;
        }

        _this.setState({ loading: true });
        try {
          
          const data = {
            // name: _this.state.question.name,
            subtopic: _this.props.subtopic,
            type: _this.state.question.type,
            name: stateToHTML(_this.state.editorState.getCurrentContent()),
            // attachments: _this.state.selectedFiles
          };
          
          await _this.props.save(data);
          _this.hide();
          _this.resetState();

        } catch (error) {
          _this.setState({ loading: false });
          const message = error?.response?.data?.message || error?.message || "An unexpected error occurred saving the content.";
          IErrorMessage.show({ message });
        }
      }
    });
  }

  render() {
    return (
      <div>
        <div
          className="modal"
          id={modalNumber}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <form
                id={modalNumber + "form"}
                className="kt-form"
                onSubmit={e => e.preventDefault()}
                noValidate
              >
                <div className="modal-header">
                  <h5 className="modal-title">New Content</h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={this.hide}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="kt-portlet__body">
                    {/* Content Generation Section */}
                    <div className="form-group row">
                        <div className="col-lg-9">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter a prompt to generate content (Optional)"
                                value={this.state.generationPrompt}
                                onChange={this.handlePromptChange}
                                disabled={this.state.isGenerating}
                            />
                        </div>
                        <div className="col-lg-3">
                            <button
                                type="button"
                                className="btn btn-outline-info btn-block"
                                onClick={this.handleGenerateContent}
                                disabled={this.state.isGenerating}
                            >
                                {this.state.isGenerating ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : ( "Generate" )}
                            </button>
                        </div>
                    </div>
                    <hr />
                    
                    {/* Content Editor Section */}
                    <div className="form-group row">
                      <div className="col-lg-12">
                        <small className="form-text text-muted mb-1">Content <span className="text-danger">*</span></small>
                        <div style={{ border: '1px solid #ced4da', borderRadius: '.25rem', minHeight: '250px' }}>
                          <Editor
                            editorState={this.state.editorState}
                            onEditorStateChange={this.onEditorStateChange}
                            wrapperClassName="wrapper-class"
                            editorClassName="editor-class"
                            toolbarClassName="toolbar-class"
                            toolbar={{
                              options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'emoji', 'image', 'history'],
                              inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
                              image: {
                                alt: { present: true, mandatory: false },
                                previewImage: true,
                                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                              },
                            }}
                            editorStyle={{ minHeight: '200px', padding: '0 10px' }}
                          />
                        </div>
                        <div className="wysiwyg-content" style={{ display: 'none' }}></div>
                      </div>
                    </div>

                    {/* File Upload Section and Type Selection */}
                    <div className="form-group row mt-3">
                        <div className="col-lg-8"> {/* Adjusted column for file upload */}
                            <input
                                type="file"
                                multiple
                                ref={this.fileInputRef}
                                onChange={this.handleFileSelect}
                                style={{ display: 'none' }}
                                className="do-not-ignore-validation"
                                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={this.triggerFileInput}
                            >
                                <i className="fas fa-paperclip" style={{ marginRight: '5px' }}></i>
                                Attach Files
                            </button>
                            {this.state.selectedFiles.length > 0 && (
                                <div className="mt-2">
                                    <strong>Selected files:</strong>
                                    <ul className="list-group list-group-flush">
                                        {this.state.selectedFiles.map(file => (
                                            <li key={file.name} className="list-group-item d-flex justify-content-between align-items-center p-1">
                                                <span>{file.name} ({ (file.size / 1024).toFixed(2) } KB)</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger ml-2 py-0 px-1"
                                                    onClick={() => this.removeSelectedFile(file.name)}
                                                    aria-label={`Remove ${file.name}`}
                                                > × </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="col-lg-4"> {/* Column for Type selection */}
                             <select
                                name="type_select" // Name for jQuery validation
                                className="form-control"
                                value={this.state.question.type}
                                onChange={this.handleTypeChange}
                                title="Content Type"
                            >
                                <option value="">Select Type *</option>
                                {contentTypes.map(type => (
                                    <option key={type} value={type}>{type.replace('_', ' ')}</option> // Replace underscore for display
                                ))}
                            </select>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-outline-brand"
                    disabled={this.state.loading || this.state.isGenerating}
                  >
                    {this.state.loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"/>
                    ) : ( "Save Content" )}
                  </button>
                  <button
                    data-dismiss="modal"
                    type="button"
                    className="btn btn-outline-brand"
                    onClick={this.hide}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Expected props:
// - subtopic (String/Number): The ID or value for the subtopic.
// - type (String, Optional): An initial/default type for the content.
// - save (Function): Async function that accepts FormData and handles the save operation.

export default Modal;