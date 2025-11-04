(() => {
  const sel = document.getElementById('location');
  const msg = document.getElementById('msg');
  const btn = document.getElementById('save');

  // HARD-CODED options
  sel.innerHTML = '<option value="ITSD">ITSD</option><option value="IPSD">IPSD</option>';

  // CLICK = instant proof
  btn.onclick = () => {
    msg.innerHTML = '<span style="color:green;font-size:18px">SAVE BUTTON WORKS!</span>';
    setTimeout(() => location.reload(), 1000);
  };
})();
