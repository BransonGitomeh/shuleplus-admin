import React, { useState, useEffect } from 'react';
import Handlebars from 'handlebars';

// A simple utility to interact with localStorage for templates
const TemplateStore = {
  get: () => {
    try {
      const templates = localStorage.getItem("messageTemplatesV4");
      return templates ? JSON.parse(templates) : [];
    } catch (e) { return []; }
  },
  save: (templates) => {
    localStorage.setItem("messageTemplatesV4", JSON.stringify(templates));
  }
};

// V4: Custom CSS for a polished, Metronic-style selection list.
// In a real app, this would go in a dedicated CSS/SCSS file.
const V4_STYLES = `
  .recipient-list-item {
    transition: background-color 0.15s ease-in-out;
    border-radius: 6px;
    margin-bottom: 5px;
  }
  .recipient-list-item:hover {
    background-color: #f7f8fa; /* Metronic hover color */
  }
  .recipient-list-item.active {
    background-color: #f0f1ff; /* Metronic light-brand color */
    border-left: 3px solid #5d78ff; /* Metronic brand color */
  }
  .recipient-list-item.active .recipient-name {
    color: #5d78ff !important;
    font-weight: 600;
  }
`;

const MessageViewV4 = (props) => {
  const {
    activeTab, onTabChange, subFilterId, onSubFilterIdChange, searchTerm, onSearchChange,
    classes, routes, displayList, selectedIds, onSelectAll, onSelectOne,
    messageTemplate, onMessageChange, messageType, onMessageTypeChange,
    onSend, isSending, previewRecipient,
  } = props;

  const [savedTemplates, setSavedTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => setSavedTemplates(TemplateStore.get()), []);
  useEffect(() => {
    if (previewRecipient) {
      try {
        const template = Handlebars.compile(messageTemplate || ' ');
        const context = { recipient: previewRecipient, parent: previewRecipient, student: previewRecipient.students?.[0], school: { name: "Metronic School" } };
        setPreview(template(context));
      } catch (error) { setPreview("<Invalid Template Syntax>"); }
    } else {
      setPreview("Select a recipient to see a live preview.");
    }
  }, [messageTemplate, previewRecipient]);

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !messageTemplate.trim()) return alert("Please provide a name and content.");
    const newTemplates = [...savedTemplates, { name: newTemplateName, content: messageTemplate }];
    setSavedTemplates(newTemplates);
    TemplateStore.save(newTemplates);
    setNewTemplateName('');
  };

  const handleLoadTemplate = (e) => {
    if (e.target.value) onMessageChange({ target: { value: e.target.value } });
  };
  
  const allOnPageSelected = displayList.length > 0 && selectedIds.size === displayList.length;
  const smsParts = messageTemplate ? Math.ceil(messageTemplate.length / 160) : 0;
  const getInitials = (name = '') => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <style>{V4_STYLES}</style>
      <div className="row">
        {/* ======================= COLUMN 1: RECIPIENT LIST & FILTERS ======================= */}
        <div className="col-lg-4">
          <div className="kt-portlet kt-portlet--height-fluid">
            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label">
                <h3 className="kt-portlet__head-title">Recipients</h3>
              </div>
            </div>
            <div className="kt-portlet__body">
              <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-brand" role="tablist">
                <li className="nav-item"><a className={`nav-link ${activeTab === 'parents' ? 'active' : ''}`} onClick={() => onTabChange('parents')} data-toggle="tab" href="#!">All Parents</a></li>
                <li className="nav-item"><a className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => onTabChange('classes')} data-toggle="tab" href="#!">By Class</a></li>
                <li className="nav-item"><a className={`nav-link ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => onTabChange('routes')} data-toggle="tab" href="#!">By Route</a></li>
                <li className="nav-item"><a className={`nav-link ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => onTabChange('staff')} data-toggle="tab" href="#!">Staff</a></li>
              </ul>
              
              {/* --- Consistent Filter Bar --- */}
              <div className="pt-3">
                {activeTab === 'classes' && <div className="form-group"><select className="form-control" value={subFilterId} onChange={onSubFilterIdChange}><option value="">-- Select a Class --</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
                {activeTab === 'routes' && <div className="form-group"><select className="form-control" value={subFilterId} onChange={onSubFilterIdChange}><option value="">-- Select a Route --</option>{routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}
                <div className="kt-input-icon kt-input-icon--right">
                  <input type="text" className="form-control" placeholder="Search recipients..." value={searchTerm} onChange={onSearchChange} />
                  <span className="kt-input-icon__icon kt-input-icon__icon--right"><span><i className="la la-search"></i></span></span>
                </div>
              </div>

              <div className="kt-separator kt-separator--space-lg kt-separator--border-dashed"></div>

              {/* --- List Header --- */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="kt-checkbox kt-checkbox--brand mb-0">
                    <input type="checkbox" checked={allOnPageSelected} onChange={e => onSelectAll(e.target.checked)} disabled={displayList.length === 0} />
                    Select All
                    <span></span>
                </label>
                <small className="text-muted">Showing {displayList.length} recipients</small>
              </div>

              {/* --- V4 Recipient List --- */}
              <div className="kt-scroll" style={{ height: '50vh', overflowY: 'auto' }}>
                <ul className="list-unstyled">
                  {displayList.map(item => (
                    <li key={item.id} className={`recipient-list-item d-flex align-items-center p-2 ${selectedIds.has(item.id) ? 'active' : ''}`} onClick={() => onSelectOne(item.id, !selectedIds.has(item.id))} style={{cursor: 'pointer'}}>
                      <div className="kt-user-card-v2__pic pr-3">
                          <span className="kt-badge kt-badge--xl kt-badge--brand">{getInitials(item.name)}</span>
                      </div>
                      <div className="flex-grow-1">
                          <div className="text-dark-75 font-weight-bold recipient-name">{item.name}</div>
                          <div className="text-muted font-size-sm">{item.email || item.phone}</div>
                      </div>
                      <label className="kt-checkbox kt-checkbox--single kt-checkbox--tick kt-checkbox--brand align-self-center">
                          <input type="checkbox" checked={selectedIds.has(item.id)} readOnly/>
                          <span></span>
                      </label>
                    </li>
                  ))}
                </ul>
                {displayList.length === 0 && <div className="text-center text-muted p-5">No recipients match criteria.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* ======================= COLUMN 2: MESSAGE COMPOSER ======================= */}
        <div className="col-lg-8">
          <div className="kt-portlet kt-portlet--height-fluid">
            <div className="kt-portlet__head">
              <div className="kt-portlet__head-label"><h3 className="kt-portlet__head-title">Compose Message</h3></div>
              <div className="kt-portlet__head-toolbar"><div className="btn-group"><button type="button" onClick={() => onMessageTypeChange('sms')} className={`btn btn-sm btn-pill ${messageType === 'sms' ? 'btn-success' : 'btn-outline-secondary'}`}>SMS</button><button type="button" onClick={() => onMessageTypeChange('email')} className={`btn btn-sm btn-pill ${messageType === 'email' ? 'btn-brand' : 'btn-outline-secondary'}`}>EMAIL</button></div></div>
            </div>
            <div className="kt-portlet__body">
              <div className="kt-section">
                <div className="kt-section__content">
                  <div className="row">
                    <div className="col-md-6 form-group"><select className="form-control" onChange={handleLoadTemplate}><option value="">— Load Template —</option>{savedTemplates.map(t => <option key={t.name} value={t.content}>{t.name}</option>)}</select></div>
                    <div className="col-md-6 form-group"><div className="input-group"><input type="text" className="form-control" placeholder="Save as New Template..." value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} /><div className="input-group-append"><button className="btn btn-secondary" type="button" onClick={handleSaveTemplate}><i className="la la-save"></i> Save</button></div></div></div>
                  </div>
                  <textarea className="form-control" rows="8" value={messageTemplate} onChange={onMessageChange}></textarea>
                  <div className="d-flex justify-content-between mt-2"><small className="form-text text-muted">Variables: <code>{"{{recipient.name}}"}</code>, <code>{"{{fallback student.names 'your child'}}"}</code></small>{messageType === 'sms' && <small className="form-text text-muted">{messageTemplate.length} chars / {smsParts} SMS parts</small>}</div>
                </div>
              </div>

              <div className="kt-separator kt-separator--space-lg kt-separator--border-dashed"></div>

              <div className="kt-section">
                  <div className="kt-section__title kt-font-bold">Live Preview (for {previewRecipient?.name || '...'})</div>
                  <div className="kt-section__content mt-3">
                      <div className="kt-alert kt-alert--outline-brand" role="alert">
                          <div className="kt-alert__icon"><i className="la la-mobile-phone"></i></div>
                          <div className="kt-alert__text" style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9em'}}>{preview}</div>
                      </div>
                  </div>
              </div>
            </div>
            <div className="kt-portlet__foot">
              <div className="kt-form__actions"><button type="button" className={`btn btn-brand btn-lg btn-pill btn-elevate ${isSending ? 'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light' : ''}`} onClick={onSend} disabled={selectedIds.size === 0 || isSending}><i className="la la-paper-plane"></i> Send to {selectedIds.size} Recipient(s)</button></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageViewV4;