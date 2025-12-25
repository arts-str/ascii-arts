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
const canvas = document.createElement('canvas');
const container = document.getElementById("container");
const ctx = canvas.getContext('2d');
const READER = new FileReader(); //Lector de archivos
let atlas = ["@", "%", "+", "=", "/", "-", ".", " "]; //ATLAS DE CARACTERES
let img = new Image(); //Imagen
let imgData; //imgData global vacio
let MAX_WIDTH = widthInput.value; // Tamaño de la imagen del canvas
const invertInput = document.getElementById("invert-input");

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

    updateAtlasInput();

    //Se cargan los valores de los sliders a sus output label
    widthOutput.textContent = widthInput.value + " caracteres"; 
    fontSizeOutput.textContent = fontSizeInput.value + "px";
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

function returnPixelColorValue(imgData) {
    let data = imgData.data;
    let pixels = [];
    for (let i = 0; i < data.length; i+=4) {
        pixels.push([data[i], data[i+1], data[i+2]])
        
    }
    return pixels
}

/**Devuelve el caracter correcto dependiendo del valor del pixel */
function returnAltasForValue(value) {
    let possiblePositions = atlas.length; //Total de elementos en el atlas
    let index = Math.floor(value / (256 / possiblePositions)); //Calcula el indice de posicion dependiendo del valor
    return atlas[index] //Devuelve el caracter correcto del atlas
}

/**Pasa un array de 1D a uno de 2D
 * @param arr El array 1D
 * @param n Ancho del nuevo array
 * @param m Alto del nuevo array
 * @returns Array 2D
*/
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

/**
 * Funcion para dibujar en ASCII
 */
function drawAscii() {
    const SCALE_Y = 0.5; //Escala en vertical para tener en cuenta que los caracteres tienen mas alto que ancho

    const scale = Math.min(1, Number(MAX_WIDTH) / img.width); //Calcula la escala

    const width = Math.floor(img.width * scale); //Valor de ancho
    const height = Math.floor(img.height * scale * SCALE_Y); //Valor de alto


    //Aplica las escalas al canvas
    canvas.width = width; 
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height); //Dibuja la imagen

    const imgData = ctx.getImageData(0, 0, width, height); //Toma la data de la imagen
    const pixelColorValues = returnPixelColorValue(imgData);
    const imgData2D = to2DArray(pixelColorValues, width, height);
    
    const pixelsValues = returnPixelBWValueFromData(imgData); //Valores en ByN
    const array2D = to2DArray(pixelsValues, width, height); //Valores en ByN hechos array 2D

    let line = ""; //String de linea
    for (let y = 0; y < height; y++) { //Por cada fila
        for (let x = 0; x < width; x++) { //Y cada columna
            line += `<p style="display:inline; color:rgb(${imgData2D[y][x][0]},${imgData2D[y][x][1]},${imgData2D[y][x][2]})">${returnAltasForValue(array2D[y][x])}</p>`; //Agregar a la linea el caracter correcto para esa posición
        }
        line += "<br>"; //Al final de cada fila agrega un salto de linea
    }

    container.innerHTML = line; //Agrega el ascii al container
}

/**METODOS PARA GUARDAR EL ASCII */

let font = "24px monospace"
let lineHeight = 24;

/**Guarda el ASCII como PNG*/
function saveAsciiAsImage() {
    let art = container.textContent; //Texto ASCII

    const saveCanvas = document.createElement('canvas'); //Crea un offscreen canvas
    const saveCTX = saveCanvas.getContext('2d'); //Contexto

    saveCTX.font = font; //Setea la fuente

    const lines = art.split('\n'); //Separa las lineas con los saltos de pagina
    let maxWidth = 0; //Ancho máximo vacio
    lines.forEach(line =>{ //Por cada linea
        const metrics = saveCTX.measureText(line) //Mide el ancho
        if (metrics.width > maxWidth) { //Si es mayor que el valor de ancho previo
            maxWidth = metrics.width; //Setea el valor al ancho de la linea
        }
    });

    saveCanvas.width = maxWidth; //Setea el canvas al ancho maximo de las lineas
    saveCanvas.height = lines.length * lineHeight; //El alto a la cantidad de lineas * el interlineado

    saveCTX.fillStyle = '#ffffff00'; //Fondo transparente
    saveCTX.fillRect(0, 0, saveCanvas.width, saveCanvas.height); //Llena el canvas
    saveCTX.fillStyle = '#000000'; //Color negro
    saveCTX.font = font; //Re-setea la fuente (No estoy seguro por qué es necesario pero sino la imagen se corta o se salta los espacios)

    lines.forEach((line, index) =>{ //Para cada linea
        saveCTX.fillText(line, 0, 0 + (index +1) * lineHeight); //Rellena el texto en su posición correspondiente
    });

    const image = saveCanvas.toDataURL('image/png'); //Guarda el canvas como base64
    const link = document.createElement('a'); //Crea un offscreen anchor
    link.download = 'ascii-arts.png'; //Setea el nombre de descarga
    link.href = image; //El href como la imagen
    link.click(); //Clickea el link, descargando la imagen

    //Borra el offscreen canvas
    saveCanvas.remove();
}

downloadPNGButton.onclick = () =>{
    saveAsciiAsImage();
}
downloadSVGButton.onclick = () =>{
    saveAsciiSvg();
}
/**Guardar el ASCII como svg */
function saveAsciiSvg() {
    let art = container.textContent; //Texto ASCII
    let svg = document.createElement('svg') //Crea un offscreen SVG

    const lines = art.split('\n'); //Separa las lineas con los saltos de página
     
    //Setea la fuente y el whiteSpace a pre
    svg.style.font = font;
    svg.style.whiteSpace = "pre";

    
    lines.forEach((line, i) =>{ //Para cada linea
        let textLine = document.createElement('text'); //Crea un elemento text
        textLine.textContent = line; //Rellena con el texto
        textLine.setAttribute('x', 0); //Posiciona la x en 0
        textLine.setAttribute('y', lineHeight*(i+1)); //La altura es el interlineado * la linea actual
        textLine.setAttribute('xml:space', "preserve"); //Necesario para mantener los espacios intactos
        textLine.setAttribute('font-family', "monospace"); //Setea la fuente a monoespaciada
        svg.appendChild(textLine); //Agrega el elemento al svg
    });

    let lineWidth = lines[0].length * (lineHeight * 0.6); //Calcula mas o menos el ancho de la linea en base a una fuente monoespaciada

    //Traer el html del svg
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);

    //Reemplaza el XML namespace por el de svg
    source = source.replace(
      /<svg\b([^>]*)xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/,
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
    //Setea la vesion correcta
    if (!source.match(/<svg[^>]*\bversion="/)) {
      source = source.replace(
        /<svg\b/,
        '<svg version="1.1"'
      );
    }
    //Setea la viewbox en base al ancho de linea y la altura
    if (!source.match(/<svg[^>]*\bviewBox="/)) {
      source = source.replace(
        /<svg\b/,
        `<svg viewBox="0 0 ${lineWidth} ${lineHeight*lines.length}"`
      );
    }
    //Convertir el SVG a URI
    var url = "data:image/svg+xml;charset=utf-8,"+ encodeURIComponent(source);

    
    const link = document.createElement('a'); //Crea offscreen anchor
    link.download = 'ascii-arts.svg'; //Nombre del archivo
    link.href = url; //El href como la imagen
    link.click(); //Clickea el link, descargando la imagen
}

/**Funcion fallback para copiar el texto */
function fallbackCopyTextToClipboard() {

    container.focus(); //Focus en el container
    container.select(); //Lo selecciona
    try {
      var successful = document.execCommand('copy'); //Intenta copiar ejecutando el comando copy
      var msg = successful ? 'successful' : 'unsuccessful'; //Carga el mensaje dependiendo de si funcionó el comando
      console.log('Fallback: Copying text command was ' + msg); //Da feedback en la consola
    } catch (err) { //Si algo salió mal 
      console.error('Fallback: Oops, unable to copy', err); //Da feedback en la consola
    }
}
 /**Funcion para copiar el texto */
function copyTextToClipboard() {
    let art = container.textContent; //Toma el texto del container
    if (!navigator.clipboard) { //Si no tiene la funcionalidad clipboard
      fallbackCopyTextToClipboard(art); //Usa la funcion de fallback
      return; //Sale de la función actual
    }
    //Sino
    navigator.clipboard.writeText(art).then(function() { //Pasa el texto al clipboard
      console.log('Async: Copying to clipboard was successful!'); //Da feedback exitoso
      showCopyStatus(true) //Activa el dialogo exitoso
    }, function(err) { //Si falla
      console.error('Async: Could not copy text: ', err); //Da feedback de fallo
      showCopyStatus(false)//Activa el dialogo de fallo
    });
}

copyASCII.onclick = () =>{
    copyTextToClipboard();
}

/**Muestra el status de la acción de copiar
 * @param copied Booleano
 */
function showCopyStatus(copied){
    if (copied) { //Si copio correctamente
        copyDialog.textContent = "¡ASCII copiado correctamente!" //Cambia el texto del dialog
        mostrarDialog(copyDialog); //Lo muestra
    }else{ //Sino
        copyDialog.textContent = "Algo salió mal :(" //Cambia el texto del dialog
        mostrarDialog(copyDialog); //Lo muestra
    }
}
/**Mostrar el dialog */
function mostrarDialog(dialog) {
    dialog.show(); //Lo muestra
    dialog.style.opacity = "1"; //Activa la opacidad
    setTimeout(() => { //Timeout para esconderlo
        dialog.style.opacity = "0"; //Quita la opacidad
    }, 2000);
    setTimeout(() => {//Timeout para cerrarlo
        dialog.close() //Lo cierra
    }, 2200);
}

invertInput.oninput = () =>{
    reverseAtlas();
}

function reverseAtlas(){
    atlas.reverse();
    updateAtlasInput();
    drawAscii();
}

function updateAtlasInput(){
    for (let i = 0; i < characterInput.elements.length; i++) { //Se carga el atlas a las inputs de atlas
        characterInput.elements[i].value = atlas[i]
    }
}

/**TODO: PERMITIR ASCII EN BASE A LOS COLORES DE LA IMAGEN */
