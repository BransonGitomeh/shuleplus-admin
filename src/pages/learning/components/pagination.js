import React from 'react'

export default class Pagination extends React.Component {
	state = {
		currentPage: 1,
		canPrevious: false,
		canNext: true,
		totalRecords: 0,
		pageLimit: 0,
		totalPages: 0,
	}

  	previousPage = evt => {  
  		evt.preventDefault();
  		const page = this.currentPage -= 1;
  		if(page >= 1){
  			const { onPageChanged = f => f } = this.props;
		    const currentPage = Math.max(0, Math.min(page, this.totalPages));
		    const paginationData = {
		      currentPage,
		      totalPages: this.totalPages,
		      pageLimit: this.pageLimit,
		      totalRecords: this.totalRecords
		    };

		    this.setState({ currentPage }, () => onPageChanged(paginationData));
  		}
  		this.setState({ canPrevious: false });
	}

	nextPage = evt => {
		evt.preventDefault();
		const page = this.currentPage += 1;
		if (page <= this.totalPages ) {
			const { onPageChanged = f => f } = this.props;
		    const currentPage = Math.max(0, Math.min(page, this.totalPages));
		    const paginationData = {
		      currentPage,
		      totalPages: this.totalPages,
		      pageLimit: this.pageLimit,
		      totalRecords: this.totalRecords
		    };

		    this.setState({ currentPage }, () => onPageChanged(paginationData));
		}
		this.setState({canNext: false});
	}

	componentDidMount(){
		const { totalRecords = null, pageLimit = 12 } = this.props;
    	let totalPages = Math.ceil(this.totalRecords / this.pageLimit);
    	this.setState({totalPages, totalRecords, pageLimit});
	}

	render(){
		return (!this.totalRecords > this.pageLimit ? "" :
			<nav aria-label="...">
			  <ul class="pagination">
			    <li onClick={this.previousPage} class="page-item disabled">
			      <a class="page-link" href="#" tabindex="-1">Previous</a>
			    </li>
			    <li onClick={this.nextPage} class="page-item">
			      <a class="page-link" href="#">Next</a>
			    </li>
			  </ul>
			</nav>
		);
	}
}