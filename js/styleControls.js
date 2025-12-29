const controlHeader = document.getElementById("controls-header");

/**Muestra y esconde el panel de controles */
controlHeader.onclick = () =>{
    controlHeader.children[1].classList.toggle("rotated");
    controlHeader.parentElement.classList.toggle("closed-controls");
}

/**
 * Activa un mensaje de advertencia al usuario cuando el valor del arte ascii es mayor que el ancho de la imagen original
 */
function activateWidthWarning(msg) {
    if (img.width < Number(widthInput.value)) {
            widthOutput.parentElement.classList.add('warning');
            widthOutput.parentElement.children[0].classList.add('warning');
            widthWarning.textContent = msg;
            widthWarning.classList.remove('inactive');
        }else{
            widthWarning.classList.add('inactive');
            widthWarning.textContent = '';
            widthOutput.parentElement.children[0].classList.remove('warning');
            widthOutput.parentElement.classList.remove('warning');
        }
}