const { writeTextFile, BaseDirectory } = window.__TAURI__.fs;
const { documentDir } = window.__TAURI__.path;

const saveBtn = document.getElementById('save-btn');
const resetBtn = document.getElementById('reset-btn');
const shotSlider = document.getElementById('shot-accuracy');
const shotDisplay = document.getElementById('accuracy-val');
const numberInputs = document.querySelectorAll('input[type="number"]');
const allianceToggle = document.getElementById('alliance');
const allianceCard = allianceToggle.closest('.card');

function updateAllianceUI() {
  if (allianceToggle.checked) {
    allianceCard.classList.add('is-blue');
    allianceCard.classList.remove('is-red');
  } else {
    allianceCard.classList.add('is-red');
    allianceCard.classList.remove('is-blue');
  }
}

// set initial ui state
updateAllianceUI();

// run whenever toggle changes
allianceToggle.addEventListener('change', updateAllianceUI);

numberInputs.forEach(input => {
  input.addEventListener('keydown', (e) => {
    // list of keys to allow: 
    // backspace, delete, tab, escape, enter, and arrows
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
    
    // block if not digit 0 - 9
    if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  });

  // block pasting because i know some jerk out there is going to try it
  input.addEventListener('paste', (e) => {
    const pasteData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pasteData)) {
      e.preventDefault();
    }
  });
});

// auto find and init slider badges
function initSliders() {
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const container = slider.closest('.input-group');
    const display = container.querySelector('.badge');
    
    slider.addEventListener('input', (e) => {
      display.textContent = e.target.value;
    });
  });
}
initSliders();

saveBtn.addEventListener('click', async () => {
  // get all input fields
  const container = document.querySelector('.container');
  const inputs = container.querySelectorAll('input, textarea, select');
  
  const dataMap = {};

  // handle alliance toggle
  const isBlue = document.querySelector('.switch input').checked;
  dataMap["Alliance"] = isBlue ? "Blue" : "Red";

  inputs.forEach(input => {
    // input namer (ID -> placeholder -> type)
    const key = input.id || input.placeholder || input.previousElementSibling?.innerText || "unknown";
    
    if (input === alliance) return;

    // handle checkboxes
    if (input.type === 'checkbox') {
      dataMap[key] = input.checked ? "Yes" : "No";
    } else {
      dataMap[key] = input.value;
    }
  });

  // make csv data
  const headers = Object.keys(dataMap).join(",");
  const row = Object.values(dataMap)
    .map(val => {
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    })
    .join(",");

  const csvContent = `${headers}\n${row}`;

  // save file
  const teamNum = document.getElementById('team-num').value || "0000";
  const matchNum = document.getElementById('match-num').value || "0";
  const fileName = `scouting_team_${teamNum}_${matchNum}.csv`;
  const filePath = `${fileName}`;

  try {
    await writeTextFile(filePath, csvContent, { 
      baseDir: BaseDirectory.Document,
      append: false 
    });
    alert(`Saved: ${fileName}`);
    resetForm();
  } catch (error) {
    console.error(error);
    alert("Save Error: " + error);
  }
});

function resetForm() {
  if (!confirm("clear data?")) return;

  const container = document.querySelector('.container');
  
  // clear inputs
  const inputs = container.querySelectorAll('input[type="text"], input[type="number"], textarea');
  inputs.forEach(input => {
    // If it's a number input with a default value of 0, reset to 0
    if (input.type === 'number' && input.hasAttribute('value')) {
      input.value = "0";
    } else {
      input.value = "";
    }
  });

  // uncheck boxes
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);

  // reset sliders and badges
  container.querySelectorAll('input[type="range"]').forEach(slider => {
    const defaultValue = slider.getAttribute('value') || "1";
    slider.value = defaultValue;
    const display = slider.closest('.input-group').querySelector('.badge');
    if (display) display.textContent = defaultValue;
  });

  // uncheck alliance
  const allianceToggle = document.querySelector('.switch input');
  if (allianceToggle) allianceToggle.checked = false;

  // reset ui color
  updateAllianceUI();

  // scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

resetBtn.addEventListener('click', resetForm);