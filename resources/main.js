
let btn = document.getElementById("contact");
let button1 = document.getElementById('btn1');
let button2 = document.getElementById('btn2');
let wrapper = document.getElementById('loader-wrapper');
let loader = document.getElementById('loader');
let navmenu = document.getElementById('navmenu');
var parallax = document.getElementsByClassName('parallax')[0];


time = setTimeout(load, 1000);

function load() {
    wrapper.classList.remove('loaded');
    loader.classList.remove('loaded');
}

window.onload = function(){
 wrapper.classList.add('loaded');
 loader.classList.add('loaded');
 clearTimeout(time);
};

function menu(){
    navmenu.classList.toggle('selected');
}

function menu_hide(){
    if(parallax.scrollTop == 0){
        navmenu.classList.add('selected');
    }
    else {
        navmenu.classList.remove('selected');
    }
}


btn.onclick = function () {

    btn.innerHTML = "Send email?";
    button1.style["display"] = "block";
    button2.style["display"] = "block";
};
button1.onclick = function () {

    btn.innerHTML="Contact me!";
    button1.style["display"] = "none";
    button2.style["display"] = "none";
};
button2.onclick = function () {

        btn.innerHTML="Contact me!";
        button1.style["display"] = "none";
        button2.style["display"] = "none";
};