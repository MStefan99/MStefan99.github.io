'use strict';


(() => {
	const attrs = ['src', 'href', 'data'];
	let retryInterval = null;

	function addParameter(str) {
		return str.replace(/\?\w+/, '') + '?' + Math.floor(Math.random() * 0xffffffff).toString(16);
	}

	function recreateElement(fileName) {
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
						addParameter(newElement.getAttribute(attr)));
				}
			}

			oldElement.parentNode.insertBefore(newElement, oldElement);
			oldElement.remove();
		}
	}

	function sendPing() {
		if (window.liveWS) {
			window.liveWS.send(JSON.stringify({ping: Date.now()}));
			setTimeout(sendPing, 5000);
		}
	}

	function openWS() {
		if (!window.liveWS) {
			if (retryInterval) {
				// This will reload the page when live reload server goes offline and can be removed if not needed
				window.history.go();
			}
			window.liveWS = new WebSocket(`ws://${location.hostname}:3012`);
			clearInterval(retryInterval);
		}

		window.liveWS.onopen = () => {
			console.log('[Live reload] Live reload active');
			sendPing();
		}

		window.liveWS.onmessage = ev => {
			const message = JSON.parse(ev.data);
			if (message.changed) {
				if (message.changed.match(new RegExp(
					location.pathname.replace(/^\/$/, '/index') + '\\.html$')
				)) {
					window.history.go();
					return;
				}
				recreateElement(message.changed);
			}
		}

		window.liveWS.onclose = () => {
			console.error('[Live reload] Server offline, polling for restart...');
			delete (window.liveWS);
			retryInterval = setInterval(openWS, 1000);
		}
	}

	if (location.hostname.match(/(?:\d+\.){3}\d+|localhost/)) {
		openWS();
	}
})();
