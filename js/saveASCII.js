/**METODOS PARA GUARDAR EL ASCII */

let font = "24px monospace"
let lineHeight = 24;

/**Guarda el ASCII como PNG*/
function saveAsciiAsImage() {    
    const saveCanvas = document.createElement('canvas'); //Crea un offscreen canvas
    const saveCTX = saveCanvas.getContext('2d'); //Contexto

    saveCTX.font = font; //Setea la fuente

    saveCTX.fillStyle = '#ffffff00'; //Fondo transparente
    saveCTX.fillRect(0, 0, saveCanvas.width, saveCanvas.height); //Llena el canvas
    
    if (colorMode) { //Si esta en modo color
        
        
        const charWidth = lineHeight * 0.6; //Ancho de caracter aproximado de fuente monoespaciada
        const charHeight = lineHeight; //Alto de caracter
        
        saveCTX.textBaseline = "top"; //Alinea el dibujo de texto a la esquina superior izquierda de cada celda
        
        const lines = container.innerHTML.split('\n'); //Dividir el contenido del texto en lineas
        const lineText = lines[0].replace(/<[^>]*>/g, ''); //Separa el contenido de texto
        saveCanvas.width = lineText.length * (lineHeight *0.6); //Setea el canvas al ancho maximo de las lineas
        saveCanvas.height = lines.length * lineHeight; //El alto a la cantidad de lineas * el interlineado
    
        saveCTX.font = font; //Setea la fuente
        console.log(saveCanvas);
        lines.forEach((lineHTML, row) => { //Por cada linea
            let col = 0; //Indice de columna    
            const spans = lineHTML.split('</span>'); //Divide la linea en sus diferentes spans  
            spans.forEach(spanHTML => { //Por cada span
                if (!spanHTML.trim()) return; //Si hay un espacio vacio sale de la funcion    
                const text = spanHTML.replace(/<[^>]*>/g, ''); //Separa el contenido de texto
                const match = spanHTML.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/); //Toma los valores rgb  
                if (!match) return; //Si el span no tiene la linea rgb sale de la funcion 
                const [r, g, b] = match.slice(1).map(Number); //Convierte la linea rgb a numeros  
                saveCTX.fillStyle = `rgb(${r},${g},${b})`; //Setea el color del contexto del canvas al color del span 
                for (const ch of text) { //Para cada caracter del contenido de texto del span
                    saveCTX.fillText( //Dibuja el caracter en su posición correspondiente
                        ch,
                        col * charWidth,
                        row * charHeight
                    );
                    col++; //Mover a la siguiente columna
                }
            });
        });


    }else{ //Si esta en modo monocromatico
        const lines = container.innerHTML.split('\n'); //Dividir el contenido del texto en lineas
        const lineText = lines[0].replace(/<[^>]*>/g, ''); //Separa el contenido de texto
        saveCanvas.width = lineText.length * (lineHeight *0.6); //Setea el canvas al ancho maximo de las lineas
        saveCanvas.height = lines.length * lineHeight; //El alto a la cantidad de lineas * el interlineado
        saveCTX.fillStyle = '#000000'; //Color negro
        saveCTX.font = font; //Re-setea la fuente (No estoy seguro por qué es necesario pero sino la imagen se corta o se salta los espacios)
        lines.forEach((line, index) =>{ //Para cada linea
            saveCTX.fillText(line, 0, 0 + (index + 1) * lineHeight); //Rellena el texto en su posición correspondiente
        });
    }

    

    const image = saveCanvas.toDataURL('image/png'); //Guarda el canvas como base64
    const link = document.createElement('a'); //Crea un offscreen anchor
    link.download = 'ascii-arts.png'; //Setea el nombre de descarga
    link.href = image; //El href como la imagen
    link.click(); //Clickea el link, descargando la imagen

    //Borra el offscreen canvas
    saveCanvas.remove();
}

/**Guardar el ASCII como svg */
function saveAsciiSvg() {
    let art = container.innerHTML; //Texto ASCII
    
    let svg = document.createElement('svg') //Crea un offscreen SVG
    
    //Setea la fuente y el whiteSpace a pre
    svg.style.font = font;
    let lines, lineWidth;
    if (colorMode) {
        lines = art.split('\n'); //Separa las lineas con los saltos de página
        const lineText = lines[0].replace(/<[^>]*>/g, ''); //Separa el contenido de texto
        lineWidth = lineText.length * (lineHeight * 0.6); //Calcular el ancho de linea
        let xPos = 0; //Posicion en x inicial
        lines.forEach((lineHTML, row) => { //Por cada linea
            
            
            const charWidth = lineHeight * 0.6; //Ancho de caracter aproximado de fuente monoespaciada
            const charHeight = lineHeight; //Alto de caracter
            let textLine= document.createElement('text'); //Crea un elemento text 
            textLine.setAttribute('x', 0); //Posiciona la x
            textLine.setAttribute('y', (row + 1) * charHeight); //Posiciona la y
            textLine.setAttribute('xml:space', "preserve"); //Necesario para mantener los espacios intactos
            textLine.setAttribute('font-family', "monospace"); //Setea la fuente a monoespaciada
            const spans = lineHTML.split('</span>'); //Divide la linea en sus diferentes spans  
            
            spans.forEach(spanHTML => { //Por cada span
                if (!spanHTML.trim()) return; //Si hay un espacio vacio sale de la funcion   
                
                const text = spanHTML.replace(/<[^>]*>/g, ''); //Separa el contenido de texto
                
                const match = spanHTML.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/); //Toma los valores rgb  
                if (!match) return; //Si el span no tiene la linea rgb sale de la funcion 
                const [r, g, b] = match.slice(1).map(Number); //Convierte la linea rgb a numeros  
                const color = `rgb(${r},${g},${b})`; //Setea el color del contexto del canvas al color del span
               
                let tspan = document.createElement('tspan'); //Crea un elemento tspan
                tspan.textContent = text; //Rellena con el texto
                tspan.setAttribute('x', xPos); //Posiciona la x 
                tspan.setAttribute('fill', color); //Setea la fuente a monoespaciada
                textLine.appendChild(tspan); //Agrega el tspan a la linea de texto
                xPos += charWidth*text.length; //Aumenta la posicion en x por el ancho del tspan
                
            });
            svg.appendChild(textLine); //Agrega la linea al svg
            xPos = 0; //Resetea la posicion en x a 0
        });
    }else{
        lines = art.split('\n'); //Separa las lineas con los saltos de página        
        lineWidth = lines[0].length * (lineHeight * 0.6) //Calcular el ancho de linea
        lines.forEach((line, i) =>{ //Para cada linea
            let textLine = document.createElement('text'); //Crea un elemento text
            textLine.textContent = line; //Rellena con el texto
            textLine.setAttribute('x', 0); //Posiciona la x en 0
            textLine.setAttribute('y', lineHeight*(i+1)); //La altura es el interlineado * la linea actual
            textLine.setAttribute('xml:space', "preserve"); //Necesario para mantener los espacios intactos
            textLine.setAttribute('font-family', "monospace"); //Setea la fuente a monoespaciada
            svg.appendChild(textLine); //Agrega el elemento al svg
        });

    }



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

downloadPNGButton.onclick = () =>{
    saveAsciiAsImage();
}
downloadSVGButton.onclick = () =>{
    saveAsciiSvg();
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