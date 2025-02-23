// Canvas loading variables
var imageLoader = document.getElementById("drop-zone");
imageLoader.addEventListener("change", (e) => {
    handleImage(e.target.files[0]);
});

window.addEventListener("paste", (e) => {
    handleImage(e.clipboardData.files[0]);
});

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((e) => {
    document.body.addEventListener(e, preventDefaults, false);
    imageLoader.style.height = "12vh";
});

// Handle dropped files
document.body.addEventListener("drop", (e) => {
    handleImage(e.dataTransfer.files[0]);
});

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

var canvas = document.getElementById("image-canvas");
var ctx = canvas.getContext("2d");

// Buttons and divs that get hidden/change
const downloadButton = document.getElementById("download-button");
const resetButton = document.getElementById("reset-button");
const customMenu = document.getElementById("custom-menu");
const loadingScreen = document.getElementById("loading-screen");
const colours_div = document.getElementById("colours");
const palette_div = document.getElementById("palette");
const menu = document.getElementById("theme-select");

// Changing visibility of download/reset buttons, image canvas, and the menu for custom theme
canvas.style.visibility = "hidden";
loadingScreen.style.visibility = "hidden";
customMenu.style.display = "none";

// Global variables
var ogimage;
var theme = [];
var nodes = 0;
var colour_palette_count = 0;
var menuVisible = false;
var list_of_themes;
var themes_keys;
var dithering = false;

// Fetch data from themes.json
fetch("./assets/themes.json")
    .then((res) => res.json())
    .then((data) => {
        list_of_themes = data;
        themes_keys = Object.keys(list_of_themes);
        scrollTheme();
    });

// Loads image onto canvas
function handleImage(source) {
    imageLoader.style.height = "1vh";
    ogimage = source;
    var reader = new FileReader();

    reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(source);
    downloadButton.style.visibility = "hidden";
    resetButton.style.visibility = "hidden";
    canvas.style.visibility = "visible";
}

// Resets the image by taking the data of the original image and calling handleImage
function reset() {
    handleImage(ogimage);
}

// Displays the colour palette
function displayPalette() {
    // Deletes previous colour palette
    if (colour_palette_count != 0) {
        for (var i = 0; i < colour_palette_count; i++) {
            document
                .getElementById("palette")
                .removeChild(palette_div.lastElementChild);
        }
        colour_palette_count = 0;
    }
    // Create new colour palette
    for (var i = 0; i < theme.length; i += 3) {
        const palette_node = document.createElement("div");
        palette_node.className = "palette-node";
        palette_node.style.backgroundColor =
            "rgb(" + theme[i] + "," + theme[i + 1] + "," + theme[i + 2] + ")";
        palette_div.appendChild(palette_node);
        colour_palette_count++;
    }
}

// Opens the custom menu
function openCustomMenu(keepClosed = false) {
    if (keepClosed) menuVisible = true;

    if (menuVisible == true) {
        document.getElementById("custom-menu").style.display = "none";
        document.getElementById("custom-theme-button").textContent =
            "+ Custom Theme";
        menuVisible = false;
    } else {
        document.getElementById("custom-menu").style.display = "block";
        document.getElementById("custom-theme-button").textContent =
            "- Custom Theme";
        menuVisible = true;
        createCustomPalette();
    }
}

// Adds a colour swatch when pressed
function addColour() {
    const colour_node = document.createElement("input");
    colour_node.setAttribute("type", "color");
    colour_node.id = "node" + nodes;
    colours_div.appendChild(colour_node);
    nodes++;
    createCustomPalette();
}

// Removes a colour swatch when pressed
function removeColour() {
    if (nodes > 0) {
        document
            .getElementById("colours")
            .removeChild(colours_div.lastElementChild);
        nodes--;
    }
    createCustomPalette();
}

// When the user is done with their custom theme, the colour data is loaded into the theme array
function createCustomPalette() {
    var hex_colour = "#FFFFFF";
    var hex_parsed = 0;
    var colour_palette = [];

    for (var i = 0; i < nodes; i++) {
        hex_colour = document.getElementById("node" + i).value;
        hex_parsed = hex_colour.match(
            /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i
        );
        colour_palette[i * 3] = parseInt(hex_parsed[1], 16);
        colour_palette[i * 3 + 1] = parseInt(hex_parsed[2], 16);
        colour_palette[i * 3 + 2] = parseInt(hex_parsed[3], 16);
    }

    theme = colour_palette;
    displayPalette();
}

function dither() {
    dithering = !dithering;
    document.getElementById("dither-checkbox").checked = dithering;
}

function initialize() {
    if (theme.length == 0) {
        scrollTheme();
    }
    if (customMenu.style.display === "block") {
        createCustomPalette();
    }
    loadingScreen.style.opacity = "100";
    loadingScreen.style.visibility = "visible";
    loadingScreen.style.transition = "0s";
    setTimeout(function () {
        convertImage();
        loadingScreen.style.transition = "0.5s";
        loadingScreen.style.opacity = "0";
        loadingScreen.style.visibility = "hidden";
    }, 0);
}

function nearestColour(targetColour) {
    let minDistance = Infinity;
    let closestColor = theme[0];

    for (let i = 0; i < theme.length; i += 3) {
        let color = [theme[i], theme[i + 1], theme[i + 2]];
        // Euclidean distance in RGB space
        let distance = Math.sqrt(
            Math.pow(targetColour[0] - color[0], 2) +
                Math.pow(targetColour[1] - color[1], 2) +
                Math.pow(targetColour[2] - color[2], 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    return closestColor;
}

/*
This is the function that processes the image.
It works by scanning every pixel and finding the nearest colour.
After finding the nearest colour, it uses that data to reconstruct the image.
If we are dithering, we calculate the quantization error and distribute it using the Sierra Lite kernel.
*/
function convertImage() {
    downloadButton.style.visibility = "hidden";
    resetButton.style.visibility = "hidden";
    // Assigning variables
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;

            // Get the original pixel colour
            let oldPixel = [
                pixels[index],
                pixels[index + 1],
                pixels[index + 2],
            ];

            // Find the closest color from the palette
            let newPixel = nearestColour(oldPixel);

            // Replace the pixel with the new colour
            pixels[index] = newPixel[0];
            pixels[index + 1] = newPixel[1];
            pixels[index + 2] = newPixel[2];

            if (dithering) {
                // Calculate quantization error
                let quantError = [
                    oldPixel[0] - newPixel[0],
                    oldPixel[1] - newPixel[1],
                    oldPixel[2] - newPixel[2],
                ];

                // Distribute the error using Sierra Lite kernel
                if (x + 1 < canvas.width) {
                    const rightIndex = index + 4;
                    pixels[rightIndex] += (quantError[0] * 1) / 2;
                    pixels[rightIndex + 1] += (quantError[1] * 1) / 2;
                    pixels[rightIndex + 2] += (quantError[2] * 1) / 2;
                }

                if (y + 1 < canvas.height) {
                    const belowIndex = index + canvas.width * 4;
                    pixels[belowIndex] += (quantError[0] * 1) / 2;
                    pixels[belowIndex + 1] += (quantError[1] * 1) / 2;
                    pixels[belowIndex + 2] += (quantError[2] * 1) / 2;
                }
            }
        }
    }

    // Reconstruct the image and make the download/reset buttons visible
    ctx.putImageData(imageData, 0, 0);
    downloadButton.style.visibility = "visible";
    resetButton.style.visibility = "visible";
    loadingScreen.style.visibility = "hidden";
}

// Download function
function downloadImage() {
    image = canvas.toDataURL("image/png");
    var link = document.createElement("a");
    link.download = "wallpaper-theme-converter.png";
    link.href = image;
    link.click();
}

// Change the theme when scrolling or when user selects a theme
function scrollTheme(scrollDirection = 0) {
    const themes_index = themes_keys.indexOf(menu.value);
    var new_value = scrollDirection > 0 ? themes_index + 1 : themes_index - 1;
    if (scrollDirection === 0) new_value = themes_index;

    if (new_value >= 0 && new_value < themes_keys.length) {
        menu.value = themes_keys[new_value];
    } else if (new_value < 0) {
        menu.value = themes_keys[themes_keys.length - 1];
    } else if (new_value >= themes_keys.length) {
        menu.value = themes_keys[0];
    }

    openCustomMenu(true);
    theme = list_of_themes[menu.value];
    displayPalette();
}

// User can scroll through themes on the drop-down menu
menu.addEventListener("wheel", (event) => {
    // Prevent scrolling the entire page
    event.preventDefault();
    // Scroll the menu vertically
    scrollTheme(event.deltaY);
});

// Event listener for drop-down menu to set the theme selected
document.getElementById("theme-select").onchange = function () {
    scrollTheme();
};

// Updates palette when user sets a colour in the custom menu
document.addEventListener("click", function (event) {
    if (event.target.type === "color") {
        event.target.addEventListener("input", function () {
            createCustomPalette();
        });
    }
});
