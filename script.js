console.log('JS LOADED - check console to confirm'); // DEBUG 1: If you see this in console, JS is running

const ISSUE_KEY = AP.context.getContext().jira.issue.key;
const FIELD_ID = 'customfield_14233';
const sel = document.getElementById('location');
const msg = document.getElementById('msg');

msg.innerHTML = 'Loading options...'; // DEBUG 2: If you see this in panel, JS is running

// Load options from Jira (dynamic, with numeric IDs hidden)
AP.request({
  url: `/rest/api/3/issue/${ISSUE_KEY}/editmeta`,
  success: r => {
    console.log('Editmeta response:', r); // DEBUG 3: Check console for the JSON - look for customfield_14233.allowedValues
    const field = JSON.parse(r).fields[FIELD_ID];
    if (field && field.allowedValues && field.allowedValues.length > 0) {
      field.allowedValues.forEach(o => {
        sel.add(new Option(o.value, o.value)); // Use string value for option
      });
      msg.innerHTML = 'Options loaded OK (check dropdown)';
    } else {
      msg.innerHTML = 'No options found - field not editable?';
    }
  },
  error: e => {
    console.log('API error:', e.responseText); // DEBUG 4: Check console for why API failed
    msg.innerHTML = 'API error - fallback options added';
    sel.innerHTML = '<option value="ITSD">ITSD</option><option value="IPSD">IPSD</option>'; // Fallback
  }
});

// Load current value
AP.request({
  url: `/rest/api/3/issue/${ISSUE_KEY}?fields=${FIELD_ID}`,
  success: r => {
    console.log('Current field response:', r); // DEBUG 5: Check console for current value
    const field = JSON.parse(r).fields[FIELD_ID];
    if (field && field.value) {
      sel.value = field.value; // String value
    }
  }
});

// Save button
document.getElementById('save').onclick = () => {
  msg.innerHTML = 'Saving...';
  AP.request({
    url: `/rest/api/3/issue/${ISSUE_KEY}`,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ fields: { [FIELD_ID]: { value: sel.value } } }), // FIXED: Use { value: "string" } for single select
    success: () => {
      msg.innerHTML = 'FIELD UPDATED! Page reloading…';
      setTimeout(() => location.reload(), 1200); // See the change
    },
    error: e => {
      console.log('Save error:', e.responseText); // DEBUG 6: Check console for why save failed
      msg.innerHTML = 'SAVE ERROR: ' + JSON.parse(e.responseText).errors[FIELD_ID];
    }
  });
};
