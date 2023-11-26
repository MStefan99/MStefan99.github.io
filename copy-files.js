'use strict';

import path from 'node:path';
import fs from 'node:fs/promises'
import {fileURLToPath} from 'url';

import argumented from '@mstefan99/argumented';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function copyFileIfNewer(src, dest) {
	const srcStat = await fs.stat(src);
	let newer = false;

	try {
		const destStat = await fs.stat(dest);
		if (srcStat.mtime > destStat.mtime) {
			newer = true;
		}
	} catch {
		newer = true;
	}

	if (newer) {
		console.log('[File copy]', src, '->', dest);
		await fs.cp(src, dest);
	}
}

async function copyFiles(src, dest) {
	try {
		const entries = await fs.readdir(src, {withFileTypes: true});

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name);
			const destPath = path.join(dest, entry.name);

			if (entry.isDirectory()) {
				await copyFiles(srcPath, destPath)
			} else {
				await copyFileIfNewer(srcPath, destPath)
			}
		}
	} catch {
		await copyFileIfNewer(src, dest);
	}
}

const args = argumented.parse();

console.log('[File copy] Copying files')
for (let i = 0; i < args.positional.length - 1; ++i) {
	const src = path.resolve(__dirname, args.positional[i]);
	const dest = path.resolve(__dirname, args.positional[args.positional.length - 1], args.positional[i]);

	copyFiles(src, dest);
}
