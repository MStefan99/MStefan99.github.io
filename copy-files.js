'use strict';

import path from 'node:path';
import fs from 'node:fs/promises'
import {fileURLToPath} from 'url';

import sharp from 'sharp';
import argumented from '@mstefan99/argumented';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE_THRESHOLD = 512 * 1024; // 0.5MB image size threshold


function isImageFile(filePath) {
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff'];
	return imageExtensions.some(ext => filePath.endsWith(ext));
}

async function compressAndCopyImage(srcPath, destPath) {
	await sharp(srcPath)
		.resize({width: 1280, withoutEnlargement: true})
		.jpeg({quality: 60})
		.toFile(destPath);
}

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
		if (isImageFile(src)) {
			if (srcStat.size > SIZE_THRESHOLD) {
				compressAndCopyImage(src, dest);
			} else {
				fs.cp(src, dest);
			}
		} else {
			fs.cp(src, dest);
		}
		console.log('[File copy]', src, '->', dest);
	}
}

async function copyFiles(src, dest) {
	const stat = await fs.stat(src);

	if (stat.isDirectory()) {
		const entries = await fs.readdir(src, {withFileTypes: true});

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name);
			const destPath = path.join(dest, entry.name);

			if (entry.isDirectory()) {
				await fs.mkdir(destPath, {recursive: true});
				await copyFiles(srcPath, destPath)
			} else {
				await copyFileIfNewer(srcPath, destPath)
			}
		}
	} else {
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
