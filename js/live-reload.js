'use strict';


(() => {
	const attrs = ['src', 'href', 'data'];
	const pingInterval = 5 * 1000;
	const pongTimeout = 20 * 1000;
	let lastPongTime = null;

	// Fetch updated DOM and patch elements in-place
	function fetchAndUpdate() {
		fetch('')
			.then(response => response.text())
			.then(newContent => {
				const parser = new DOMParser();
				const newDoc = parser.parseFromString(newContent, 'text/html');
				const newBody = newDoc.body;

				diffAndUpdate(document.body, newBody);
			});
	}

	// Recursively check and update elements that differ in the new DOM starting from the children
	function diffAndUpdate(currentElement, newElement) {
		// First, handle the children of the current element
		const currentChildren = Array.from(currentElement.children);
		const newChildren = Array.from(newElement.children);

		currentChildren.forEach((child, index) => {
			if (newChildren.length > index) {
				// Recursively update children first
				diffAndUpdate(child, newChildren[index]);
			} else {
				// If the current element has more children, remove the extra ones
				child.remove();
			}
		});

		// Add any new children that weren't in the current element
		if (newChildren.length > currentChildren.length) {
			newChildren.slice(currentChildren.length).forEach(child => {
				currentElement.appendChild(child.cloneNode(true));
			});
		}

		// Now handle the current element itself
		// Check if the elements are different, ignoring child differences
		if (!currentElement.isEqualNode(newElement)) {
			// Replace only the attributes and content, not the entire element
			replaceAttributesAndContent(currentElement, newElement);
		}
	}

	function replaceAttributesAndContent(currentElement, newElement) {
		// Update attributes
		const currentAttrs = currentElement.attributes;
		const newAttrs = newElement.attributes;

		// Remove any old attributes not present in the new element
		Array.from(currentAttrs).forEach(attr => {
			if (!newElement.hasAttribute(attr.name)) {
				currentElement.removeAttribute(attr.name);
			}
		});

		// Add new attributes or update existing ones
		Array.from(newAttrs).forEach(attr => {
			currentElement.setAttribute(attr.name, attr.value);
		});

		// Replace the inner content if different
		if (currentElement.innerHTML !== newElement.innerHTML) {
			currentElement.innerHTML = newElement.innerHTML;
		}
	}

	// Add a cache-busting query parameter to element URL
	function replaceQuery(str) {
		const url = new URL(str, window.location.href);
		url.searchParams.set('lr', Math.floor(Math.random() * 0xffffffff).toString(16));

		return url.toString();
	}

	// Replace the element with a freshly-created one, used for external resource linkers (img, script, link, etc.)
	function replaceElement(fileName) {
		const oldElements = document.querySelectorAll(
			attrs.map(attr => `[${attr}*="${fileName}"]`).join(', ')
		);
		if (!oldElements.length) {
			return;
		}
		console.log('[Live reload]', fileName, 'has changed, reloading...')

		for (const oldElement of oldElements) {
			const newElement = document.createElement(oldElement.tagName);

			Array.from(oldElement.attributes).forEach(attr =>
				newElement.setAttribute(attr.name, attr.value));

			for (const attr of attrs) {
				if (newElement.hasAttribute(attr)) {
					newElement.setAttribute(attr,
						replaceQuery(newElement.getAttribute(attr)));
				}
			}

			oldElement.parentNode.insertBefore(newElement, oldElement);
			oldElement.remove();
		}
	}

	function poll() {
		if (window.liveReload.ws.readyState === 1) {
			return; // Another WebSocket already open
		} else if (window.liveReload.ws?.readyState <= 1 ?? false) {
			window.liveReload.ws.close(); // Close websocket if it isn't already
		}
		connect(true);

		setTimeout(poll, 1000);
	}

	function ping(ws) {
		if (ws?.readyState !== 1) {
			return; // WebSocket isn't open
		}

		if (lastPongTime !== null && Date.now() - lastPongTime > pongTimeout) {
			console.error('[Live reload] Server offline, polling for restart...');
			window.liveReload.ws.close();
			poll();
			return;
		}

		window.liveReload.ws.send(JSON.stringify({ping: Date.now()}));
		window.liveReload.pingTimeout = setTimeout(() => ping(ws), pingInterval);
	}

	function connect(reloadOnConnect = false) {
		let connected = window.liveReload?.ws?.readyState === 1;
		if (!window.liveReload?.ws || window.liveReload.ws.readyState > 1) { // Open WebSocket if it doesn't exist or was previously closed
			window.liveReload = {ws: new WebSocket(`ws://${location.hostname}:3012`)};
		} else { // Using previously opened connection and updating ping
			clearTimeout(window.liveReload.pingTimeout);
			ping(window.liveReload.ws);
		}

		window.liveReload.ws.onopen = () => {
			console.log('[Live reload] Live reload active');
			// This will reload the page when live reload server goes offline and can be removed if not needed
			reloadOnConnect && window.history.go();

			connected = true;
			ping(window.liveReload.ws);
		}

		window.liveReload.ws.onmessage = ev => {
			const message = JSON.parse(ev.data);
			if (message.changed) {
				if (message.changed.match(new RegExp(
					location.pathname.replace(/^\/$/, '/index') + '\\.html$')
				)) {
					fetchAndUpdate();
					return;
				}
				replaceElement(message.changed);
			} else if (message.pong) {
				lastPongTime = Date.now();
			}
		}

		window.liveReload.ws.onclose = () => {
			if (connected) {
				console.error('[Live reload] Server offline, polling for restart...');
				poll();
			} else {
				console.warn('[Live reload] Server offline');
			}
		}
	}

	if (location.hostname.match(/(?:\d+\.){3}\d+|localhost/)) {
		connect();
	}
})();
