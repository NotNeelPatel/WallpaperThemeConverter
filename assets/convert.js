var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('imageCanvas');
var ctx = canvas.getContext('2d');


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
}

function initialize(){
    let gruvbox =  [
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
        211,134,155]
    var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
    var pixels = imageData.data;
    var numPixels = pixels.length;
    var lens = [];
    var minimum = 0;
    var x = 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    for (var i = 0; i < numPixels; i+=4) {
        minimum = 0;
        for (var j = 0; j < gruvbox.length; j+=3) {
            lens[x] = (Math.sqrt(Math.pow(pixels[i]-gruvbox[j],2)+Math.pow(pixels[i+1]-gruvbox[j+1],2)+Math.pow(pixels[i+2]-gruvbox[j+2],2)));
            x += 1;  
        }
        x = 0;
        for (var k = 1; k < lens.length; k++) {
            if (lens[k] < lens[minimum]){
                minimum = k;      
                } 
           }

        for (var k = 0; k < 3; k++){
            pixels[i+k] = gruvbox[minimum*3+k]
        }

    }
    ctx.putImageData(imageData, 0, 0);
}

