console.log('SCRIPT.JS LOADED - CHECK CONSOLE');

const ISSUE_KEY = AP.context.getContext().jira.issue.key;
const FIELD_ID = 'customfield_14233';
const sel = document.getElementById('location');
const msg = document.getElementById('msg');

msg.innerHTML = 'Loading options...';

AP.request({
  url: `/rest/api/3/issue/${ISSUE_KEY}/editmeta`,
  success: r => {
    console.log('Options response:', r);
    const field = JSON.parse(r).fields[FIELD_ID];
    if (field && field.allowedValues) {
      field.allowedValues.forEach(o => sel.add(new Option(o.value, o.id)));
      msg.innerHTML = 'Options loaded';
    } else {
      msg.innerHTML = 'No options - fallback added';
      sel.add(new Option('ITSD', 'ITSD'));
      sel.add(new Option('IPSD', 'IPSD'));
    }
  },
  error: e => {
    console.log('API error:', e);
    msg.innerHTML = 'API failed - fallback added';
    sel.add(new Option('ITSD', 'ITSD'));
    sel.add(new Option('IPSD', 'IPSD'));
  }
});

AP.request({
  url: `/rest/api/3/issue/${ISSUE_KEY}?fields=${FIELD_ID}`,
  success: r => {
    const field = JSON.parse(r).fields[FIELD_ID];
    if (field && field.id) sel.value = field.id;
  }
});

document.getElementById('save').onclick = () => {
  msg.innerHTML = 'Saving...';
  AP.request({
    url: `/rest/api/3/issue/${ISSUE_KEY}`,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ fields: { [FIELD_ID]: { id: sel.value } } }),
    success: () => {
      msg.innerHTML = 'UPDATED! Reloading...';
      setTimeout(() => location.reload(), 1200);
    },
    error: e => msg.innerHTML = 'ERROR: ' + e.responseText
  });
};
