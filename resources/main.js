const header = document.querySelector('header');
const leftContainer = document.querySelector('#left-container');
const rightContainer = document.querySelector('#right-container');

const currentYear = document.querySelectorAll('.current-year');
const navigationList = document.querySelector('#navigation-list');
const headers = document.querySelectorAll('#content-container h2,' +
	'#content-container h3,' +
	'#content-container h4');


currentYear.forEach(element => {
	element.innerHTML = new Date().getFullYear().toString();
});


addEventListener('load', e => {
	leftContainer.style['max-height'] =
		rightContainer.style['max-height'] = screen.height - header.offsetHeight - 50 + 'px';

	headers.forEach((header) => {
		const headerLI = document.createElement('li');
		navigationList.appendChild(headerLI);
		const headerLink = document.createElement('a');
		headerLink.href = '#' + header.id;
		headerLI.appendChild(headerLink);
		const headerElement = document.createElement(header.tagName);
		headerElement.innerHTML = header.innerHTML;
		headerLink.appendChild(headerElement);
	});
});
