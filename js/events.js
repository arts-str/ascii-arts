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