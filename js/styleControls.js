const controlHeader = document.getElementById("controls-header");
const fontSizeInput = document.getElementById("font-size-input");

controlHeader.onclick = () =>{
    controlHeader.children[1].classList.toggle("rotated");
    controlHeader.parentElement.classList.toggle("closed-controls");
}

function activateWidthWarning() {
    if (img.width < Number(widthInput.value)) {
            widthOutput.parentElement.classList.add('warning');
            widthOutput.parentElement.children[0].classList.add('warning');
            widthWarning.classList.remove('inactive');
        }else{
            widthWarning.classList.add('inactive');
            widthOutput.parentElement.children[0].classList.remove('warning');
            widthOutput.parentElement.classList.remove('warning');
        }
}

fontSizeInput.oninput = () =>{
    container.style.fontSize = fontSizeInput.value + "px";
    container.style.lineHeight = fontSizeInput.value + "px";
    fontSizeOutput.textContent = fontSizeInput.value + "px";
}