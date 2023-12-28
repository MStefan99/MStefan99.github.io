'use strict';

(() => {
	document.querySelector('.gallery-layout')?.remove();

	document.body.insertAdjacentHTML('beforeend', `
		<div class="hidden gallery-layout">
			<div class="gallery-container"></div>
			<img class="close" src="/img/icons/cross.svg" alt="Close icon">
		</div>
	`);

	const galleryLayout = document.querySelector('.gallery-layout');
	const galleryContainer = document.querySelector('.gallery-container');

	const closeListener = e => {
		if (e.target !== e.currentTarget) {
			console.log(e.target, e.currentTarget);
			return; // Child is a target
		}

		document.querySelectorAll('.gallery-container img')
			.forEach(e => e.remove());
		galleryLayout.classList.add('hidden');
	};

	document.querySelector('.gallery-layout .close').addEventListener('click', closeListener);

	document.body.addEventListener('click', e => {
		const imgElement = e.target.closest('img.gallery');

		if (e.target.closest('#gallery')) {
			return;
		}

		if (imgElement) {
			galleryLayout.classList.remove('hidden');
			const imageElements = Array.from(document.querySelectorAll('img.gallery'))
				.reverse()
				.filter((e, i, a) => a.findIndex(l => l.src === e.src) === i)
				.reverse()

			galleryContainer.append(...imageElements
				.map((e, i) => {
					const c = e.cloneNode();
					c.src = c.src.replace(/-\d+/, '')
					c.classList.remove("gallery");
					return c;
				})
			);

			galleryContainer.scrollTo(galleryContainer.offsetWidth * Array.from(imageElements)
				.findIndex(e => e.src === imgElement.src),
				0);
		}
	});
})();
