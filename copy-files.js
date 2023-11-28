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

async function removeMetadata(filePath) {
	await sharp(filePath)
		// This will correctly rotate the image and strip metadata
		.rotate()
		.toBuffer()
		/* Rewriting the image in place to strip metadata will cause nodemon to restart the process
		 * when an image is initially copied into the project, but I don't have a better solution yet
		 */
		.then(buffer => fs.writeFile(filePath, buffer));
}

async function compressAndCopyImage(srcPath, destPath) {
	await sharp(srcPath)
		.resize({width: 1920, withoutEnlargement: true})
		.jpeg({quality: 70})
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
			// TODO: fix script restarting itself
			// await removeMetadata(src);
			if (srcStat.size > SIZE_THRESHOLD) {
				await compressAndCopyImage(src, dest);
			} else {
				await fs.cp(src, dest);
			}
		} else {
			await fs.cp(src, dest);
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
