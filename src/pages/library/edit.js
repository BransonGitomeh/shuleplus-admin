import React from "react";

const $ = window.$;

class EditModal extends React.Component {
    state = {
        id: "",
        title: "",
        author: "",
        category: "",
        coverUrl: "",
        pdfUrl: "",
        description: ""
    };

    componentDidUpdate(prevProps) {
        if (this.props.edit && this.props.edit !== prevProps.edit) {
            this.setState({
                id: this.props.edit.id,
                title: this.props.edit.title || "",
                author: this.props.edit.author || "",
                category: this.props.edit.category || "",
                coverUrl: this.props.edit.coverUrl || "",
                pdfUrl: this.props.edit.pdfUrl || "",
                description: this.props.edit.description || ""
            });
        }
    }

    show() {
        $("#edit_book_modal").modal("show");
    }

    hide() {
        $("#edit_book_modal").modal("hide");
    }

    onChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };

    save = () => {
        const { id, title, author, category, coverUrl, pdfUrl, description } = this.state;
        if (!title || !author || !pdfUrl) {
            window.toastr.error("Please fill in all required fields (Title, Author, PDF URL)");
            return;
        }
        this.props.save({ id, title, author, category, coverUrl, pdfUrl, description });
        this.hide();
    };

    render() {
        return (
            <div
                className="modal fade"
                id="edit_book_modal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                Edit Book
                            </h5>
                            <button
                                type="button"
                                className="close"
                                data-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={this.state.title}
                                            onChange={this.onChange}
                                            placeholder="Enter book title"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Author *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="author"
                                            value={this.state.author}
                                            onChange={this.onChange}
                                            placeholder="Enter author name"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            className="form-control"
                                            name="category"
                                            value={this.state.category}
                                            onChange={this.onChange}
                                        >
                                            <option value="Science">Science</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="History">History</option>
                                            <option value="Storybooks">Storybooks</option>
                                            <option value="Geography">Geography</option>
                                            <option value="Languages">Languages</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Cover Image URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="coverUrl"
                                            value={this.state.coverUrl}
                                            onChange={this.onChange}
                                            placeholder="https://example.com/cover.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>PDF URL *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="pdfUrl"
                                    value={this.state.pdfUrl}
                                    onChange={this.onChange}
                                    placeholder="https://example.com/book.pdf"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={this.state.description}
                                    onChange={this.onChange}
                                    rows="3"
                                    placeholder="Enter book description"
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-dismiss="modal"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={this.save}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EditModal;
