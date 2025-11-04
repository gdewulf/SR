const ISSUE_KEY = AP.context.getContext().jira.issue.key;
const FIELD_ID = 'customfield_14233';
const sel = document.getElementById('location');
const msg = document.getElementById('msg');

// Load options from Jira (uses numeric IDs automatically)
AP.request({
  url: `/rest/api/3/issue/${ISSUE_KEY}/editmeta`,
  success: r => {
    const field = JSON.parse(r).fields[FIELD_ID];
    if (field && field.allowedValues) {
      field.allowedValues.forEach(o => {
        sel.add(new Option(o.value, o.id));
      });
      msg.innerHTML = 'Options loaded OK';
    } else {
      msg.innerHTML = 'No options found (check field config)';
    }
  },
  error: e => msg.innerHTML = 'Error loading options: ' + e.responseText
});

// Load current value
AP.request({
  url: `/rest/api/3/issue/${ISSUE_KEY}?fields=${FIELD_ID}`,
  success: r => {
    const field = JSON.parse(r).fields[FIELD_ID];
    if (field && field.id) {
      sel.value = field.id;
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
    data: JSON.stringify({ fields: { [FIELD_ID]: { id: sel.value } } }),
    success: () => {
      msg.innerHTML = 'FIELD UPDATED! Page reloading…';
      setTimeout(() => location.reload(), 1200);
    },
    error: e => msg.innerHTML = 'ERROR: ' + JSON.parse(e.responseText).errors[FIELD_ID]
  });
};
