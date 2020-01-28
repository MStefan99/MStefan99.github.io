const menuButton = document.querySelector("#menu-button");
const menu = document.querySelector("#menu-container");
const closeButtonList = document.querySelectorAll(".close-button");
const currentYear = document.querySelector("#current-year");
const today = Date();

menuButton.addEventListener("click", () => {
    menu.classList.toggle("hidden-right");
});


closeButtonList.forEach(element => {
    element.addEventListener("click", () => {
        element.parentElement.classList.add("dismissed");
    });
});

currentYear.innerHTML = today.getFullYear().toString();
