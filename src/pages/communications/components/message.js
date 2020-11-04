import React from 'react'

const MessageView = ({ type, onClickSend, onClickSwitch, onChange }) => {
  return (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div class="kt-portlet__head-label">
          <span class="kt-portlet__head-icon">
            <i class="la la-comment-o"></i>
          </span>
          <h3 className="kt-portlet__head-title kt-heading kt-heading--center kt-heading--thin">
            Send Message
					</h3>
        </div>
        <div class="kt-portlet__head-toolbar">
          <div class="kt-portlet__head-toolbar">
            <div class="kt-portlet__head-group">
              {["sms", "email"].map(possibleType => <button type="button" style={{ "margin": "2px", color: possibleType === type ? "white" : "" }} class={`btn btn-sm btn-outline-brand ${possibleType === type ? "btn-success" : ""} btn-elevate btn-pill`} onClick={() => onClickSwitch(possibleType.toLowerCase())}>{possibleType.toUpperCase()}</button>)}
            </div>
          </div>
        </div>
      </div>
      <div className="kt-portlet__body">
        <textarea className="form-control my-2" rows="8" onChange={onChange}></textarea>
      </div>
      <div className="kt-portlet__foot">
        <button className="btn btn-outline-success btn-pill btn-sm" onClick={onClickSend}>Send Message</button>
      </div>
    </div>
  )
}

export default MessageView