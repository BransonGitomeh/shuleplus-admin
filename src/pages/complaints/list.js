import React, { Component } from 'react'
import Data from "../../utils/data"

import ComplaintView from './components/complaint'

class ComplaintList extends Component{
  state = {
    complaints:[]
  }

  componentDidMount(){
    const complaints = Data.complaints.list()
    this.setState(complaints)

    Data.complaints.subscribe(complaints => {
      this.setState(complaints)
    })
  }

  render() {
    const { complaints } = this.state
    return (
      <div class="kt-portlet kt-portlet--height-fluid">
        <div class="kt-portlet__head kt-portlet__head--noborder">
          <div class="kt-portlet__head-label">
            <h1 class="kt-portlet__head-title ml-3">Complaints : {complaints.length}</h1>
          </div>
        </div>
        <div class="kt-portlet__body kt-portlet__body--fluid">
          <ul class="list-group list-group-flush col-md-4 col-sm-6">
            {complaints.map(c => {
              return <li
              className="list-group-item"
              style={{cursor:'pointer'}}
              onClick={() => this.setState({selected: complaints.find(comp => comp.id === c.id)})}>
                {c.parent && c.parent.name} at {c.time}
              </li>
            })}
					</ul>
          <div className="col-md-8">
            <ComplaintView complaint={this.state.selected} onClickDelete={() =>{
              Data.complaints.delete(this.state.selected)
              this.setState({selected: null})
            }}/>
          </div>
        </div>
      </div>)
  }
}

export default ComplaintList