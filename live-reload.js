import process from 'node:process';
import {WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 3012});
let stopping = false;

console.log('[Live reload server] Server starting');

wss.on('listening', () => {
	console.log('[Live reload server] Server started');
});

wss.on('connection', ws => {
	ws.on('error', console.error);

	ws.on('message', str => {
		const message = JSON.parse(str);
		if (message.ping) {
			ws.send(JSON.stringify({pong: Date.now()}));
		}
	})
});

process.on('SIGTERM', () => {
	!stopping && console.log('[Live reload server] Server stopped')
	stopping = true;
	process.exit();
});
