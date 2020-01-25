const menuButton = document.querySelector("#menu-button");
const menu = document.querySelector("#menu-container");

menuButton.addEventListener("click", function () {
    menu.classList.toggle("hidden-right");
});