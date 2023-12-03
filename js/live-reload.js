'use strict';


(() => {
	const attrs = ['src', 'href', 'data'];
	const pingInterval = 5 * 1000;
	const pongTimeout = 20 * 1000;
	let lastPongTime = null;

	function replaceQuery(str) {
		const url = new URL(str, window.location.href);
		url.searchParams.set('lr', Math.floor(Math.random() * 0xffffffff).toString(16));

		return url.toString();
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
					window.history.go();
					return;
				}
				recreateElement(message.changed);
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
