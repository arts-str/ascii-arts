const imageInput = document.getElementById("image-input");
const widthInput = document.getElementById("width-input");
const widthOutput= document.getElementById("width-output");
const widthWarning = document.getElementById("width-warning");
const fontSizeOutput = document.getElementById("font-size-output");
const characterInput = document.getElementById("character-inputs");
const downloadPNGButton = document.getElementById("download-png");
const downloadSVGButton = document.getElementById("download-svg");
const copyASCII = document.getElementById("copy-to-clipboard");
const copyDialog = document.getElementById("copy-dialog");
const colorInput = document.getElementById("monochrome-input");
const invertColorControls = document.getElementById('invert-color-controls');
const invertColorInput = document.getElementById("invert-color-input");
const invertCharsInput = document.getElementById("invert-chars-input");
const canvas = document.createElement('canvas');
const container = document.getElementById("container");
const ctx = canvas.getContext('2d');
const READER = new FileReader(); //Lector de archivos
let atlas = ["@", "%", "+", "=", "/", "-", ".", " "]; //ATLAS DE CARACTERES
let img = new Image(); //Imagen
let imgData; //imgData global vacio
let MAX_WIDTH = widthInput.value; // Tamaño de la imagen del canvas

let colorMode = colorInput.checked; //Modo de color
let isColorInverted = invertColorInput.checked; //Colores invertidos

imageInput.oninput = async () =>{ //Cuando el usuario sube una imagen
    const file = imageInput.files[0]; //Tomamos el archivo
    if (!file) return; //Si cancela la operación salimos de la funcion

    READER.onload = async (e) =>{ //Al cargar el lector
        img.src = e.target.result; //La fuente de la imagen es el resultado del lector
        await saveImageToDB('image-loaded', e.target.result); //Se guarda con IndexerDB para mantener la imagen entre sesiones
    }

    img.onload = () => { //Al cargar la imagen
        drawAscii(); //Dibujar
    };

    READER.readAsDataURL(file); //Leer la imagen con el lector y pasarla a base64
}
widthInput.oninput = () =>{ //Cuando se modifica el slider de ancho
    MAX_WIDTH = Number(widthInput.value); //Modificar el valor de MAX_WIDTH
    
    widthOutput.textContent = widthInput.value + " caracteres"; //Modificar el texto que muestra el valor de ancho

    if (img.src != "") { //Si la imagen no está vacía
        activateWidthWarning(); //Da un feedback al usuario si el valor es mayor que el ancho de la imagen
        drawAscii(); //Re-Dibuja
    }
}
window.onload = async () =>{ //Cuando carga la página


    const savedImage = await loadImageFromDB('image-loaded'); //Buscamos una imagen previa en IndexerDB
    if (savedImage) { //Si existe
        img.src = savedImage; //Cargamos la imagen
        img.onload = () => drawAscii(); //Al cargar, se dibuja
    }

    if (isColorInverted) { //Si los colores estan invertidos
        const width = canvas.width;
        const height = canvas.height
        imgData = ctx.getImageData(0, 0, width, height); //Toma la data de la imagen
        invertImg(imgData); //Invierte los colores
        reverseAtlas(); //Invierte el atlas
    }
    //Se cargan los valores de los sliders a sus output label
    widthOutput.textContent = widthInput.value + " caracteres"; 
    fontSizeOutput.textContent = fontSizeInput.value + "px";
    container.style.fontSize = fontSizeInput.value + "px"
    container.style.lineHeight = fontSizeInput.value + "px"
}
for (const input of characterInput.elements) { //Para cada input del atlas
    input.oninput = () => { //Al ingresar un valor
        //Mantener solo el primer caracter tipeado
        input.value = input.value.slice(0, 1);

        //Busca la posición del caracter
        const position = [...characterInput.elements].indexOf(input);

        //Si la input esta vacía, usar un espacio, sino rellenar con el valor de la input
        atlas[position] = input.value === "" ? " " : input.value;

        if (img.src !== "") { //Si la imagen no esta vacía
            drawAscii(); //Re-Dibujar
        }
    };
}
/**
 * Devuelve el valor ByN de la imagen
 * @param {*} imgData Objeto de datos de imagen
 * @returns Array de pixeles
 */
function returnPixelBWValueFromData(imgData) {
    let data = imgData.data; //Toma los valores rgb de la imagen
    let pixels = []; //Array vacio de pixeles
    for (let i = 0; i < data.length; i+=4) { //Cada 4 valores
            let avg = Math.round((data[i] + data[i+1] + data[i+2]) / 3); //Promedia los 3 valores de color
            pixels.push(avg); //Los agrega al array de pixeles
    }
    return pixels //Devuelve el array de pixeles
}

/**
 * Devuelve el valor [R, G, B] de la imagen
 * @param {*} imgData 
 * @returns Array de pixeles
 */
function returnPixelColorValue(imgData) {
    let data = imgData.data; //RGB de la imagen
    let pixels = []; //Array vacio de pixeles
    for (let i = 0; i < data.length; i+=4) { //Cada 4 valores
        pixels.push([data[i], data[i+1], data[i+2]]) //Agrega los primeros 3 al array de pixeles (Omite transparencia)
        
    }
    return pixels //Devuelve el array de pixeles
}

/**Devuelve el caracter correcto dependiendo del valor del pixel */
function returnAltasForValue(value) {
    let possiblePositions = atlas.length; //Total de elementos en el atlas
    let index = Math.floor(value / (256 / possiblePositions)); //Calcula el indice de posicion dependiendo del valor
    return atlas[index] //Devuelve el caracter correcto del atlas
}

/**
 * Funcion para dibujar en ASCII a Color
 */
function drawAsciiColor() {
    const SCALE_Y = 0.5; //Escala en vertical para tener en cuenta que los caracteres tienen mas alto que ancho

    const scale = Math.min(1, Number(MAX_WIDTH) / img.width); //Calcula la escala

    const width = Math.floor(img.width * scale); //Valor de ancho
    const height = Math.floor(img.height * scale * SCALE_Y); //Valor de alto


    //Aplica las escalas al canvas
    canvas.width = width; 
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height); //Dibuja la imagen

    imgData = ctx.getImageData(0, 0, width, height); //Toma la data de la imagen
    if (isColorInverted) invertImg(imgData);
    posterizeImageData(imgData, 3);
    ctx.putImageData(imgData, 0, 0);
    const bw = returnPixelBWValueFromData(imgData); //Valores en ByN para decidir el caracter
    const colors = returnPixelColorValue(imgData); //Valores a color para pintar el caracter

    let html = '' //String vacia para llenar con html
    let lastColor = null; //Color anterior para decidir si crear un nuevo span

    for (let i = 0; i < bw.length; i++) { //Por cada valor blanco y negro
        const char = returnAltasForValue(bw[i]); //Elegir el caracter correcto del atlas 
        //Setear los valores de color
        const [r, g, b] = colors[i]; 
        const color = `${r}, ${g}, ${b}`;

        //Si el color actual es diferente al color del caracter anterior
        if (color !== lastColor) {
            //Si no es nulo cerrar el span anterior
            if (lastColor !== null) html += '</span>'; 
            html += `<span style="color:rgb(${color})">`; //Agregar un span con el color correspondiente
            lastColor = color; //Setear lastColor al color actual
        }
        
        html += char; //Agregar el caracter correspondiente

        if ((i+1) % width === 0) { //Si esta al final de la linea 
            html += '</span>\n'; //Cerrar el span y agregar salto de pagina
            lastColor = null; //Devolver lastColor a ser nulo
        }
    }
    container.innerHTML = html; //Agrega al container
}

/**
 * Funcion para dibujar en ASCII monocromatico
 */
function drawAsciiMonochromatic() {
    const SCALE_Y = 0.5; //Escala en vertical para tener en cuenta que los caracteres tienen mas alto que ancho

    const scale = Math.min(1, Number(MAX_WIDTH) / img.width); //Calcula la escala

    const width = Math.floor(img.width * scale); //Valor de ancho
    const height = Math.floor(img.height * scale * SCALE_Y); //Valor de alto


    //Aplica las escalas al canvas
    canvas.width = width; 
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height); //Dibuja la imagen

    imgData = ctx.getImageData(0, 0, width, height); //Toma la data de la imagen
    const bw = returnPixelBWValueFromData(imgData); //Valores en ByN

    let line = ""; //Linea vacía

    for (let i = 0; i < bw.length; i++) { //Por cada valor blanco y negro
        line += returnAltasForValue(bw[i]) //Agregar a la linea el caracter correcto para esa posición
        if ((i+1) % width === 0) { //Si llega al final de la linea
            line += "<br>"; //Agregar salto de pagina
        }
    }

    container.innerHTML = line; //Agrega el ascii al container
}



invertColorInput.oninput = () =>{    
    isColorInverted = invertColorInput.checked;
    drawAscii();
}

invertCharsInput.oninput = () =>{
    reverseAtlas();
}

function reverseAtlas(){
    atlas.reverse();
    updateAtlasInput();
    drawAscii();
}

/**
 * Actualiza las inputs de atlas en base al atlas actual en memoria
 */
function updateAtlasInput(){
    for (let i = 0; i < characterInput.elements.length; i++) { //Se carga el atlas a las inputs de atlas
        characterInput.elements[i].value = atlas[i]
    }
}

/**
 * Posteriza los datos de imagen reduciendo la profundidad de colores
 * @param {*} imgData De un contexto canvas
 * @param {*} bits Numero entero de bits por canal (Por defecto 3)
 */
function posterizeImageData(imgData, bits=3){

    const mask = 0xFF << (8 - bits); //Bitmask que retiene los bits superiores del valor de color
    const data = imgData.data; //Toma los valores rgb de la imagen

    for (let i = 0; i < data.length; i+=4) { //Cada 4 valores
        //Aplica la mascara al canal correspondiente
        data[i] = data[i] & mask; //R
        data[i+1] = data[i+1] & mask; //G
        data[i+2] = data[i+2] & mask; //B


    }
}

colorInput.oninput = () =>{
    colorMode = colorInput.checked;
    drawAscii();
    if (colorMode) {
        invertColorControls.classList.remove("disabled");
    }else{
        invertColorControls.classList.add("disabled");
    }
}
/**
 * Decide que funcion de dibujo utilizar en base al booleano colorMode
 */
function drawAscii() {
    if (colorMode) { //Si esta en modo color
        drawAsciiColor(); //Llama la funcion de dibujar con color
    } else{ //Sino
        drawAsciiMonochromatic(); //Llama la funcion de dibujar en monocromatico
    }
}

/**
 * Funcion para invertir los colores del canvas
 * @param {*} imgData De un contexto canvas
 */
function invertImg(imgData) {
    let data = imgData.data; //Toma los valores rgb de la imagen
    for (let i = 0; i < data.length; i+=4) { //Cada 4 valores
        //Resta 255 - el valor actual del canal correspondiente, invirtiendo el color
        data[i] = 255 - data[i]; //R
        data[i+1] = 255 - data[i+1]; //G
        data[i+2] = 255 - data[i+2]; //B
    }
}

/**
 * Funcion de debug para descargar el canvas actual
 */
function downloadCanvas() {
    const anchor = document.createElement('a');
    anchor.download = "canvas.png";
    anchor.href = canvas.toDataURL()
    anchor.click();
}
