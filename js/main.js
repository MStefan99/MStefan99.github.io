'use strict';


(() => {
	const navigationList = document.querySelector('#nav-list');
	const headers = document.querySelectorAll('article h2,' +
		'article h3,' +
		'article h4');

	headers.forEach((header) => {
		const headerLink = document.createElement('a');
		headerLink.href = '#' + header.id;
		const headerElement = document.createElement(header.tagName);
		headerElement.innerHTML = header.innerHTML;
		navigationList.appendChild(headerLink);
		headerLink.appendChild(headerElement);
	});
})();
