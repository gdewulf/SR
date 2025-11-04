(() => {
  const ISSUE_KEY = AP.context.getContext().jira.issue.key;
  const FIELD_ID = 'customfield_14233';
  const OPTIONS = [
    {id: 'ITSD',  value: 'ITSD'},
    {id: 'IPSD',  value: 'IPSD'}
  ];

  const sel = document.getElementById('location');
  OPTIONS.forEach(o => sel.add(new Option(o.value, o.id)));

  // Load current value
  AP.request({
    url: `/rest/api/3/issue/${ISSUE_KEY}?fields=${FIELD_ID}`,
    success: r => {
      const val = JSON.parse(r).fields[FIELD_ID]?.value;
      if (val) sel.value = val;
    }
  });

  // Save button
  document.getElementById('save').onclick = () => {
    AP.request({
      url: `/rest/api/3/issue/${ISSUE_KEY}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ fields: { [FIELD_ID]: { value: sel.value } } }),
      success: () => {
        document.getElementById('msg').innerHTML = 'Saved – automation running!';
        setTimeout(() => document.getElementById('msg').innerHTML = '', 4000);
      },
      error: e => document.getElementById('msg').innerHTML = 'Error: ' + e.responseText
    });
  };
})();
