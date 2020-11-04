import React, { Component } from 'react'
import Data from "../../utils/data"

import MessageView from './components/message'

export default class MessageList extends Component {
  state = {
    parents: [],
    selected: [],
    message: '',
    type: 'sms',
    allSelected: false
  }

  componentDidMount() {
    const parents = Data.parents.list()
    this.setState({ parents })

    Data.parents.subscribe(parents => {
      this.setState(parents)
    })
  }

  onClickSwitch = type => {
    this.setState({ type })
  }

  onClickSend = async () => {
    const { type, selected, message } = this.state
    const ok = await Data.communication[type].create({ message, parents: selected })
    this.setState({ ok, message:"" })
  }

  onChangeHandler = e => {
    this.setState({ message: e.target.value })
  }

  selectAll = () => {
    const { allSelected } = this.state
    allSelected ? this.setState({ selected: [], allSelected: false }) : this.setState({ selected: this.state.parents.map(p => p.id), allSelected: true })
  }

  onSelect = (parent) => {
    this.setState((prevState, props) => {
      const { selected } = prevState
      const filteredSelected = selected.includes(parent.id) ? selected.filter(p => p !== parent.id) : [...selected, parent.id]
      return { selected: filteredSelected }
    })
  }

  render() {
    const { parents, selected, allSelected } = this.state
    return (
      <div className="row">

        <div className="col-md-4 col-lg-4 col-sm-12">
          <ul class="list-group list-group-flush">
            <button style={{ marginBottom: "20px" }} className={`btn btn-${allSelected ? "danger" : "secondary"} btn-pill`} onClick={this.selectAll}>{allSelected ? 'Unselect All Parents' : 'Select All Parents'}</button>
            {parents.map(parent => {
              return <li
                className="list-group-item"
                style={{ cursor: 'pointer' }}>
                <label class="kt-checkbox">
                  <input onChange={() => this.onSelect(parent)} type="checkbox" checked={selected.includes(parent.id)} /> {parent.name}<span></span>
                </label>
              </li>
            })}
            
          </ul>
        </div>

        <div className="col-md-8 col-lg-8 col-sm-12">
          <br></br>
          <MessageView type={this.state.type} onClickSwitch={this.onClickSwitch} onClickSend={this.onClickSend} onChange={this.onChangeHandler} />
        </div>
        
      </div>
    )
  }
}