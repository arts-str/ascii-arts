const sliders = document.querySelectorAll('input[type=range]'); //Todos los sliders en la pagina


for (const slider of sliders) { //Para cada uno
    let space = slider.max - slider.min; //Rango numerico
    
    
    slider.onmouseover = () =>{ //Cuando se hace hover
        for (const element of sliders) { //Por cada elemento que este en focus
            element.blur(); //Quita focus
        }
        slider.onwheel = (e) =>{ //Al girar la rueda del mouse
            e.preventDefault(); //Previene que la pagina scrollee
            slider.value -= Math.round((space/e.deltaY*5)); //Al valor actual se le quita la cantidad scrolleada, con esta ecuacion todos los sliders bajan la misma cantidad independientemente de sus min y max
            slider.dispatchEvent( new Event('input')) //Despacha un evento input para el resto de la funcionalidad del slider.
        }
        
    } 
    const onWheel = (e) => {
        e.preventDefault();
        slider.value -= Math.round(space / e.deltaY * 5);
        slider.dispatchEvent(new Event('input'));
    };

    slider.onfocus = () => { //Al hacer foco
        document.addEventListener('wheel', onWheel, { passive: false }); //Agrega el evento de rueda 
    };

    slider.onblur = () => { //Al quitar foco
        document.removeEventListener('wheel', onWheel); //Quita el evento de rueda
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