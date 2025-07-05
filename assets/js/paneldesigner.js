function pickBackgroundColor() {
    const color = document.getElementById('background-color-picker').value;
    const panel = document.getElementById('panel-background');

    panel.style.background = color;
    panel.style.backgroundImage = "";
    panel.classList.remove('transparent-texture');
}

function setTransparentBackground() {
    const panel = document.getElementById('panel-background');
    panel.style.background = "";
    panel.classList.add('transparent-texture');
    document.getElementById('background-color-picker').value = "#70a8c9";
    document.getElementById('number-color-picker').style.display = "none";
    document.getElementById('number-color-dropdown').style.display = "inline-block";
    // Change button to "Add Background" and update onclick
    const btn = document.getElementById('transparent-bg-btn');
    btn.textContent = "Add Background";
    btn.onclick = addBackground;
}

function addBackground() {
    const panel = document.getElementById('panel-background');
    const specialBgValue = document.getElementById('special-backgrounds-selector').value;

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

    document.getElementById('number-color-picker').style.display = "inline-block";
    document.getElementById('number-color-dropdown').style.display = "none";

    const btn = document.getElementById('transparent-bg-btn');
    btn.textContent = "No Background";
    btn.onclick = setTransparentBackground;
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

function updateSpecialBackground() {
    const selector = document.getElementById('special-backgrounds-selector');
    const value = selector.value;
    const panel = document.getElementById('panel-background');

    if (value === "") {
        // If "None" selected, restore color background
        const color = document.getElementById('background-color-picker').value;
        panel.style.background = color;
        panel.style.backgroundImage = "";
        panel.style.backgroundSize = "";
        panel.style.backgroundPosition = "";
        panel.style.backgroundRepeat = "";
    } else {
        let imageUrl = "";
        if (value === "carbon") {
            imageUrl = "/joshalvarado.com/assets/images/carbon-fiber.jpg";

        }

        panel.style.background = "none";
        panel.style.backgroundImage = `url('${imageUrl}')`;
        panel.style.backgroundSize = "cover";
        panel.style.backgroundPosition = "center";
        panel.style.backgroundRepeat = "no-repeat";
    }
}