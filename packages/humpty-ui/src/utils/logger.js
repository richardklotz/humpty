import * as beaver from 'beaver-logger';

const logger = beaver.Logger({
	// Url to send logs to
	url: '/logging',

	// Prefix to prepend to all events
	prefix: 'credit-check-ui',

	// Log level to display in the browser console
	logLevel: beaver.LOG_LEVEL.WARN,

	// Interval to flush logs to server
	flushInterval: 60 * 1000,
});

export default {
	info: (message, data) => {
		logger.info(message, {
			data,
		});
	},
	debug: (message, data) => {
		logger.debug(message, {
			data,
		});
	},
	error: (message, data) => {
		logger.error(message, {
			data,
		});
	},
	warn: (message, data) => {
		logger.warn(message, {
			data,
		});
	},
	startProfiler: () => {},
	setUserInfo: userinfo => {},
};
