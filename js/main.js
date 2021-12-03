const header = document.querySelector('header');
const leftContainer = document.querySelector('#left-container');
const rightContainer = document.querySelector('#right-container');

const consentContainer = document.querySelector('#cookie-consent');
const consentCloseButton = document.querySelector('#consent-close');

const navigationList = document.querySelector('#navigation-list');
const headers = document.querySelectorAll('#content-container h2,' +
	'#content-container h3,' +
	'#content-container h4');


consentCloseButton.addEventListener('click', e => {
	consentContainer.parentNode.removeChild(consentContainer);
});


addEventListener('load', e => {
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
