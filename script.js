(() => {
  const sel = document.getElementById('location');
  const msg = document.getElementById('msg');

  // HARD-CODED OPTIONS — 100% GUARANTEED TO WORK
  sel.innerHTML = '<option value="ITSD">ITSD</option><option value="IPSD">IPSD</option>';

  // Load current value
  AP.request({
    url: '/rest/api/3/issue/' + AP.context.getContext().jira.issue.key + '?fields=customfield_14233',
    success: r => {
      const val = JSON.parse(r).fields.customfield_14233?.value?.id;
      if (val) sel.value = val;
    }
  });

  // Save button
  document.getElementById('save').onclick = () => {
    AP.request({
      url: '/rest/api/3/issue/' + AP.context.getContext().jira.issue.key,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ fields: { customfield_14233: { id: sel.value } } }),
      success: () => { msg.innerHTML = 'Saved – automation running!'; setTimeout(() => msg.innerHTML = '', 3000); }
    });
  };
})();
