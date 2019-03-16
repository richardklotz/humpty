const path = require('path');

module.exports = wallaby => {
	return {
		files: ['src/**/*.js'],
		tests: ['__tests__/**/*test.js', '!__tests__/**/*sanity.test.js'],
		compilers: {
			'**/*.js*': wallaby.compilers.babel({
				babelrc: true,
				babel: require('babel-core'),
			}),
		},
		env: {
			type: 'node',
			runner: 'node',
		},
		debug: true,
		setup() {},
		hints: {
			ignoreCoverage: /ignore coverage/, // or /istanbul ignore next/, or any RegExp
		},
		filesWithNoCoverageCalculated: ['src/**/*.snap', 'src/tests/**'],
		testFramework: 'jest',
	};
};
