import React from "react";

import Table from "./components/table";
import AddModal from "./add";
import EditModal from "./edit";
import DeleteModal from "./delete";
import Data from "../../utils/data";

const $ = window.$;
const addModalInstance = new AddModal();
const editModalInstance = new EditModal();
const deleteModalInstance = new DeleteModal();

class LibraryList extends React.Component {
  state = {
    books: [],
    filteredBooks: [],
    loading: true,
    edit: null,
    remove: null
  };

  componentDidMount() {
    this.fetchData();
    this._subscription = Data.books.subscribe(({ books }) => {
      this.setState({ books, filteredBooks: books, loading: false });
    });
  }

  componentWillUnmount() {
    if (this._subscription) this._subscription();
  }

  fetchData = () => {
    // Data.init() is called within Data.js, but we can trigger a refresh if needed
    // For now, reliance on subscription is enough
  };

  onSearch = e => {
    const searchTerm = e.target.value.toLowerCase();
    const { books } = this.state;
    const filteredBooks = books.filter(book => 
      book.title.toLowerCase().includes(searchTerm) || 
      book.author.toLowerCase().includes(searchTerm) ||
      book.category.toLowerCase().includes(searchTerm)
    );
    this.setState({ filteredBooks });
  };

  saveBook = (book) => {
    Data.books.create(book)
      .then(() => window.toastr.success("Book added successfully"))
      .catch(() => window.toastr.error("Failed to add book"));
  };

  updateBook = (book) => {
    Data.books.update(book)
      .then(() => window.toastr.success("Book updated successfully"))
      .catch(() => window.toastr.error("Failed to update book"));
  };

  deleteBook = (book) => {
    Data.books.delete(book)
      .then(() => window.toastr.success("Book deleted successfully"))
      .catch(() => window.toastr.error("Failed to delete book"));
  };

  render() {
    const { filteredBooks, loading, edit, remove } = this.state;
    return (
      <div className="kt-portlet kt-portlet--mobile">
        <AddModal save={this.saveBook} />
        <DeleteModal remove={remove} save={this.deleteBook} />
        <EditModal edit={edit} save={this.updateBook} />
        
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand la la-book" />
            </span>
            <h3 className="kt-portlet__head-title">
              Digital Library
              <small>Manage school books and resources</small>
            </h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <button
                className="btn btn-brand btn-elevate btn-icon-sm"
                onClick={() => $("#add_book_modal").modal("show")}
              >
                <i className="la la-plus" />
                New Book
              </button>
            </div>
          </div>
        </div>

        <div className="kt-portlet__body">
          <div className="kt-form kt-fork--label-right kt-margin-t-20 kt-margin-b-10">
            <div className="row align-items-center">
              <div className="col-xl-8 order-2 order-xl-1">
                <div className="row align-items-center">
                  <div className="col-md-4 kt-margin-b-20-tablet-and-mobile">
                    <div className="kt-input-icon kt-input-icon--left">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search books..."
                        onChange={this.onSearch}
                      />
                      <span className="kt-input-icon__icon kt-input-icon__icon--left">
                        <span><i className="la la-search" /></span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-portlet__body kt-portlet__body--flush">
          <Table
            headers={[
              { label: "Cover", key: "coverUrl" },
              { label: "Title", key: "title" },
              { label: "Author", key: "author" },
              { label: "Category", key: "category" },
              { label: "Description", key: "description" }
            ]}
            loading={loading}
            data={filteredBooks}
            edit={book => {
              this.setState({ edit: book }, () => {
                $("#edit_book_modal").modal("show");
              });
            }}
            delete={book => {
              this.setState({ remove: book }, () => {
                $("#delete_book_modal").modal("show");
              });
            }}
          />
        </div>
      </div>
    );
  }
}

export default LibraryList;
