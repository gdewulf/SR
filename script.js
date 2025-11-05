// THIS IS THE EXACT CODE THAT MADE YOU SAY "OK its working"
const sel = document.getElementById('location');
const msg = document.getElementById('msg');

// HARD-CODED OPTIONS — 100% guaranteed to appear
sel.innerHTML = '<option value="ITSD">ITSD</option><option value="IPSD">IPSD</option>';

msg.innerHTML = 'Ready — pick and Save';

// Load current value (optional)
AP.request({
  url: '/rest/api/3/issue/' + AP.context.getContext().jira.issue.key + '?fields=customfield_14233',
  success: r => {
    const val = JSON.parse(r).fields.customfield_14233?.value;
    if (val) sel.value = val;
  }
});

// SAVE BUTTON
document.getElementById('save').onclick = () => {
  AP.request({
    url: '/rest/api/3/issue/' + AP.context.getContext().jira.issue.key,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ fields: { customfield_14233: { value: sel.value } } }),
    success: () => {
      msg.innerHTML = '<span style="color:green;font-size:18px">FIELD UPDATED! Reloading…</span>';
      setTimeout(() => location.reload(), 1200);
    },
    error: e => msg.innerHTML = '<span style="color:red">ERROR</span>'
  });
};
