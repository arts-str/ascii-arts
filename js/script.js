const imageInput = document.getElementById("image-input");
const canvas = document.getElementById("canvas");
const container = document.getElementById("container");
const ctx = canvas.getContext('2d');

const atlas = [" ", ".", "-", "/", "=", "+", "%", "@"];

imageInput.oninput = () =>{
    const READER = new FileReader();
    let img = new Image();
    let imgData;
    
    READER.onload = (e) =>{
        
        img.src = e.target.result;
        ctx.drawImage(img, 0, 0);
        imgData = ctx.getImageData(0, 0, img.width, img.height);
        grayscale(imgData);
        console.log(returnPixelBWValueFromData(imgData))
        let pixelsValues = returnPixelBWValueFromData(imgData);
        let array2D = to2DArray(pixelsValues, img.width, img.height);

        let line = "";
        for (let j = 0; j < img.height; j++) {
            for (let i = 0; i < img.width; i++) {
                line += returnAltasForValue(array2D[j][i]);
            }
            line += "<br>"
        }
        console.log(line);
        container.innerHTML = line;
    }
    READER.readAsDataURL(imageInput.files[0]);
    
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
