const sliders = document.querySelectorAll('input[type=range]');


for (const slider of sliders) {
    let space = slider.max - slider.min;
    
    
    slider.onmouseover = () =>{
        for (const element of sliders) {
            element.blur();
        }
        slider.onwheel = (e) =>{
            e.preventDefault();
            slider.value -= Math.round((space/e.deltaY*5));
            slider.dispatchEvent( new Event('input'))
        }
        
    } 
    const onWheel = (e) => {
        e.preventDefault();
        slider.value -= Math.round(space / e.deltaY * 5);
        slider.dispatchEvent(new Event('input'));
    };

    slider.onfocus = () => {
        document.addEventListener('wheel', onWheel, { passive: false });
    };

    slider.onblur = () => {
        document.removeEventListener('wheel', onWheel);
    };


}