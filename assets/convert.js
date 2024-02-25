// Canvas loading variables
var imageLoader = document.getElementById('drop-zone');
imageLoader.addEventListener('change', e => {
    handleImage(e.target.files[0])
});

window.addEventListener('paste', e => {
    handleImage(e.clipboardData.files[0]) 
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
    document.body.addEventListener(e, preventDefaults, false)
});

// Handle dropped files
document.body.addEventListener('drop', e => {
    handleImage(e.dataTransfer.files[0])
});

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

var canvas = document.getElementById('image-canvas');
var ctx = canvas.getContext('2d');


// Buttons and divs that get hidden/change
const downloadButton = document.getElementById('download-button');
const resetButton = document.getElementById('reset-button');
const customMenu = document.getElementById("custom-menu");
const loadingScreen = document.getElementById("loading-screen");
const colours_div = document.getElementById("colours");
const palette_div = document.getElementById('palette')

// Changing visibility of download/reset buttons, image canvas, and the menu for custom theme
downloadButton.style.visibility = 'hidden';
resetButton.style.visibility = 'hidden';
canvas.style.visibility = 'hidden';
loadingScreen.style.visibility = 'hidden';
customMenu.style.display = 'none';


// Global variables
let ogimage;
let theme = [];
let nodes = 0;
let colour_palette_count = 0;
let menuVisible = false;
let list_of_themes;

// Fetch data from themes.json
fetch("./assets/themes.json")
.then((res) => res.json())
.then((data) => {
    list_of_themes = data;
});

// Loads image onto canvas
function handleImage(source){
    ogimage = source;
    var reader = new FileReader();

    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
    }

    reader.readAsDataURL(source);
    downloadButton.style.visibility = 'hidden';
    resetButton.style.visibility = 'hidden';     
    canvas.style.visibility = 'visible';
}

// Resets the image by taking the data of the original image and calling handleImage
function reset(){
    handleImage(ogimage);
}

// Displays the colour palette
function displayPalette(){
    // Deletes previous colour palette
    if (colour_palette_count != 0){
        for (var i = 0; i < colour_palette_count; i++){
            document.getElementById("palette").removeChild(palette_div.lastElementChild);
        }
        colour_palette_count = 0;
    }
    // Create new colour palette
    var width = Math.max(window.screen.width, window.innerWidth);
    var square = "1em";
    if (width < 500){
        square = "0.5em"
    }
    for(var i = 0; i < theme.length; i+=3){
        const palette_node = document.createElement("div");
        palette_node.style.display = "inline-block";
        palette_node.style.height = square;
        palette_node.style.width = square;
        palette_node.style.border = '1px solid #aaa'; 
        palette_node.style.backgroundColor = "rgb("+theme[i]+","+theme[i+1]+","+theme[i+2]+")";
        palette_div.appendChild(palette_node);
        colour_palette_count++;
    }
}

// Opens the custom menu 
function openCustomMenu(){
    if (menuVisible == true){
        document.getElementById("custom-menu").style.display = "none";
        menuVisible = false;
        Done();
    } else {
        document.getElementById("custom-menu").style.display = "block";
        menuVisible = true;
    }
}

// Adds a colour swatch when pressed
function addColour(){
    const colour_node = document.createElement("input");
    colour_node.setAttribute("type","color");
    colour_node.id = ("node" + nodes);
    colours_div.appendChild(colour_node);
    nodes++;
}

// Removes a colour swatch when pressed
function removeColour(){
    if (nodes > 0) {
        document.getElementById("colours").removeChild(colours_div.lastElementChild);
        nodes--;
    }
}

// When the user is done with their custom theme, the colour data is loaded into the theme array
function closeCustomMenu(){
    var hex_colour = "#FFFFFF";
    var hex_parsed = 0;
    var colour_palette = [];

    for(var i = 0; i < nodes; i++){
        hex_colour = document.getElementById("node"+i).value;
        hex_parsed = hex_colour.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
        colour_palette[i*3] = parseInt(hex_parsed[1],16);
        colour_palette[i*3+1] = parseInt(hex_parsed[2],16);
        colour_palette[i*3+2] = parseInt(hex_parsed[3],16);
    }

    theme = colour_palette;
    customMenu.style.display = "none";
    menuVisible = false;
    displayPalette();
}

function initialize(){
    loadingScreen.style.opacity = '100';
    loadingScreen.style.visibility = 'visible';
    loadingScreen.style.transition = '0s';
    setTimeout(function(){
        convertImage();
        loadingScreen.style.transition = '0.5s';
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
    },0);
}
/*
This is the function that processes the image.
It works by scanning every pixel and finding the nearest colour.
After finding the nearest colour, it uses that data to reconstruct the image.
*/
function convertImage(){ 
    downloadButton.style.visibility = 'hidden';
    resetButton.style.visibility = 'hidden';
    // Assigning variables
    var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
    var pixels = imageData.data;
    var numPixels = pixels.length;
    var lens = [];
    var minimum = 0;
    var x = 0;

    // Create the canvas to the dimensions of the image
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // For every pixel in the image
    for (var i = 0; i < numPixels; i+=4) {
        minimum = 0;
        // For the amount of colours there are in the theme
        for (var j = 0; j < theme.length; j+=3) {
            // 3d distance formula
            lens[x] = (Math.sqrt(Math.pow(pixels[i]-theme[j],2)+Math.pow(pixels[i+1]-theme[j+1],2)+Math.pow(pixels[i+2]-theme[j+2],2)));
            x += 1;  
        }
        x = 0;
        // Sort to find the smallest value (closest distance)
        for (var k = 1; k < lens.length; k++) {
            if (lens[k] < lens[minimum]){
                minimum = k;      
                } 
           }

        // Assign the R,G, and B values based on the smallest value
        for (var k = 0; k < 3; k++){
            pixels[i+k] = theme[minimum*3+k]
        }
    }
    // Reconstruct the image and make the download/reset buttons visible
    ctx.putImageData(imageData, 0, 0);
    downloadButton.style.visibility = 'visible';
    resetButton.style.visibility = 'visible';
    loadingScreen.style.visibility = 'hidden';
}


//Download function. Works on desktop browsers only at the moment.
function downloadImage(){
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = ("wallpaper-theme-converter.png");
    link.href = image;
    link.click();
}

// Change values from RGB values of each palette, stored in themes.json
function changeTheme(name){
    theme = list_of_themes[name];
    displayPalette();
}