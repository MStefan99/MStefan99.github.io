'use strict';

import path from 'node:path';
import fs from 'node:fs/promises'
import {fileURLToPath} from 'url';

import sharp from 'sharp';
import * as argumented from './argumented.cjs';


const __dirname = path.dirname(fileURLToPath(import.meta.url));


function isImageFile(filePath) {
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff'];
	return imageExtensions.some(ext => filePath.endsWith(ext));
}

async function removeMetadata(filePath) {
	const sharpImage = sharp(filePath);
	const metadata = await sharpImage.metadata();

	if (metadata.exif || metadata.iptc || metadata.icc || metadata.xmp) {
		console.log('[Metadata remover] Processed', filePath);
		sharpImage
			// This will correctly rotate the image and strip metadata
			.rotate()
			.toBuffer()
			.then(buffer => fs.writeFile(filePath, buffer));
	}
}

async function walk(src) {
	const stat = await fs.stat(src);

	if (stat.isDirectory()) {
		const entries = await fs.readdir(src, {withFileTypes: true});

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name);

			if (entry.isDirectory()) {
				walk(srcPath)
			} else if (isImageFile(srcPath)) {
				removeMetadata(srcPath)
			}
		}
	} else {
		removeMetadata(src);
	}
}

const args = argumented.parse();

console.log('[Metadata remover] Removing metadata')
for (let i = 0; i < args.positional.length; ++i) {
	const src = path.resolve(__dirname, args.positional[i]);

	walk(src);
}
