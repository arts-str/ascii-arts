const sliders = document.querySelectorAll('input[type=range]');
const downloadOptions = document.getElementById('download-options');
const downloadOptionsMenu = document.getElementById('download-options-menu');
const controlsHeader = document.getElementById('controls-header');

const controls = document.getElementById('controls');
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

for (const slider of sliders) {
  let space = slider.max - slider.min;

  // Function to immediately update the slider value smoothly
  const updateSliderValue = (e) => {
    slider.value -= Math.round((space / e.deltaY) * 5);
  };

  // Function to dispatch the input event after debounce
  const dispatchInputEvent = debounce(() => {
    slider.dispatchEvent(new Event('input'));
  }, 300); // Adjust the debounce timeout as needed

  slider.onmouseover = () => {
    for (const element of sliders) {
      element.blur();
    }

    slider.onwheel = (e) => {
      e.preventDefault();
      
      // Update the slider's value immediately for smooth motion
      updateSliderValue(e);
     e.target.nextElementSibling.textContent = e.target.nextElementSibling.textContent.replace(/(\d+)/, e.target.value);

      
      
      // Dispatch the input event after the debounce
      dispatchInputEvent();
    };
  };

  slider.onmouseout = () => {
    slider.onmouseover = () => {};
  };

  slider.onfocus = () => {
    slider.onwheel = (e) => {
      e.preventDefault();
      
      // Update the slider's value immediately for smooth motion
      updateSliderValue(e);
     e.target.nextElementSibling.textContent = e.target.nextElementSibling.textContent.replace(/(\d+)/, e.target.value);

      
      
      // Dispatch the input event after the debounce
      dispatchInputEvent();
    };
  };

  slider.onblur = () => {
    slider.onwheel = (e) => {};
  };
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

downloadOptions.onclick = () =>{
  const isOpen = downloadOptionsMenu.style.display === 'block'
  
  downloadOptionsMenu.style.display = isOpen ? 'none' : 'block';
}

downloadOptions.onmouseleave = () =>{
  if (downloadOptionsMenu.style.display === 'block') {
    downloadOptionsMenu.style.display = 'none';
  }
}
downloadOptions.onblur = () =>{
  if (downloadOptionsMenu.style.display === 'block') {
    downloadOptionsMenu.style.display = 'none';
  }
}

var mql = window.matchMedia('screen and (max-width: 768px)');
let isMobile = mql.matches;
mql.onchange = () => {
  if (mql.matches) {
    isMobile = true;
      
  } else {
    isMobile = false;
  }
}


controlsHeader.onclick = () =>{
  if (isMobile) {
    const isTransformed = controlsHeader.parentElement.style.transform === 'translateY(88%)'
    controlsHeader.parentElement.style.transform = isTransformed ? 'translateY(0)' : 'translateY(88%)';
    controlsHeader.children[1].style.rotate = isTransformed ? '0deg' : '180deg'
  }
}
controlsHeader.ontouchstart = () =>{
  if (isMobile) {
    const isTransformed = controlsHeader.parentElement.style.transform === 'translateY(88%)'
    controlsHeader.parentElement.style.transform = isTransformed ? 'translateY(0)' : 'translateY(88%)';
    controlsHeader.children[1].style.rotate = isTransformed ? '0deg' : '180deg'
  }
}