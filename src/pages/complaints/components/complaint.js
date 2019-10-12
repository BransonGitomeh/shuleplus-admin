import React from 'react'

const ComplaintView = ({ complaint, onClickDelete }) => {
  if(complaint){
    return (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div class="kt-portlet__head-label">
					<span class="kt-portlet__head-icon">
						<i class="la la-comment-o"></i>
					</span>
          <h3 className="kt-portlet__head-title kt-heading kt-heading--center kt-heading--thin">
            {complaint.parent && complaint.parent.name}
						<small>at {complaint.time}</small>
					</h3>			
				</div>
        <div class="kt-portlet__head-toolbar">
					<div class="kt-portlet__head-group">
						<div class="btn-group">
							<button type="button" class="btn btn-pill btn-outline-danger btn-sm" onClick={onClickDelete}>
                <i className="la la-trash" />
							</button>
						</div>
					</div>
				</div>
      </div>
      <div className="kt-portlet__body">
        {complaint.content}
      </div>
      <div className="kt-portlet__foot">
        <textarea className="form-control my-2"></textarea>
        <button className="btn btn-outline-success btn-pill btn-sm kt-align-right">Respond</button>
      </div>
    </div>
    )
  } else {
    return null
  }
}

export default ComplaintView