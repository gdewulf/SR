(() => {
  const ISSUE_KEY = AP.context.getContext().jira.issue.key;
  const FIELD_ID = 'customfield_14233';
  const sel = document.getElementById('location');

  AP.request({
    url: `/rest/api/3/issue/${ISSUE_KEY}?fields=${FIELD_ID}`,
    success: r => {
      const field = JSON.parse(r).fields[FIELD_ID];
      field.allowedValues.forEach(o => sel.add(new Option(o.value, o.id)));
      if (field.value) sel.value = field.value.id;   // ← FIXED
    },
    error: () => {
      // fallback if API fails
      sel.add(new Option('ITSD', 'ITSD'));
      sel.add(new Option('IPSD', 'IPSD'));
    }
  });

  document.getElementById('save').onclick = () => {
    AP.request({
      url: `/rest/api/3/issue/${ISSUE_KEY}`,
      type: 'PUT', contentType: 'application/json',
      data: JSON.stringify({ fields: { [FIELD_ID]: { id: sel.value } } }),
      success: () => {
        document.getElementById('msg').innerHTML = 'Saved – automation running!';
        setTimeout(() => document.getElementById('msg').innerHTML = '', 3000);
      }
    });
  };
})();
