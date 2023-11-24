'use strict';


let connectionLost = false;

function openWS() {
	const ws = new WebSocket('ws://localhost:3012');
	let pingInterval = null;

	ws.onopen = () => {
		if (connectionLost) {
			window.history.go();
		} else {
			console.log('Live reload active');
			pingInterval = setInterval(() => ws.send(JSON.stringify({ping: Date.now()})), 5000);
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
