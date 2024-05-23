// add listener for toggle id modeSwitch
const modeSwitch = document.getElementById('modeSwitch');
const mineshaftTableContainer = document.getElementById('mineshaftTableContainer');

modeSwitch.addEventListener('change', function() {
 
    const mineshaftTableContainer = document.getElementById('mineshaftTableContainer');
    if (modeSwitch.checked) {
      mineshaftTableContainer.style.display = 'none';
    } else {
      mineshaftTableContainer.style.display = 'block';
    }
  }
);

