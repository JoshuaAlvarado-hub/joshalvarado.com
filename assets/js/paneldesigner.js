window.onload = function() {
  updateFont();
  updateContrastOutline();
  pickBackgroundColor();
};

function pickBackgroundColor() {
    const color = document.getElementById('background-color-picker').value;
    const panel = document.getElementById('panel-background');
    const btn = document.getElementById('transparent-bg-btn');

    // Remove transparency if active
    panel.classList.remove('transparent-texture');

    // Set solid color and clear any background image
    panel.style.background = color;
    panel.style.backgroundImage = "";
    panel.style.backgroundSize = "";
    panel.style.backgroundPosition = "";
    panel.style.backgroundRepeat = "";

    // Reset the special backgrounds dropdown to "None"
    document.getElementById('special-backgrounds-selector').value = "";

    // Reset toggle button to "No Background"
    btn.textContent = "No Background";
    btn.onclick = setTransparentBackground;

    // Restore number color picker mode
    document.getElementById('number-color-picker').style.display = "inline-block";
    document.getElementById('number-color-dropdown').style.display = "none";

    updateContrastOutline();
}

function setTransparentBackground() {
    const panel = document.getElementById('panel-background');
    const btn = document.getElementById('transparent-bg-btn');

    // Remove any color or image
    panel.style.background = "";
    panel.style.backgroundImage = "";
    panel.style.backgroundSize = "";
    panel.style.backgroundPosition = "";
    panel.style.backgroundRepeat = "";

    // Apply the transparent checker pattern
    panel.classList.add('transparent-texture');

    // Reset special backgrounds dropdown to "None"
    document.getElementById('special-backgrounds-selector').value = "";

    // Optionally reset color picker to default color
    document.getElementById('background-color-picker').value = "#70a8c9";

    // Show dropdown for number color, hide color picker
    document.getElementById('number-color-picker').style.display = "none";
    document.getElementById('number-color-dropdown').style.display = "inline-block";

    // Update the toggle button text and behavior
    btn.textContent = "Add Background";
    btn.onclick = addBackground;
}


function addBackground() {
    const panel = document.getElementById('panel-background');
    const specialBgValue = document.getElementById('special-backgrounds-selector').value;
    const btn = document.getElementById('transparent-bg-btn');

    panel.classList.remove('transparent-texture');

    if (specialBgValue) {
        // A special background is selected — apply it again
        updateSpecialBackground();
    } else {
        // No special background — restore solid color
        const color = document.getElementById('background-color-picker').value;
        panel.style.background = color;
        panel.style.backgroundImage = "";
        panel.style.backgroundSize = "";
        panel.style.backgroundPosition = "";
        panel.style.backgroundRepeat = "";
    }

    // Reset the special backgrounds dropdown to "None"
    document.getElementById('special-backgrounds-selector').value = "";

    document.getElementById('number-color-picker').style.display = "inline-block";
    document.getElementById('number-color-dropdown').style.display = "none";

    btn.textContent = "No Background";
    btn.onclick = setTransparentBackground;

    updateContrastOutline();
}

function pickNumberColor() {
    const color = document.getElementById('number-color-picker').value;
    const numberText = document.getElementById('panel-number');
    const oneInchText = document.getElementById('one-inch-display');

    numberText.setAttribute("fill", color);
    oneInchText.setAttribute("fill", color);

    updateContrastOutline();
}

function pickNumberDropdownColor() {
    const color = document.getElementById('number-color-dropdown').value;
    document.getElementById('panel-number').setAttribute('fill', color);
    document.getElementById('one-inch-display').setAttribute('fill', color);
}

function updatePanelText() {
    const input = document.getElementById('number-box').value.trim();
    const panelText = document.getElementById('panel-number');
    panelText.textContent = input === '' ? '312' : input;
}

function updateFont() {
  const fontValue = document.getElementById('font-selector').value;
  const numberText = document.getElementById('panel-number');
  const oneInchText = document.getElementById('one-inch-display');

  if (fontValue === "arial-bold") {
    numberText.setAttribute("font-family", "Arial, sans-serif");
    numberText.setAttribute("font-weight", "bold");
    numberText.setAttribute("font-style", "normal");
    oneInchText.setAttribute("font-family", "Arial, sans-serif");
    oneInchText.setAttribute("font-weight", "bold");
    oneInchText.setAttribute("font-style", "normal");
  } else if (fontValue === "arial-bold-italic") {
    numberText.setAttribute("font-family", "Arial, sans-serif");
    numberText.setAttribute("font-weight", "bold");
    numberText.setAttribute("font-style", "italic");
    oneInchText.setAttribute("font-family", "Arial, sans-serif");
    oneInchText.setAttribute("font-weight", "bold");
    oneInchText.setAttribute("font-style", "italic");
  }
  updateContrastOutline();
}


function updateMaterialType() {
    const materialType = document.getElementById('material-type-selector').value;
    const panelBg = document.getElementById('panel-background');
    if (materialType === "reusable") {
        panelBg.style.borderRadius = "0";
    } else {
        panelBg.style.borderRadius = "16px";
    }
    console.log(`Material Type selected: ${materialType}`);
}

function updateOneInchText() {
    const text = document.getElementById('one-inch-text').value;
    document.getElementById('one-inch-display').textContent = text;
}

function updateSpecialBackground() {
    const selector = document.getElementById('special-backgrounds-selector');
    const value = selector.value;
    const panel = document.getElementById('panel-background');
    const btn = document.getElementById('transparent-bg-btn');
    const numberElement = document.getElementById('panel-number');
    const oneInchText = document.getElementById('one-inch-display');

    panel.classList.remove('transparent-texture');

    if (value === "") {
        const color = document.getElementById('background-color-picker').value;
        panel.style.background = color;
        panel.style.backgroundImage = "";
        panel.style.backgroundSize = "";
        panel.style.backgroundPosition = "";
        panel.style.backgroundRepeat = "";
    } else {
        panel.style.background = "none";
        panel.style.backgroundImage = `url('${value}')`;
        panel.style.backgroundSize = "cover";
        panel.style.backgroundPosition = "center";
        panel.style.backgroundRepeat = "no-repeat";
    }

    btn.textContent = "No Background";
    btn.onclick = setTransparentBackground;

    document.getElementById('number-color-picker').style.display = "inline-block";
    document.getElementById('number-color-dropdown').style.display = "none";

    if (value !== "") {
        // Special background selected — always show outline
        numberElement.setAttribute("stroke", "#000");
        numberElement.setAttribute("stroke-width", "0.5");
        oneInchText.setAttribute("stroke", "#000");
        oneInchText.setAttribute("stroke-width", "0.2");
        return;
    }
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

// Calculate relative luminance
function luminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

// Compute contrast ratio
function contrast(rgb1, rgb2) {
    const lum1 = luminance(...rgb1);
    const lum2 = luminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function updateContrastOutline() {
  const numberText = document.getElementById('panel-number');
  const oneInchText = document.getElementById('one-inch-display');
  const specialBg = document.getElementById('special-backgrounds-selector').value;

  const rootStyles = getComputedStyle(document.documentElement);
  const outlineColor = rootStyles.getPropertyValue('--outline-color').trim();
  const outlineWidthNumber = rootStyles.getPropertyValue('--outline-width-number').trim();
  const outlineWidthText = rootStyles.getPropertyValue('--outline-width-text').trim();

  if (specialBg) {
    // Always show outline for special backgrounds
    numberText.setAttribute("stroke", "#000");
    numberText.setAttribute("stroke-width", outlineWidthNumber);
    oneInchText.setAttribute("stroke", "#000");
    oneInchText.setAttribute("stroke-width", outlineWidthText);
    return;
  }

  const numberColorHex = document.getElementById('number-color-picker').value;
  const bgColorHex = document.getElementById('background-color-picker').value;

  const numberRgb = hexToRgb(numberColorHex);
  const bgRgb = hexToRgb(bgColorHex);
  const ratio = contrast(numberRgb, bgRgb);

  if (ratio < 4.5) {
    // Low contrast: show stroke
    numberText.setAttribute("stroke", "#000");
    numberText.setAttribute("stroke-width", outlineWidthNumber);
    oneInchText.setAttribute("stroke", "#000");
    oneInchText.setAttribute("stroke-width", outlineWidthText);
  } else {
    // High contrast: remove stroke
    numberText.setAttribute("stroke", "none");
    numberText.removeAttribute("stroke-width");
    oneInchText.setAttribute("stroke", "none");
    oneInchText.removeAttribute("stroke-width");
  }
}