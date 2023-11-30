'use strict';

/** @type {import('tailwindcss').Config} */

module.exports = {
	content: [
		"./pages/**/*.pug",
		"./templates/*.pug",
		"./js/**/*.js"
	],
	darkMode: 'media',
	theme: {
		// Override the theme here
		extend: {
			// Extend the theme here
			colors: {
				'accent': 'var(--color-accent)'
			},
			screens: {
				'xs': '425px'
			}
		},
		plugins: [],
	}
};
