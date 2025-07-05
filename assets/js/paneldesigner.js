function setTransparentBackground() {
    const panel = document.getElementById('panel-background');
    panel.style.background = "";
    panel.classList.add('transparent-texture');
    document.getElementById('background-color-picker').value = "#70a8c9";
    // Show dropdown, hide color picker
    document.getElementById('number-color-picker').style.display = "none";
    document.getElementById('number-color-dropdown').style.display = "inline-block";
}

function pickBackgroundColor() {
    const color = document.getElementById('background-color-picker').value;
    const panel = document.getElementById('panel-background');
    panel.classList.remove('transparent-texture');
    panel.style.background = color;
    // Show color picker, hide dropdown
    document.getElementById('number-color-picker').style.display = "inline-block";
    document.getElementById('number-color-dropdown').style.display = "none";
}

function pickNumberColor() {
    const color = document.getElementById('number-color-picker').value;
    document.getElementById('panel-number').style.color = color;
    document.getElementById('one-inch-display').style.color = color;
}

function pickNumberDropdownColor() {
    const color = document.getElementById('number-color-dropdown').value;
    document.getElementById('panel-number').style.color = color;
    document.getElementById('one-inch-display').style.color = color;
}

function updateSquareText() {
    const input = document.getElementById('number-box').value;
    const panelText = document.getElementById('panel-number');
    panelText.textContent = input;
}

function updateFont() {
    const fontSelect = document.getElementById('font-selector').value;
    const panelText = document.getElementById('panel-number');
    const oneInchText = document.getElementById('one-inch-display');
    if (fontSelect === "arial-bold") {
        panelText.style.fontFamily = "Arial, sans-serif";
        panelText.style.fontWeight = "bold";
        panelText.style.fontStyle = "normal";
        oneInchText.style.fontFamily = "Arial, sans-serif";
        oneInchText.style.fontWeight = "bold";
        oneInchText.style.fontStyle = "normal";
    } else if (fontSelect === "arial-bold-italic") {
        panelText.style.fontFamily = "Arial, sans-serif";
        panelText.style.fontWeight = "bold";
        panelText.style.fontStyle = "italic";
        oneInchText.style.fontFamily = "Arial, sans-serif";
        oneInchText.style.fontWeight = "bold";
        oneInchText.style.fontStyle = "italic";
    } else if (fontSelect === "amboy") {
        panelText.style.fontFamily = "'Amboy', Arial, sans-serif";
        panelText.style.fontWeight = "normal";
        panelText.style.fontStyle = "normal";
        oneInchText.style.fontFamily = "'Amboy', Arial, sans-serif";
        oneInchText.style.fontWeight = "normal";
        oneInchText.style.fontStyle = "normal";
    }
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