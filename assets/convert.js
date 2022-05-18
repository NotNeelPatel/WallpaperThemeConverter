// Canvas loading variables
var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('imageCanvas');
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

// Loads image onto canvas
function handleImage(e){
    ogimage = e;
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

    reader.readAsDataURL(e.target.files[0]);
    downloadButton.style.visibility = 'hidden';
    resetButton.style.visibility = 'hidden';     
    canvas.style.visibility = 'visible';
}

// Resets the image by taking the data of the original image and calling handleImage
function reset(){
    handleImage(ogimage);
}

// Displays the colour palette
function Palette(){
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
function Custom(){
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
function AddColour(){
    const colour_node = document.createElement("input");
    colour_node.setAttribute("type","color");
    colour_node.id = ("node" + nodes);
    colours_div.appendChild(colour_node);
    nodes++;
}

// Removes a colour swatch when pressed
function RemoveColour(){
    if (nodes > 0) {
        document.getElementById("colours").removeChild(colours_div.lastElementChild);
        nodes--;
    }
}

// When the user is done with their custom theme, the colour data is loaded into the theme array
function Done(){
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
    Palette();
}

function initialize(){
    loadingScreen.style.opacity = '100';
    loadingScreen.style.visibility = 'visible';
    loadingScreen.style.transition = '0s';
    setTimeout(function(){
        Start();
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
function Start(){ 
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
function Download(){
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = ("wallpaper-theme-converter.png");
    link.href = image;
    link.click();
}

// RGB values of each palette, stored in an array.
function Gruvbox(){
    theme = [
        40,40,40,
        29,32,33,
        50,48,47,
        60,56,54,
        80,73,69,
        102,92,84,
        124,111,100,
        235,219,178,
        251,241,199,
        213,196,161,
        189,174,147,
        168,153,132,
        146,131,116,
        204,36,29,
        251,73,52,
        214,93,14,
        254,128,25,
        215,153,33,
        250,189,47,
        152,151,26,
        184,187,38,
        104,157,106,
        142,192,124,
        69,133,136,
        131,165,152,
        177,98,134,
        211,134,155];
        Palette();
    }

function Nord(){
    theme = [
        46,52,64,
        59,66,82,
        67,76,94,
        76,86,106,
        216,222,233,
        229,233,240,
        236,239,244,
        143,188,187,
        136,192,208,
        129,161,193,
        94,113,172,
        191,97,106,
        208,135,112,
        235,203,139,
        163,190,140,
        180,142,173];
        Palette();
}

function Solarized(){
    theme = [
        0,43,54,
        7,54,66,
        88,110,117,
        101,123,131,
        131,148,150,
        147,161,161,
        238,232,213,
        253,246,227,
        181,137,0,
        203,75,22,
        220,50,47,
        211,54,130,
        108,113,196,
        38,139,210,
        42,161,152,
        133,153,0];
        Palette();
}

function Catppuccin(){
    theme = [
        22,19,32,
        26,24,38,
        30,30,46,
        48,45,65,
        87,82,104,
        110,108,126,
        152,139,162,
        195,186,198,
        217,224,238,
        201,203,255,
        245,224,220,
        242,205,205,
        221,182,242,
        245,194,231,
        232,162,175,
        242,143,173,
        248,189,150,
        250,227,176,
        171,233,179,
        181,232,224,
        150,205,251,
        137,220,235];
        Palette();
}

function Dracula(){
    theme = [
        40,42,54,
        68,71,90,
        68,71,90,
        248,248,242,
        98,114,164,
        139,233,253,
        80,250,123,
        255,184,108,
        255,121,198,
        189,147,249,
        255,85,85,
        241,250,140];
        Palette();
}
