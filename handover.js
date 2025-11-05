const sel = document.getElementById('location');
const msg = document.getElementById('msg');
const btn = document.getElementById('save');

msg.innerHTML = 'Loading options...';

// Get Jira issue context first (async)
AP.context.getContext(context => {
  const issueKey = context?.jira?.issue?.key;

  if (!issueKey) {
    msg.innerHTML = '<span style="color:red;">Unable to determine issue key.</span>';
    console.error('Context missing issue key:', context);
    return;
  }

  // STEP 1: Fetch all fields to find your custom field
  AP.request({
    url: '/rest/api/3/field',
    success: r => {
      const fields = JSON.parse(r);
      const targetField = fields.find(f => f.id === 'customfield_14233');
      if (!targetField) {
        msg.innerHTML = '<span style="color:red;">Custom field not found!</span>';
        console.error('customfield_14233 not found among fields:', fields);
        return;
      }

      // STEP 2: Attempt to get its options from context 1
      AP.request({
        url: `/rest/api/3/field/${targetField.id}/context/1/option`,
        success: res => {
          try {
            const data = JSON.parse(res);
            const options = data.values || [];
            if (options.length === 0) {
              msg.innerHTML = '<span style="color:red;">No options found for field.</span>';
              console.warn('Field has no options in context 1:', data);
              return;
            }

            // Populate dropdown
            sel.innerHTML = options
              .map(o => `<option value="${o.value}">${o.value}</option>`)
              .join('');

            msg.innerHTML = 'Click Save & Trigger to move this ticket';

            // STEP 3: Load current issue field value
            AP.request({
              url: `/rest/api/3/issue/${issueKey}?fields=customfield_14233`,
              success: r => {
                try {
                  const val = JSON.parse(r).fields.customfield_14233?.value;
                  if (val) sel.value = val;
                } catch (err) {
                  console.error('Error parsing field value', err);
                }
              },
              error: e => console.error('Error loading current field value', e)
            });
          } catch (err) {
            console.error('Error parsing field options response', err, res);
            msg.innerHTML = '<span style="color:red;">Failed to parse field options.</span>';
          }
        },
        error: e => {
          console.error('Error fetching field options', e);
          msg.innerHTML = '<span style="color:red;">Error loading options. Check console.</span>';
        }
      });
    },
    error: e => {
      console.error('Error fetching field metadata', e);
      msg.innerHTML = '<span style="color:red;">Unable to fetch field list.</span>';
    }
  });

  // STEP 4: Save button handler
  btn.onclick = () => {
    if (!sel.value) {
      msg.innerHTML = '<span style="color:red;">Please select a destination first.</span>';
      return;
    }

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
