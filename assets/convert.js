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

// Buttons and divs that get hidden/changed
const downloadButton = document.getElementById("download-button");
const resetButton = document.getElementById("reset-button");
const convertButton = document.getElementById("convert");
const colours_div = document.getElementById("colours");
const palette_div = document.getElementById("palette");
palette_div.onmouseleave = () => {
  palette_div.removeChild(removeButton);
};
const menu = document.getElementById("theme-select");

const plusButton = document.createElement("button");
plusButton.id = "plus-button";
plusButton.textContent = "+";
plusButton.onclick = function () {
  addCustomColour();
};

const removeButton = document.createElement("button");
removeButton.textContent = "x";
removeButton.className = "remove-button";

// Changing visibility of download/reset buttons, image canvas
canvas.style.visibility = "hidden";

// Global variables
var ogimage;
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
    // Apply the initial theme to the website
    applyWebsiteTheme(menu.value);
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
function displayPalette(theme) {
  // Deletes previous colour palette
  Array.from(palette_div.children).forEach((element) =>
    palette_div.removeChild(element),
  );

  // Create new colour palette
  theme.forEach((colour) => {
    const palette_node = document.createElement("input");
    palette_node.setAttribute("type", "color");
    palette_node.className = "palette-node";
    palette_node.setAttribute("value", colour);
    palette_node.onmouseover = () => {
      showRemoveButton(palette_node);
    };
    palette_div.appendChild(palette_node);
  });
  palette_div.appendChild(plusButton);
}

function randomColour() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Adds custom colour to the theme
function addCustomColour() {
  // remove the plus button
  palette_div.removeChild(palette_div.lastElementChild);
  const colour_node = document.createElement("input");
  colour_node.className = "palette-node";
  colour_node.setAttribute("type", "color");
  colour_node.value = randomColour();
  colour_node.onmouseover = () => {
    showRemoveButton(colour_node);
  };
  palette_div.appendChild(colour_node);
  palette_div.appendChild(plusButton);
  if (menu.value === "Custom") {
    applyCustomWebsiteTheme(getPalette());
  }
}

function showRemoveButton(palette_node) {
  palette_div.appendChild(removeButton);
  var rect = palette_node.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  var x = rect.right + scrollX - 0.5 * palette_node.offsetWidth;
  var y = rect.top + scrollY - 0.5 * palette_node.offsetHeight;
  removeButton.style.top = y + "px";
  removeButton.style.left = x + "px";
  removeButton.onclick = () => {
    palette_div.removeChild(removeButton);
    palette_div.removeChild(palette_node);
  };
}

function getPalette() {
  var theme = [];

  const colourDivs = palette_div.querySelectorAll(".palette-node");
  colourDivs.forEach((node) => {
    if (node.value) {
      theme.push(node.value);
    }
  });

  return theme;
}

// Apply a custom theme to the website
function applyCustomWebsiteTheme(colourPalette) {
  // Remove all theme classes from body
  document.body.classList.forEach((className) => {
    if (className.startsWith("theme-")) {
      document.body.classList.remove(className);
    }
  });

  // If we have enough colors in the palette, create a custom theme
  if (colourPalette.length >= 3) {
    // At least 3 colors
    // Get primary background and foreground colors
    const bgColor = colourPalette[0];
    const bgSecondary = colourPalette[1];
    const fgColor = colourPalette[2];

    // Apply custom colors directly to CSS variables
    document.documentElement.style.setProperty("--bg-primary", bgColor);
    document.documentElement.style.setProperty("--bg-secondary", bgSecondary);
    document.documentElement.style.setProperty("--bg-tertiary", bgSecondary);
    document.documentElement.style.setProperty("--fg-primary", fgColor);
    document.documentElement.style.setProperty("--fg-secondary", fgColor);
    document.documentElement.style.setProperty("--fg-tertiary", fgColor);
    document.documentElement.style.setProperty("--accent", bgSecondary);
    document.documentElement.style.setProperty("--border-color", fgColor);
  }
}

// Toggle dithering
function dither() {
  dithering = !dithering;
  document.getElementById("dither-checkbox").checked = dithering;
}

// On click of the Convert button
function initialize() {
  if (getPalette().length == 0) {
    scrollTheme();
  }

  setTimeout(function () {
    convertImage();
  }, 0);
}

// Get nearest colour using Euclidean distance formula (sqrt((r1-r0)^2 + (g1-g0)^2 + (b1-b0)^2))
// where r,g,b are the colour channels
function nearestColour(targetColour, colourScheme) {
  let minDistance = Infinity;
  let closestColor = colourScheme[0];

  for (let i = 0; i < colourScheme.length; i += 3) {
    let color = [colourScheme[i], colourScheme[i + 1], colourScheme[i + 2]];
    // Euclidean distance in RGB space
    let distance = Math.sqrt(
      Math.pow(targetColour[0] - color[0], 2) +
        Math.pow(targetColour[1] - color[1], 2) +
        Math.pow(targetColour[2] - color[2], 2),
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }
  return closestColor;
}

// Main function to convert the image, pixel by pixel
function convertImage() {
  convertButton.disabled = true;
  downloadButton.style.visibility = "hidden";
  resetButton.style.visibility = "hidden";

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pixels = imageData.data;
  // Avoid changing of theme mid-conversion
  theme = getPalette();
  if (theme.length == 0) {
    convertButton.disabled = false;
    return;
  }

  var colourScheme = [];
  for (let i = 0; i < theme.length; i++) {
    let hex = theme[i].replace(/^#/, "");
    colourScheme[3 * i] = parseInt(hex.slice(0, 2), 16);
    colourScheme[3 * i + 1] = parseInt(hex.slice(2, 4), 16);
    colourScheme[3 * i + 2] = parseInt(hex.slice(4, 6), 16);
  }

  let ditheringValue = dithering;
  let y = 0; // Start processing from the first row
  var batchSize = 0;
  // Make loading slightly faster on mobile
  if (window.innerWidth > 800) {
    batchSize = Math.floor(canvas.height / 16);
  } else {
    batchSize = Math.floor(canvas.height / 10);
  }

  // Load by chunk
  function processBatch() {
    let maxY = Math.min(y + batchSize, canvas.height); // Limit processing to batch size

    for (; y < maxY; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;

        // Get the original pixel colour
        let oldPixel = [pixels[index], pixels[index + 1], pixels[index + 2]];

        // Find the closest color from the palette
        let newPixel = nearestColour(oldPixel, colourScheme);

        // Replace the pixel with the new colour
        pixels[index] = newPixel[0];
        pixels[index + 1] = newPixel[1];
        pixels[index + 2] = newPixel[2];

        if (ditheringValue) {
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

    // Update the canvas after processing the batch
    ctx.putImageData(imageData, 0, 0);

    if (y < canvas.height) {
      // Continue processing the next batch
      setTimeout(processBatch, 0); // wait until ready for next batch
    } else {
      // Processing complete
      convertButton.disabled = false;
      downloadButton.style.visibility = "visible";
      resetButton.style.visibility = "visible";
    }
  }

  processBatch(); // Start the processing loop
}

// Download function
function downloadImage() {
  image = canvas.toDataURL("image/png");
  var link = document.createElement("a");
  link.download = "wallpaper-theme-converter.png";
  link.href = image;
  link.click();
}

// Apply the selected theme to the website
function applyWebsiteTheme(themeName) {
  // Remove all theme classes from body
  document.body.classList.forEach((className) => {
    if (className.startsWith("theme-")) {
      document.body.classList.remove(className);
    }
  });

  // Reset any custom CSS properties that might have been set
  resetCustomCSSProperties();

  // Convert theme name to CSS class name (lowercase, replace spaces with hyphens)
  const themeClass = "theme-" + themeName.toLowerCase().replace(/ /g, "-");

  // Add the new theme class to body
  document.body.classList.add(themeClass);
}

// Reset custom CSS properties that might have been set by custom themes
function resetCustomCSSProperties() {
  // List of CSS variables to reset
  const cssVars = [
    "--bg-primary",
    "--bg-secondary",
    "--bg-tertiary",
    "--fg-primary",
    "--fg-secondary",
    "--fg-tertiary",
    "--accent",
    "--border-color",
  ];

  // Remove the inline styles for each variable
  cssVars.forEach((variable) => {
    document.documentElement.style.removeProperty(variable);
  });
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

  displayPalette(list_of_themes[menu.value]);

  // Apply the selected theme to the website
  applyWebsiteTheme(menu.value);
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
