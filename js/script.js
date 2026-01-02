const imageInput = document.getElementById("image-input");
const widthInputSlider = document.getElementById("width-input-slider");
const widthInputNumber = document.getElementById("width-input-number");
const widthWarning = document.getElementById("width-warning");
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
let MAX_WIDTH = widthInputSlider.value; // Tamaño de la imagen del canvas

let colorMode = colorInput.checked; //Modo de color
let isColorInverted = invertColorInput.checked; //Colores invertidos

window.onload = async () =>{ //Cuando carga la página

    updateControlsBackgroundColor();
    updateInvertControlsVisibility(); //Actualizar el estado del control de invertir colores

    const savedImage = await loadImageFromDB('image-loaded'); //Buscamos una imagen previa en IndexerDB
    if (savedImage) { //Si existe
        img.src = savedImage; //Cargamos la imagen
        img.onload = () => { //Al cargar la imagen
            drawAscii() //Dibujar imagen
            updateContainerFont() //Actualizar el tamaño de fuente del container para no generar overflow
            setResolutionToImageWidth(); //Setear el valor maximo del slider de resolucion
            activateWidthWarning("Valores muy altos pueden causar que la pagina se realentice", widthInputSlider.value > 200 && colorMode);
        };
    }

    updateAtlasInput()
    if (isColorInverted) { //Si los colores estan invertidos
        const width = canvas.width;
        const height = canvas.height
        imgData = ctx.getImageData(0, 0, width, height); //Toma la data de la imagen
        invertImg(imgData); //Invierte los colores
        reverseAtlas(); //Invierte el atlas
    }
    
}

imageInput.oninput = async () =>{ //Cuando el usuario sube una imagen
    const file = imageInput.files[0]; //Tomamos el archivo
    if (!file) return; //Si cancela la operación salimos de la funcion
    
    READER.onload = async (e) =>{ //Al cargar el lector
        img.src = e.target.result; //La fuente de la imagen es el resultado del lector
        await saveImageToDB('image-loaded', e.target.result); //Se guarda con IndexerDB para mantener la imagen entre sesiones
    }

    img.onload = () => { //Al cargar la imagen
        
        drawAscii(); //Dibujar
        updateContainerFont(); //Actualizar el tamaño de fuente del container para no generar overflow
        setResolutionToImageWidth(); //Setear el valor maximo del slider de resolucion
        activateWidthWarning("Valores muy altos pueden causar que la pagina se realentice", widthInputSlider.value > 200 && colorMode);
    };

    READER.readAsDataURL(file); //Leer la imagen con el lector y pasarla a base64
}
widthInputSlider.oninput = () =>{ //Cuando se modifica el slider de ancho
    
    
    widthInputNumber.value = widthInputSlider.value;

    MAX_WIDTH = Number(widthInputSlider.value); //Modificar el valor de MAX_WIDTH
    if (img.src != "") { //Si la imagen no está vacía
        activateWidthWarning('¡La resolución de la imagen es muy pequeña!'); //Da un feedback al usuario si el valor es mayor que el ancho de la imagen
        drawAscii(); //Re-Dibuja
    }

    activateWidthWarning("Valores muy altos pueden causar que la pagina se realentice", widthInputSlider.value > 200 && colorMode);

    updateContainerFont() //Actualizar el tamaño de fuente del container para no generar overflow
}

widthInputNumber.oninput = () =>{
    widthInputNumber.value = widthInputNumber.value.replace(/^[a-zA-Z]+$/, '');
}

widthInputNumber.onchange = () =>{
    widthInputNumber.value = Math.min(widthInputNumber.value, widthInputNumber.max);
    widthInputNumber.value = Math.max(widthInputNumber.value, widthInputNumber.min);
    widthInputSlider.value = widthInputNumber.value;
    widthInputSlider.dispatchEvent(new Event('input'));
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

/**Updates the background color of the controls panel */
function updateControlsBackgroundColor() {
    container.style.background = colorMode ? '#ffffff00' : '#ffffff';
    controls.style.background = colorMode ? '#ffffff00' : '#000000aa';
}

colorInput.oninput = () =>{
    colorMode = colorInput.checked;
    updateControlsBackgroundColor()
    drawAscii();
    updateInvertControlsVisibility();
    activateWidthWarning("Valores muy altos pueden causar que la pagina se realentice", widthInputSlider.value > 200 && colorMode);
}

/**Updates the invert control visibility */
function updateInvertControlsVisibility() {
    if (colorMode) {
        invertColorControls.style.visibility = "visible";
    }else{
        invertColorControls.style.visibility = "hidden";
    }    
}

/**Actualiza los valores para calcular el tamaño de fuente correcto */
function updateFontSizeValues() {
    const rows = colorMode ? container.innerHTML.split('\n').length : container.innerHTML.split('<br>').length; //Difiere la manera de leer la cantidad de lineas si esta en modo color o no
    const viewportHeight = window.innerHeight; //Altura del viewport
    return [viewportHeight, rows] //Devuelve los valores
}
/**Calcula el tamaño de fuente correcto para que entre en el viewport */
function calculateFontSizeExact() {
    let [viewportHeight, rows] = updateFontSizeValues(); //Llama la funcion para actualizar los valores
    let size = viewportHeight / rows; //Hace el calculo
    return size; //Lo devuelve
}
/**Actualiza el tamaño de fuente del container */
function updateContainerFont() {
    container.style.fontSize = calculateFontSizeExact() + "px" //Actualiza el valor de fuente con el valor correcto
    container.style.lineHeight = calculateFontSizeExact() + "px"; //Actualiza el valor de interlineado con el valor correcto
}
/**Setea la propiedad max del slider de resolucion al valor del ancho de la imagen si este es menor a 500 */
function setResolutionToImageWidth() {
    if (img.width < 500) { //Si el ancho de la imagen es menor a 500
        widthInputSlider.setAttribute('max', img.width);
        widthInputNumber.setAttribute('max', img.width); //Setea el valor maximo del slider al ancho de la imagen        
    }else{ //Sino
        widthInputSlider.setAttribute('max', 500);
        widthInputNumber.setAttribute('max', 500); //Setea el valor maximo del slider a 500
    }
}
