/**
 * Activa un mensaje de advertencia al usuario cuando el valor del arte ascii es mayor que el ancho de la imagen original
 */
function activateWidthWarning(msg, condition) {
    if (condition) {
            widthWarning.parentElement.classList.add('warning');
            widthWarning.textContent = msg;
            widthWarning.classList.remove('inactive');
        }else{
            widthWarning.classList.add('inactive');
            widthWarning.textContent = '';
            widthWarning.parentElement.classList.remove('warning');
        }
}