const currentYear = document.querySelector("#current-year");
const navigationList = document.querySelector('#navigation-list');
const headers = document.querySelectorAll('#content-container h2,' +
	'#content-container h3,' +
	'#content-container h4');


currentYear.innerHTML = new Date().getFullYear().toString();


addEventListener('load', () => {
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
