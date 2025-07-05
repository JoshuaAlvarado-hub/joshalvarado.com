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
    const btn = document.getElementById('transparent-bg-btn');

    // Always remove transparency when a special background is picked
    panel.classList.remove('transparent-texture');

    if (value === "") {
        // Restore solid color background
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
        } else if (value === "checkerboard") {
            imageUrl = "/joshalvarado.com/assets/images/checkerboard.jpg";
        } else if (value === "camouflage") {
            imageUrl = "/joshalvarado.com/assets/images/camouflage.jpg";
        }

        panel.style.background = "none";
        panel.style.backgroundImage = `url('${imageUrl}')`;
        panel.style.backgroundSize = "cover";
        panel.style.backgroundPosition = "center";
        panel.style.backgroundRepeat = "no-repeat";
    }

    // Reset button back to "No Background" mode
    btn.textContent = "No Background";
    btn.onclick = setTransparentBackground;

    // Make sure number color pickers are visible again
    document.getElementById('number-color-picker').style.display = "inline-block";
    document.getElementById('number-color-dropdown').style.display = "none";
}