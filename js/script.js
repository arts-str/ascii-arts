const imageInput = document.getElementById("image-input");
const widthInput = document.getElementById("width-input");
const fontSizeInput = document.getElementById("font-size-input");
const widthOutput= document.getElementById("width-output");
const widthWarning = document.getElementById("width-warning");
const fontSizeOutput = document.getElementById("font-size-output");
const characterInput = document.getElementById("character-inputs");

const controlHeader = document.getElementById("controls-header");

const canvas = document.createElement('canvas');
const container = document.getElementById("container");
const ctx = canvas.getContext('2d');

let atlas = [" ", ".", "-", "/", "=", "+", "%", "@"];

const READER = new FileReader();
let img = new Image();
let imgData;

let MAX_WIDTH = 300; // try 80–200

imageInput.oninput = () =>{
    
    READER.onload = (e) =>{
        img.src = e.target.result;
        localStorage.setItem('image-loaded', e.target.result);
    }

    img.onload = () => {
        drawAscii();
    };

    READER.readAsDataURL(imageInput.files[0]);
}

widthInput.oninput = () =>{
    MAX_WIDTH = Number(widthInput.value);
    
    widthOutput.textContent = widthInput.value + " caracteres";

    if (img.src != "") {
        if (img.width < Number(widthInput.value)) {
            widthOutput.parentElement.classList.add('warning');
            widthWarning.classList.remove('inactive');
        }else{
            widthWarning.classList.add('inactive');
            widthOutput.parentElement.classList.remove('warning');
        }
        drawAscii();
    }
}

fontSizeInput.oninput = () =>{
    container.style.fontSize = fontSizeInput.value + "px";
    container.style.lineHeight = fontSizeInput.value + "px";
    fontSizeOutput.textContent = fontSizeInput.value + "px";
}

window.onload = () =>{
    if (localStorage.getItem('image-loaded') !== null) {
        img.src = localStorage.getItem('image-loaded');
        img.onload = () => {
            drawAscii();
        };
    }

    for (let i = 0; i < characterInput.elements.length; i++) {
        characterInput.elements[i].value = atlas[i]
    }
    widthOutput.textContent = widthInput.value + " caracteres";
    fontSizeOutput.textContent = fontSizeInput.value + "px";
}

for (const input of characterInput.elements) {    
    input.oninput = (e) =>{
        input.value = input.value.slice(0, 1); // keep only 1 character

        const position = [...characterInput.elements].indexOf(input);
        atlas[position] = input.value;     
        if (img.src != "") {
            drawAscii();
        }
    }
}

controlHeader.onclick = () =>{
    controlHeader.children[1].classList.toggle("rotated");
    controlHeader.parentElement.classList.toggle("closed-controls");
}

function returnPixelFromData(imgData) {
    let pixels = [];
    let pos = 0;
    for (let i = 0; i < imgData.length; i++) {
        if (pos === 2) {
            pos = 0;
            pixels.push([imgData[i-2], imgData[i-1], imgData[i]]);
        }
        pos++;
    }
    return pixels
}

function returnPixelBWValueFromData(imgData) {
    let data = imgData.data;
    let pixels = [];
    for (let i = 0; i < data.length; i+=4) {
            let avg = Math.round((data[i] + data[i+1] + data[i+2]) / 3);
            pixels.push(avg);
    }
    return pixels
}


function grayscale(imgData) {
    let data = imgData.data;
    for (let i = 0; i < data.length; i+=4) {
            let avg = Math.round((data[i] + data[i+1] + data[i+2]) / 3);
            data[i] = avg;
            data[i+1] = avg;
            data[i+2] = avg;
    }

    ctx.putImageData(imgData, 0, 0)
}


function returnAltasForValue(value) {    
    if (value < 32) {
        return atlas[7];
    } else if (value < 64) {
        return atlas[6];
    } else if (value < 96) {
        return atlas[5];
    } else if (value < 128) {
        return atlas[4];
    } else if (value < 160) {
        return atlas[3];
    } else if (value < 192) {
        return atlas[2];
    } else if (value < 224) {
        return atlas[1];
    } else if (value < 255) {
        return atlas[0];
    } else {
        return atlas[0];
    }

}

function to2DArray(arr, n, m) {
    if (arr.length !== n * m) {
        throw new Error("Array size does not match dimensions");
    }

    const result = [];

    for (let row = 0; row < m; row++) {
        result.push(arr.slice(row * n, row * n + n));
    }

    return result;
}

function drawAscii() {
    const SCALE_Y = 0.5;

    const scale = Math.min(1, Number(MAX_WIDTH) / img.width);

    const width = Math.floor(img.width * scale);
    const height = Math.floor(img.height * scale * SCALE_Y);


    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    grayscale(imgData);

    const pixelsValues = returnPixelBWValueFromData(imgData);
    const array2D = to2DArray(pixelsValues, width, height);

    let line = "";
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            line += returnAltasForValue(array2D[y][x]);
        }
        line += "\n";
    }

    container.textContent = line;
}