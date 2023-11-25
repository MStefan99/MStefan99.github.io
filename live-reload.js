'use strict';

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'url';
import {WebSocketServer} from 'ws';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const changed = new Set();

function start() {
	console.log('[Live reload server] Server starting');

	try {
		fs.watch(path.resolve(__dirname, 'dist'), {recursive: true},
			(event, filename) => {
				if (!changed.has(filename)) {
					changed.add(filename);
					setTimeout(() => {
						for (const client of wss.clients) {
							client.send(JSON.stringify({changed: '/' + filename.replace('\\', '/')}));
						}
						changed.delete(filename);
						console.log('[Live reload server] Changed', filename)
					}, 50);
				}
			}
		);
	} catch (e) {
		if (e.code === 'ENOENT') {
			console.error('[Live reload server] directory "dist" does not exist, retrying...')
		}
		setTimeout(start, 500);
		return;
	}

	const wss = new WebSocketServer({port: 3012, clientTracking: true});

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
}

start();
