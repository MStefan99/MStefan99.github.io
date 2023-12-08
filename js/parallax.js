
(() => {
	const header = document.querySelector('header');

	header.oncontextmenu = e => {
		e.preventDefault();
		document.querySelector('.parallax').classList.toggle('debug')
	}
})();
