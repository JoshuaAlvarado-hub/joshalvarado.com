// Globals
let numberText, oneInchText, panelBackground, transparentBgBtn, specialBgSelector;
let numberColorPicker, numberColorDropdown, backgroundColorPicker;
const MIN_CONTRAST_RATIO = 4.5;
let outlineStyles;

document.addEventListener('DOMContentLoaded', () => {
  // Cache elements
  numberText = document.getElementById('panel-number');
  oneInchText = document.getElementById('one-inch-display');
  panelBackground = document.getElementById('panel-background');
  transparentBgBtn = document.getElementById('transparent-bg-btn');
  specialBgSelector = document.getElementById('special-backgrounds-selector');
  numberColorPicker = document.getElementById('number-color-picker');
  numberColorDropdown = document.getElementById('number-color-dropdown');
  backgroundColorPicker = document.getElementById('background-color-picker');
  outlineStyles = getOutlineStyles();

  // Initialize UI
  updateFont();
  updateContrastOutline();
  pickBackgroundColor();
  updateOneInchText();

  // Event listeners
  document.getElementById('material-type-selector')
    .addEventListener('change', updateMaterialType);

  const numberBox = document.getElementById('number-box');
  numberBox.addEventListener('input', updatePanelText);
  numberBox.addEventListener('focus', () => numberBox.select());

  document.getElementById('font-selector').addEventListener('change', updateFont);

  numberColorPicker.addEventListener('change', pickNumberColor);
  numberColorDropdown.addEventListener('change', pickNumberDropdownColor);

  backgroundColorPicker.addEventListener('change', pickBackgroundColor);

  transparentBgBtn.addEventListener('click', () => {
    if (transparentBgBtn.textContent === "No Background") {
      setTransparentBackground();
    } else if (transparentBgBtn.textContent === "Add Background") {
      addBackground();
    }
  });

  specialBgSelector.addEventListener('change', updateSpecialBackground);
  document.getElementById('one-inch-text').addEventListener('input', updateOneInchText);
});

function getOutlineStyles() {
  const rootStyles = getComputedStyle(document.documentElement);
  return {
    color: rootStyles.getPropertyValue('--outline-color').trim(),
    widthNumber: rootStyles.getPropertyValue('--outline-width-number').trim(),
    widthText: rootStyles.getPropertyValue('--outline-width-text').trim()
  };
}

function pickBackgroundColor() {
  panelBackground.classList.remove('transparent-texture');
  panelBackground.style.background = backgroundColorPicker.value;
  clearPanelBackgroundImage(panelBackground);
  specialBgSelector.value = "";
  transparentBgBtn.textContent = "No Background";

  numberColorPicker.style.display = "inline-block";
  numberColorDropdown.style.display = "none";

  updateDropShadow();
  updateContrastOutline();
}

function setTransparentBackground() {
  panelBackground.style.background = "";
  clearPanelBackgroundImage(panelBackground);
  panelBackground.classList.add('transparent-texture');
  specialBgSelector.value = "";

  numberColorPicker.style.display = "none";
  numberColorDropdown.style.display = "inline-block";

  toggleOutline(false);
  transparentBgBtn.textContent = "Add Background";
  updateDropShadow();
}

function addBackground() {
  panelBackground.classList.remove('transparent-texture');
  numberText.classList.remove('drop-shadow');
  oneInchText.classList.remove('drop-shadow');

  if (specialBgSelector.value) {
    updateSpecialBackground();
  } else {
    panelBackground.style.background = backgroundColorPicker.value;
    clearPanelBackgroundImage(panelBackground);
  }

  specialBgSelector.value = "";

  numberColorPicker.style.display = "inline-block";
  numberColorDropdown.style.display = "none";

  transparentBgBtn.textContent = "No Background";
  updateDropShadow();
  updateContrastOutline();
}

function pickNumberColor() {
  const color = numberColorPicker.value;
  numberText.setAttribute("fill", color);
  oneInchText.setAttribute("fill", color);

  updateContrastOutline();
}

function pickNumberDropdownColor() {
  const color = numberColorDropdown.value;
  numberText.setAttribute('fill', color);
  oneInchText.setAttribute('fill', color);
}

function updatePanelText() {
  const input = document.getElementById('number-box').value.trim();
  numberText.textContent = input === '' ? '312' : input;
}

function updateFont() {
  const fontValue = document.getElementById('font-selector').value;

  if (fontValue === "arial-bold") {
    setFont("Arial, sans-serif", "bold", "normal");
  } else if (fontValue === "arial-bold-italic") {
    setFont("Arial, sans-serif", "bold", "italic");
  }

  updateContrastOutline();
}

function setFont(family, weight, style) {
  [numberText, oneInchText].forEach(el => {
    el.setAttribute("font-family", family);
    el.setAttribute("font-weight", weight);
    el.setAttribute("font-style", style);
  });
}

function updateMaterialType() {
  const materialType = document.getElementById('material-type-selector').value;

  const disallowsNoBg = materialType === "reusable" || materialType === "magnetic";

  panelBackground.style.borderRadius = materialType === "reusable" ? "0" : "16px";

  if (disallowsNoBg) {
    transparentBgBtn.disabled = true;

    if (panelBackground.classList.contains('transparent-texture')) {
      pickBackgroundColor();
    }
  } else {
    transparentBgBtn.disabled = false;
  }
}

function updateOneInchText() {
  const text = document.getElementById('one-inch-text').value.trim();

  oneInchText.textContent = text;

  // Moves number up if there is optional text
  numberText.setAttribute("y", text === "" ? "6.85" : "6");
}

function updateSpecialBackground() {
  const value = specialBgSelector.value;

  panelBackground.classList.remove('transparent-texture');

  if (value === "") {
    panelBackground.style.background = backgroundColorPicker.value;
    clearPanelBackgroundImage(panelBackground);
  } else {
    panelBackground.style.background = "none";
    panelBackground.style.backgroundImage = `url('${value}')`;
    panelBackground.style.backgroundSize = "cover";
    panelBackground.style.backgroundPosition = "center";
    panelBackground.style.backgroundRepeat = "no-repeat";
  }

  transparentBgBtn.textContent = "No Background";
  updateDropShadow();

  numberColorPicker.style.display = "inline-block";
  numberColorDropdown.style.display = "none";

  if (value !== "") {
    toggleOutline(true);
    return;
  }

  updateContrastOutline();
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  const bigint = parseInt(hex, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(rgb1, rgb2) {
  const lum1 = luminance(...rgb1);
  const lum2 = luminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function updateContrastOutline() {
  if (specialBgSelector.value) {
    toggleOutline(true);
    return;
  }

  const numberRgb = hexToRgb(numberColorPicker.value);
  const bgRgb = hexToRgb(backgroundColorPicker.value);
  const ratio = contrast(numberRgb, bgRgb);

  toggleOutline(ratio < MIN_CONTRAST_RATIO);
}

function toggleOutline(enable) {
  if (enable) {
    numberText.setAttribute("stroke", outlineStyles.color);
    numberText.setAttribute("stroke-width", outlineStyles.widthNumber);
    oneInchText.setAttribute("stroke", outlineStyles.color);
    oneInchText.setAttribute("stroke-width", outlineStyles.widthText);
  } else {
    numberText.setAttribute("stroke", "none");
    numberText.removeAttribute("stroke-width");
    oneInchText.setAttribute("stroke", "none");
    oneInchText.removeAttribute("stroke-width");
  }
}

function clearPanelBackgroundImage(panel) {
  panel.style.backgroundImage = "";
  panel.style.backgroundSize = "";
  panel.style.backgroundPosition = "";
  panel.style.backgroundRepeat = "";
}

function updateDropShadow() {
  if (panelBackground.classList.contains('transparent-texture')) {
    numberText.classList.add('drop-shadow-number');
    oneInchText.classList.add('drop-shadow-text');
  } else {
    numberText.classList.remove('drop-shadow-number');
    oneInchText.classList.remove('drop-shadow-text');
  }
}