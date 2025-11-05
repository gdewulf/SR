const sel = document.getElementById('location');
const msg = document.getElementById('msg');
const btn = document.getElementById('save');

// Hard-coded dropdown options
sel.innerHTML = `
  <option value="ITSD">ITSD</option>
  <option value="IPSD">IPSD</option>
`;

msg.innerHTML = 'Click Save & Trigger to move this ticket';

// Get context (async)
AP.context.getContext(context => {
  const issueKey = context?.jira?.issue?.key;

  if (!issueKey) {
    msg.innerHTML = '<span style="color:red;">Unable to determine issue key.</span>';
    console.error('Context did not include an issue key:', context);
    return;
  }

  // Load current field value
  AP.request({
    url: `/rest/api/3/issue/${issueKey}?fields=customfield_14233`,
    success: r => {
      try {
        const val = JSON.parse(r).fields.customfield_14233?.value;
        if (val) sel.value = val;
      } catch (err) {
        console.error('Error parsing response', err, r);
      }
    },
    error: e => {
      console.error('Error loading field', e);
      msg.innerHTML = '<span style="color:red;">Failed to load current value.</span>';
    }
  });

  // Save button handler
  btn.onclick = () => {
    msg.innerHTML = 'Saving...';

    AP.request({
      url: `/rest/api/3/issue/${issueKey}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        fields: {
          customfield_14233: { value: sel.value }
        }
      }),
      success: () => {
        msg.innerHTML = '<span style="color:green;font-size:16px;">Field updated! Reloading…</span>';
        setTimeout(() => AP.navigator.reload(), 1200);
      },
      error: e => {
        console.error('Error updating field', e);
        msg.innerHTML = '<span style="color:red;">Error saving field. Check console.</span>';
      }
    });
  };
});
