var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('imageCanvas');
var ctx = canvas.getContext('2d');
const convertButton = document.getElementById('convert');
var downloadButton = document.getElementById('download-button');
downloadButton.style.visibility = 'hidden';
canvas.style.visibility = 'hidden';

convertButton.disabled = true;

function handleImage(e){
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
    canvas.style.visibility = 'visible';
}
let theme = [];

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
        convertButton.disabled = false;
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
        convertButton.disabled = false;
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
        133,153,0
    ]
    convertButton.disabled = false;
}

function Catppuccin(){
    theme = [
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
        137,220,235,
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
    ]
    convertButton.disabled = false;
}

function initialize(){ 
    downloadButton.style.visibility = 'hidden';
    var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
    var pixels = imageData.data;
    var numPixels = pixels.length;
    var lens = [];
    var minimum = 0;
    var x = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < numPixels; i+=4) {
        minimum = 0;
        for (var j = 0; j < theme.length; j+=3) {
            lens[x] = (Math.sqrt(Math.pow(pixels[i]-theme[j],2)+Math.pow(pixels[i+1]-theme[j+1],2)+Math.pow(pixels[i+2]-theme[j+2],2)));
            x += 1;  
        }
        x = 0;
        for (var k = 1; k < lens.length; k++) {
            if (lens[k] < lens[minimum]){
                minimum = k;      
                } 
           }
        for (var k = 0; k < 3; k++){
            pixels[i+k] = theme[minimum*3+k]
        }
    }
    ctx.putImageData(imageData, 0, 0);
    downloadButton.style.visibility = 'visible';

}
function Download(){
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = ("wallpaper-theme-converter.png");
    link.href = image;
    link.click();
}


