'use strict';

import path from 'node:path';
import fs from 'node:fs/promises'
import {fileURLToPath} from 'url';

import sharp from 'sharp';
import * as argumented from './argumented.cjs';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE_THRESHOLD = 512 * 1024; // 0.5MB image size threshold
const IMAGE_SIZES = [320, 1280];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.avif'];


async function compressAndCopyImage(src, dest) {
	const ext = path.extname(dest);
	if (src.includes('ik_angles')) {
		console.log('haha', ext, src, dest);
	}

	return await Promise.all(IMAGE_SIZES.map(height =>
			sharp(src)
				.resize({height, withoutEnlargement: true})
				.jpeg({quality: 80})
				.toFile(dest.replace(ext, (IMAGE_SIZES.some(w => w > height) ? '-' + height : '') + ext))
		)
	);
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
		if (IMAGE_EXTENSIONS.some(ext => src.endsWith(ext))) {
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
