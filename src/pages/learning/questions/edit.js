import React from "react";
import ErrorMessage from "../components/error-toast";

// --- Draft.js and react-draft-wysiwyg Imports ---
import { EditorState, ContentState, convertToRaw } from 'draft-js'; // Added convertToRaw
import { Editor } from "react-draft-wysiwyg";
import { stateToHTML } from 'draft-js-export-html';
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// --- End Imports ---

const IErrorMessage = new ErrorMessage();
const $ = window.$;

const contentTypes = ['SINGLECHOICE', 'MULTICHOICE'];

const modalNumber = Math.random().toString().split(".")[1];

class EditContentModal extends React.Component {
  constructor(props) {
    // console.log("EditContentModal: constructor props:", props);
    super(props);
    // Initialize state from props directly in constructor
    // The 'show' method can also re-initialize if needed when opening an already mounted modal with new data
    this.state = this.getInitialState(props);
    this.fileInputRef = React.createRef();
  }

  getInitialState = (props) => {
    // console.log("EditContentModal: getInitialState props:", props);
    // Use `props.question` as passed from the parent
    const questionToEdit = props?.question || {};
    let initialEditorState = EditorState.createEmpty();
    let initialHtmlName = ""; // Will store the HTML version of the content for display initially

    if (questionToEdit.name) {
      // console.log("EditContentModal: getInitialState: questionToEdit.name:", questionToEdit.name);
      try {
        // Attempt to parse as raw JSON first
        const rawContent = JSON.parse(questionToEdit.name);
        // Check if rawContent is a valid Draft.js raw state
        if (rawContent && rawContent.blocks && rawContent.entityMap) {
            const contentState = ContentState.createFromBlockArray(
                rawContent.blocks,
                rawContent.entityMap
            );
            initialEditorState = EditorState.createWithContent(contentState);
            initialHtmlName = stateToHTML(initialEditorState.getCurrentContent()); // Generate HTML from parsed raw
            // console.log("EditContentModal: getInitialState: Successfully parsed raw JSON.");
        } else {
            // console.log("EditContentModal: getInitialState: Parsed JSON is not valid Draft.js raw state. Trying as HTML.");
            throw new Error("Parsed JSON is not valid Draft.js raw state"); // Force fallback to HTML
        }
      } catch (e) {
        // console.log("EditContentModal: getInitialState: Failed to parse as JSON, trying as HTML. Error:", e.message);
        // If not raw JSON or parsing failed, assume it's HTML
        const blocksFromHtml = htmlToDraft(questionToEdit.name);
        if (blocksFromHtml && blocksFromHtml.contentBlocks) {
          const { contentBlocks, entityMap } = blocksFromHtml;
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
          initialEditorState = EditorState.createWithContent(contentState);
          initialHtmlName = questionToEdit.name; // Original name was HTML
          // console.log("EditContentModal: getInitialState: Successfully parsed HTML.");
        } else {
          // console.log("EditContentModal: getInitialState: Failed to parse HTML or create blocks.");
          // Keep initialEditorState as empty and initialHtmlName as empty
        }
      }
    } else {
        // console.log("EditContentModal: getInitialState: No questionToEdit.name provided.");
    }

    const initialState = {
      loading: false,
      question: {
        id: questionToEdit.id || null,
        // `name` in state will store the raw JSON for submission.
        // The `initialEditorState` handles the visual representation.
        name: initialEditorState.getCurrentContent().hasText() ? JSON.stringify(convertToRaw(initialEditorState.getCurrentContent())) : "",
        subtopic: questionToEdit.subtopic || props?.subtopic || "", // Prioritize question.subtopic, then props.subtopic
        type: questionToEdit.type || "",
      },
      editorState: initialEditorState,
      selectedFiles: [],
      existingAttachments: questionToEdit.attachments || [],
      attachmentsToRemove: [],
      generationPrompt: "",
      isGenerating: false,
    };
    // console.log("EditContentModal: getInitialState: Returning:", initialState);
    return initialState;
  };

  onEditorStateChange = (editorState) => {
    this.setState({ editorState });
    // Store the raw JSON content for saving
    const rawContentString = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    this.setState(prevState => ({
      question: { ...prevState.question, name: rawContentString }
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

  removeExistingAttachment = (attachmentId) => {
    this.setState(prevState => ({
      existingAttachments: prevState.existingAttachments.filter(att => att.id !== attachmentId),
      attachmentsToRemove: [...prevState.attachmentsToRemove, attachmentId]
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
      this.onEditorStateChange(newEditorState); // This will update state.question.name with raw JSON
    } else {
      IErrorMessage.show({ message: "Could not generate content from the prompt." });
    }
    this.setState({ isGenerating: false, generationPrompt: "" });
  };

  show(questionData) { // questionData is optional, if not provided, uses props
    // console.log("EditContentModal: show() called with questionData:", questionData);
    // If questionData is passed to show, use it, otherwise use current props.
    // This is useful if the parent calls show() with fresh data for an already mounted modal.
    const currentProps = questionData ? { ...this.props, question: questionData } : this.props;
    this.setState(this.getInitialState(currentProps));

    $("#" + modalNumber).modal({
      show: true,
      backdrop: "static",
      keyboard: false
    });
  }

  hide() {
    $("#" + modalNumber).modal("hide");
    // Optionally reset to a completely empty state or based on null data
    // this.setState(this.getInitialState({ question: null, subtopic: this.props.subtopic }));
  }


  componentDidUpdate(prevProps) {
    // console.log("EditContentModal: componentDidUpdate. Current props.question:", this.props.question, "Prev props.question:", prevProps.question);
    // If the 'question' prop itself changes (e.g., parent selects a different item to edit)
    if (this.props.question && prevProps.question !== this.props.question) {
        // Check if it's a genuinely new question or just a rerender with the same question
        if (!this.props.question.id || (prevProps.question && prevProps.question.id !== this.props.question.id)) {
            // console.log("EditContentModal: componentDidUpdate: New question detected, re-initializing state.");
            this.setState(this.getInitialState(this.props));
        }
    } else if (!this.props.question && prevProps.question) {
        // If question prop is removed (e.g., set to null/undefined by parent)
        // console.log("EditContentModal: componentDidUpdate: question prop removed, resetting state.");
        this.setState(this.getInitialState({ question: null, subtopic: this.props.subtopic })); // Reset with current subtopic prop
    }

    // If the 'subtopic' prop changes independently
    if (this.props.subtopic !== prevProps.subtopic && this.props.subtopic !== this.state.question.subtopic) {
        // console.log("EditContentModal: componentDidUpdate: subtopic prop changed.");
        this.setState(prevState => ({
            question: {
                ...prevState.question,
                subtopic: this.props.subtopic || "", // Update subtopic from prop
            }
        }));
    }
  }

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
    // console.log("EditContentModal: componentDidMount. Initial state for validation:", this.state);
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
        type_select: { required: true }
      },
      messages: {
        type_select: "Please select a content type."
      },
      async submitHandler(form, event) {
        event.preventDefault();

        const contentState = _this.state.editorState.getCurrentContent();
        if (!contentState.hasText() && contentState.getBlockMap().first().getType() !== 'atomic') {
          IErrorMessage.show({ message: "Content cannot be empty." });
          return;
        }
        
        if (!_this.state.question.subtopic) {
            IErrorMessage.show({ message: "Subtopic is missing."});
            return; 
        }
        if (!_this.state.question.type) {
            IErrorMessage.show({ message: "Please select a content type."});
            $('[name="type_select"]').addClass('is-invalid').focus();
            return;
        }
        if (!_this.state.question.id) {
            IErrorMessage.show({ message: "Content ID is missing. Cannot edit."});
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
    // console.log("EditContentModal: render() state:", this.state);
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
                  <h5 className="modal-title">Edit Content</h5>
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
                    <div className="form-group row">
                        <div className="col-lg-9">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter a prompt to generate and append content (Optional)"
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
                                ) : ( "Generate & Append" )}
                            </button>
                        </div>
                    </div>
                    <hr />
                    
                    <div className="form-group row">
                      <div className="col-lg-12">
                        <small className="form-text text-muted mb-1">Content <span className="text-danger">*</span></small>
                        <div style={{ border: '1px solid #ced4da', borderRadius: '.25rem', minHeight: '250px' }}>
                          <Editor
                            editorState={this.state.editorState} // This should now correctly reflect the loaded content
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

                    <div className="form-group row mt-3">
                        <div className="col-lg-8">
                            {this.state.existingAttachments && this.state.existingAttachments.length > 0 && (
                                <div className="mb-3">
                                    <strong>Existing files:</strong>
                                    <ul className="list-group list-group-flush">
                                        {this.state.existingAttachments.map(att => (
                                            <li key={att.id || att.name} className="list-group-item d-flex justify-content-between align-items-center p-1">
                                                <a href={att.url || '#'} target="_blank" rel="noopener noreferrer">{att.name || 'Existing File'}</a>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-warning ml-2 py-0 px-1"
                                                    onClick={() => this.removeExistingAttachment(att.id)}
                                                    aria-label={`Mark ${att.name || 'file'} for removal`}
                                                > Remove </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

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
                                Add More Files
                            </button>
                            {this.state.selectedFiles.length > 0 && (
                                <div className="mt-2">
                                    <strong>New files to upload:</strong>
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
                        <div className="col-lg-4">
                             <select
                                name="type_select"
                                className="form-control"
                                value={this.state.question.type}
                                onChange={this.handleTypeChange}
                                title="Content Type"
                            >
                                <option value="">Select Type *</option>
                                {contentTypes.map(type => (
                                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
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
                    ) : ( "Save Changes" )}
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
// - question (Object, Optional): The existing content data to edit.
//   - id (String/Number, required for edit)
//   - name (String): HTML content or Raw Draft.js JSON string
//   - subtopic (String/Number, required)
//   - type (String, required)
//   - attachments (Array, Optional): [{ id: '...', name: '...', url: '...' }]
// - subtopic (String/Number): The current subtopic context, used if not in props.question.
// - edit (Function): Async function that accepts FormData and handles the update operation.
// - onUpdate (Function, Optional): Callback after successful update.

export default EditContentModal;