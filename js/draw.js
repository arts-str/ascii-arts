
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