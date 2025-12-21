const sliders = document.querySelectorAll('input[type=range]');


for (const slider of sliders) {
    let space = slider.max - slider.min;
    
    
    slider.onmouseover = () =>{
        slider.onwheel = (e) =>{
            e.preventDefault();
            slider.value -= Math.round((space/e.deltaY*5));
            slider.dispatchEvent( new Event('input'))
        }
        
    } 

}