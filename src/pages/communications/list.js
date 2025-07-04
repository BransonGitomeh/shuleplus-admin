import React, { useState, useEffect, useMemo } from 'react';
import Handlebars from 'handlebars';
import MessageViewV3 from './components/message'; // The V3 view is now the primary view
import Data from '../../utils/data'

// --- V3 Handlebars Helper ---
// This makes templates more robust. Usage: {{fallback variable "default text"}}
Handlebars.registerHelper("fallback", (value, fallback) => {
    return value ? new Handlebars.SafeString(value) : fallback;
});


// =======================================================================
// END OF DUMMY DATA API
// =======================================================================


/**
 * This is the primary, unified component for composing and sending messages.
 * It replaces the old class-based `MessageList` with a more powerful and
 * flexible functional component using React Hooks.
 */
export default function MessageComposer() {
  // --- State Management using Hooks ---
  // This replaces the `this.state = { ... }` from the old class component.
  // Each piece of state is managed separately for better clarity.
  const [allData, setAllData] = useState({ parents: [], teachers: [], classes: [], routes: [] });
  const [activeTab, setActiveTab] = useState('parents'); // 'parents' tab shows all parents, just like the old component.
  const [subFilterId, setSubFilterId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayList, setDisplayList] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set()); // Replaces `state.selected` array. A Set is more efficient.
  const [messageTemplate, setMessageTemplate] = useState("Hello {{recipient.name}},\n\nThis is a message regarding {{fallback student.names 'your child'}}."); // Replaces `state.message`
  const [messageType, setMessageType] = useState('sms'); // Replaces `state.type`
  const [isSending, setIsSending] = useState(false);

  // --- Data Fetching ---
  // This `useEffect` hook replaces `componentDidMount` and `Data.parents.subscribe`.
  // It fetches all necessary initial data when the component first loads.
  useEffect(() => {
    const fetchInitialData = async () => {
      // Promise.all allows us to fetch multiple data types in parallel for speed.
      const [parents, teachers, classes, routes] = await Promise.all([
        Data.parents.list(),
        Data.teachers.list(),
        Data.classes.list(),
        Data.routes.list()
      ]);
      setAllData({ parents, teachers, classes, routes });
    };
    fetchInitialData();
  }, []); // The empty dependency array `[]` means this runs only once on mount.

  // --- Filtering Logic ---
  // This `useEffect` hook runs whenever the filters change to update the recipient list.
  // It's much more powerful than the old component, which could only show all parents.
  useEffect(() => {
    const updateDisplayList = async () => {
      let list = [];
      const { parents, teachers, classes, routes } = allData;

      switch (activeTab) {
        case 'staff':
          list = teachers;
          break;
        case 'classes':
          // If a class is selected, fetch parents for that class. Otherwise, show an empty list.
          list = subFilterId ? await Data.parents.getForClass(subFilterId) : [];
          break;
        case 'routes':
          // If a route is selected, fetch parents for that route.
          list = subFilterId ? await Data.parents.getForRoute(subFilterId) : [];
          break;
        case 'parents':
        default:
          // This is the default view, which lists all parents, matching the old component's behavior.
          list = parents;
          break;
      }
      // Apply search term if it exists
      setDisplayList(searchTerm ? list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) : list);
      // Reset selections when the list changes
      setSelectedIds(new Set());
    };

    updateDisplayList();
  }, [activeTab, subFilterId, searchTerm, allData]); // This effect re-runs if any of these values change.

  // --- Selection Handlers ---
  // These functions replace the `selectAll` and `onSelect` methods from the old component.
  const handleSelectAll = (isChecked) => {
    // Replaces `selectAll` logic. It's now driven by the currently displayed list.
    const idsToSelect = new Set(displayList.map(item => item.id));
    setSelectedIds(isChecked ? idsToSelect : new Set());
  };

  const handleSelectOne = (itemId, isChecked) => {
    // Replaces `onSelect` logic. Using a Set's `add` and `delete` is very clean.
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      isChecked ? newSet.add(itemId) : newSet.delete(itemId);
      return newSet;
    });
  };

  // --- Send Logic ---
  // This function replaces `onClickSend`. It's more robust, using Handlebars for
  // personalized messages and sending all data in one API call.
  const handleSend = async () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one recipient.");
      return;
    }
    setIsSending(true);

    // Get the full recipient objects from the master lists.
    const allRecipients = [...allData.parents, ...allData.teachers];
    const selectedRecipients = allRecipients.filter(p => selectedIds.has(p.id));

    // Compile the message for each recipient, personalizing it with their data.
    const messages = selectedRecipients.map(recipient => {
      const template = Handlebars.compile(messageTemplate);
      const context = {
        recipient,
        parent: recipient, // for legacy templates
        student: recipient.students?.[0] // Safely access the first student
      };
      return {
        recipient,
        compiledMessage: template(context)
      };
    });

    await Data.communication.send({ type: messageType, messages });

    setIsSending(false);
    setSelectedIds(new Set()); // Clear selection after sending
  };

  // --- Message Preview Logic ---
  // A nice-to-have feature: show a preview of the message for the first selected user.
  const previewRecipient = useMemo(() => {
    if (selectedIds.size === 0) return null;
    const firstId = selectedIds.values().next().value;
    const allRecipients = [...allData.parents, ...allData.teachers];
    return allRecipients.find(p => p.id === firstId);
  }, [selectedIds, allData]);


  // The component renders the `MessageViewV3`, passing all state and handlers as props.
  // This follows the "Container/Presentational" pattern, where this component is the "Container"
  // (manages logic) and `MessageViewV3` is "Presentational" (displays UI).
  return (
    <MessageViewV3
      // Filter props
      activeTab={activeTab}
      onTabChange={tab => { setActiveTab(tab); setSubFilterId(''); setSearchTerm(''); }}
      subFilterId={subFilterId}
      onSubFilterIdChange={e => setSubFilterId(e.target.value)}
      searchTerm={searchTerm}
      onSearchChange={e => setSearchTerm(e.target.value)}
      classes={allData.classes}
      routes={allData.routes}
      // List props
      displayList={displayList}
      selectedIds={selectedIds}
      onSelectAll={handleSelectAll}
      onSelectOne={handleSelectOne}
      // Message props
      messageTemplate={messageTemplate}
      onMessageChange={e => setMessageTemplate(e.target.value)}
      messageType={messageType}
      onMessageTypeChange={setMessageType}
      onSend={handleSend}
      isSending={isSending}
      previewRecipient={previewRecipient}
    />
  );
}