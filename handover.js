let retryCount = 0;
const maxRetries = 25; // ~5 seconds

function initHandover() {
  // Wait until Jira injects AP
  if (typeof AP === 'undefined' || !AP.context) {
    retryCount++;
    if (retryCount < maxRetries) {
      console.warn('AP not ready yet, retrying...');
      return setTimeout(initHandover, 200);
    } else {
      console.error('AP never loaded. Are you running this inside Jira?');
      document.getElementById('msg').innerHTML = 'Error: AP not available.';
      return;
    }
  }

  console.log('AP ready — initializing handover panel');

  const sel = document.getElementById('location');
  const msg = document.getElementById('msg');
  const btn = document.getElementById('save');
  msg.innerHTML = 'Loading options...';

  // Get Jira issue key
  AP.context.getContext(context => {
    const issueKey = context?.jira?.issue?.key;
    if (!issueKey) {
      msg.innerHTML = 'Unable to determine issue key.';
      console.error('Context missing issue key:', context);
      return;
    }
    console.log('Issue key:', issueKey);

    // Fetch all fields
    AP.request({
      url: '/rest/api/3/field',
      success: r => {
        const fields = JSON.parse(r);
        const targetField = fields.find(f => f.id === 'customfield_14233');
        if (!targetField) {
          msg.innerHTML = 'Custom field not found!';
          console.error('customfield_14233 not found:', fields);
          return;
        }

        // Fetch options (context 1)
        AP.request({
          url: `/rest/api/3/field/${targetField.id}/context/1/option`,
          success: res => {
            try {
              const data = JSON.parse(res);
              const options = data.values || [];
              if (!options.length) {
                msg.innerHTML = 'No options found for field.';
                console.warn('No options in context 1:', data);
                return;
              }

              // Populate dropdown
              sel.innerHTML = options.map(o =>
                `<option value="${o.value}">${o.value}</option>`).join('');
              msg.innerHTML = 'Click Save & Trigger to move this ticket';

              // Load current value
              AP.request({
                url: `/rest/api/3/issue/${issueKey}?fields=customfield_14233`,
                success: r => {
                  try {
                    const val = JSON.parse(r).fields.customfield_14233?.value;
                    if (val) sel.value = val;
                    console.log('Current value:', val);
                  } catch (err) {
                    console.error('Error parsing field value', err);
                  }
                },
                error: e => console.error('Error loading current field value', e)
              });

            } catch (err) {
              console.error('Error parsing options response', err, res);
              msg.innerHTML = 'Failed to parse field options.';
            }
          },
          error: e => {
            console.error('Error fetching field options', e);
            msg.innerHTML = 'Error loading options. Check console.';
          }
        });
      },
      error: e => {
        console.error('Error fetching fields', e);
        msg.innerHTML = 'Unable to fetch field list.';
      }
    });

    // Save button
    btn.onclick = () => {
      if (!sel.value) {
        msg.innerHTML = 'Please select a destination first.';
        return;
      }

      msg.innerHTML = 'Saving...';

      AP.request({
        url: `/rest/api/3/issue/${issueKey}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
          fields: { customfield_14233: { value: sel.value } }
        }),
        success: () => {
          msg.innerHTML = '<span style="color:green;">Field updated! Reloading…</span>';
          setTimeout(() => AP.navigator.reload(), 1200);
        },
        error: e => {
          console.error('Error updating field', e);
          msg.innerHTML = 'Error saving field. Check console.';
        }
      });
    };
  });
}

// Start initialization
initHandover();
