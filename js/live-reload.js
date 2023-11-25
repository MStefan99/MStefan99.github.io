'use strict';


(() => {
	let connectionLost = false;

	function recreateElement(fileName) {
		const oldElement = document.querySelector(`[src*="${fileName}"], [href*="${fileName}"]`);
		if (!oldElement) {
			return;
		}

		const newElement = document.createElement(oldElement.tagName);

		Array.from(oldElement.attributes).forEach(attr =>
			newElement.setAttribute(attr.name, attr.value));

		oldElement.parentNode.insertBefore(newElement, oldElement);
		oldElement.remove();
	}

	function openWS() {
		if (!connectionLost && window.liveWS) {
			return;
		}
		const ws = new WebSocket('ws://localhost:3012');
		let pingInterval = null;
		window.liveWS = ws;

		ws.onopen = () => {
			if (connectionLost) {
				window.history.go();
			} else {
				console.log('Live reload active');
				pingInterval = setInterval(() => ws.send(JSON.stringify({ping: Date.now()})), 5000);
			}

			ws.onmessage = ev => {
				const message = JSON.parse(ev.data);
				if (message.changed) {
					if (message.changed.match(new RegExp(
						location.pathname.replace(/^\/$/, '/index') + '\\.html$')
					)) {
						window.history.go();
						return;
					}
					console.log(message.changed, 'changed, reloading...')
					recreateElement(message.changed);
				}
			}
		}

		ws.onclose = () => {
			console.error('Server offline, polling for restart...');
			clearInterval(pingInterval);
			!connectionLost && setInterval(openWS, 1000);
			connectionLost = true;
		}
	}

	if (location.host.match(/localhost/)) {
		openWS();
	}
})();