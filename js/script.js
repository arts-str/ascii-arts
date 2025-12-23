const imageInput = document.getElementById("image-input");
const widthInput = document.getElementById("width-input");
const widthOutput= document.getElementById("width-output");
const widthWarning = document.getElementById("width-warning");
const fontSizeOutput = document.getElementById("font-size-output");
const characterInput = document.getElementById("character-inputs");
const downloadPNGButton = document.getElementById("download-png");
const downloadSVGButton = document.getElementById("download-svg");

const canvas = document.createElement('canvas');
const container = document.getElementById("container");
const ctx = canvas.getContext('2d');

let atlas = [" ", ".", "-", "/", "=", "+", "%", "@"];

const READER = new FileReader();
let img = new Image();
let imgData;

let MAX_WIDTH = widthInput.value; // try 80–200

imageInput.oninput = async () =>{
    const file = imageInput.files[0];
    if (!file) return;

    READER.onload = async (e) =>{
        img.src = e.target.result;
        await saveImageToDB('image-loaded', e.target.result);
    }

    img.onload = () => {
        drawAscii();
    };

    READER.readAsDataURL(file);
}

widthInput.oninput = () =>{
    MAX_WIDTH = Number(widthInput.value);
    
    widthOutput.textContent = widthInput.value + " caracteres";

    if (img.src != "") {
        activateWidthWarning();
        drawAscii();
    }
}



window.onload = async () =>{
    const savedImage = await loadImageFromDB('image-loaded');
    if (savedImage) {
        img.src = savedImage;
        img.onload = () => drawAscii();
    }
    for (let i = 0; i < characterInput.elements.length; i++) {
        characterInput.elements[i].value = atlas[i]
    }
    widthOutput.textContent = widthInput.value + " caracteres";
    fontSizeOutput.textContent = fontSizeInput.value + "px";
}

for (const input of characterInput.elements) {
    input.oninput = () => {
        // keep only the first character typed
        input.value = input.value.slice(0, 1);

        const position = [...characterInput.elements].indexOf(input);

        // if input is empty, use a space
        atlas[position] = input.value === "" ? " " : input.value;

        if (img.src !== "") {
            drawAscii();
        }
    };
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

let font = "24px monospace"
let lineHeight = 24;

function saveAsciiAsImage() {
    let art = container.textContent;

    const saveCanvas = document.createElement('canvas');
    const saveCTX = saveCanvas.getContext('2d');

    saveCTX.font = font;

    const lines = art.split('\n');
    let maxWidth = 0;
    lines.forEach(line =>{
        const metrics = saveCTX.measureText(line)
        if (metrics.width > maxWidth) {
            maxWidth = metrics.width;
        }
    });

    const MAX_CANVAS_PIXELS = 80_000_000;

    const totalPixels = maxWidth * lines.length * lineHeight;

    if (totalPixels > MAX_CANVAS_PIXELS) {
        alert("Image too large to export. Reduce resolution or width.");
        return;
    }

    saveCanvas.width = maxWidth;
    saveCanvas.height = lines.length * lineHeight;

    saveCTX.fillStyle = '#ffffff00';
    saveCTX.fillRect(0, 0, saveCanvas.width, saveCanvas.height);
    saveCTX.fillStyle = '#000000';
    saveCTX.font = font;

    lines.forEach((line, index) =>{
        saveCTX.fillText(line, 0, 0 + (index +1) * lineHeight);
    });

    const image = saveCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'ascii-arts.png';
    link.href = image;
    link.click();

    saveCTX.setTransform(1, 0, 0, 1, 0, 0);
    saveCanvas.width = 0;
    saveCanvas.height = 0;
}

downloadPNGButton.onclick = () =>{
    saveAsciiAsImage();
}
downloadSVGButton.onclick = () =>{
    saveAsciiSvg();
}
function saveAsciiSvg() {
    let art = container.textContent;
    let svg = document.createElement('svg')

    const lines = art.split('\n');
    console.log(lines);

    svg.style.font = font;
    svg.style.whiteSpace = "pre";

    lines.forEach((line, i) =>{
        let textLine = document.createElement('text');
        textLine.textContent = line;
        textLine.setAttribute('x', 0);
        textLine.setAttribute('y', lineHeight*(i+1));
        textLine.setAttribute('xml:space', "preserve");
        textLine.setAttribute('font-family', "monospace");
        svg.appendChild(textLine);
    });

    let lineWidth = lines[0].length * (lineHeight * 0.6);

    //get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);
    
    
    source = source.replace(
      /<svg\b([^>]*)xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/,
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
    if (!source.match(/<svg[^>]*\bversion="/)) {
      source = source.replace(
        /<svg\b/,
        '<svg version="1.1"'
      );
    }
    if (!source.match(/<svg[^>]*\bviewBox="/)) {
      source = source.replace(
        /<svg\b/,
        `<svg viewBox="0 0 ${lineWidth} ${lineHeight*lines.length}"`
      );
    }
    //convert svg source to URI data scheme.
    var url = "data:image/svg+xml;charset=utf-8,"+ encodeURIComponent(source);

    const link = document.createElement('a');
    link.download = 'ascii-arts.svg';
    link.href = url;
    link.click();
}

/**TODO: PERMITIR ASCII EN BASE A LOS COLORES DE LA IMAGEN */