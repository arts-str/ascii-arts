const head = document.head;
let currentIcon;
const icon = document.getElementById('icon');
const iconPath = "img/ico/png/";
const iconAtlas = ["1", "2", "3", "4", "5", "6", "7"];
const type = ".png";
let index = 0;
setInterval(() => {
    icon.href = `${iconPath}${iconAtlas[index]}${type}?v=${Date.now()}`;
    index = (index + 1) % iconAtlas.length;
}, 800);
