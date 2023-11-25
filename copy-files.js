'use strict';

import path from 'node:path';
import fs from 'node:fs/promises'
import {fileURLToPath} from 'url';

import argumented from '@mstefan99/argumented';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function copyNewer(src, dest) {
	try {
		const entries = await fs.readdir(src, {withFileTypes: true});

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name);
			const destPath = path.join(dest, entry.name);

			if (entry.isDirectory()) {
				await copyNewer(srcPath, destPath)
			} else {
				const srcStat = await fs.stat(srcPath);
				let newer = false;

				try {
					const destStat = await fs.stat(destPath);
					if (srcStat.mtime > destStat.mtime) {
						newer = true;
					}
				} catch {
					newer = true;
				}

				if (newer) {
					console.log('[File copy]', srcPath, '->', destPath);
					await fs.cp(srcPath, destPath);
				}
			}
		}
	} catch {
		await fs.cp(src, dest);
	}
}

const args = argumented.parse();

console.log('[File copy] Copying files')
for (let i = 0; i < args.positional.length - 1; ++i) {
	const src = path.resolve(__dirname, args.positional[i]);
	const dest = path.resolve(__dirname, args.positional[args.positional.length - 1], args.positional[i]);

	copyNewer(src, dest);
}
