'use strict';

const consentContainer = document.querySelector('#cookie-consent');
const consentCloseButton = document.querySelector('#consent-close');

const navigationList = document.querySelector('#nav-list');
const headers = document.querySelectorAll('article h2,' +
		'article h3,' +
		'article h4');


function closeConsent() {
	consentContainer.parentNode.removeChild(consentContainer);
}


consentCloseButton.addEventListener('click', e => {
	localStorage.setItem('consent-closed', 'true');
	closeConsent();
});


addEventListener('load', e => {
	if (localStorage.getItem('consent-closed')) {
		closeConsent();
	}

	headers.forEach((header) => {
		const headerLink = document.createElement('a');
		headerLink.href = '#' + header.id;
		const headerElement = document.createElement(header.tagName);
		headerElement.innerHTML = header.innerHTML;
		navigationList.appendChild(headerLink);
		headerLink.appendChild(headerElement);
	});
});
