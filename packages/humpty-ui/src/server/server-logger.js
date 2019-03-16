import pointer from 'json-pointer';
import env from '../utils/env';
import clientLogger from '../utils/logger';

let _req;
let logger = clientLogger;
const filter = '';

let serializeError = null;

const removeSensitiveData = data => {
	if (!filter) {
		return data;
	}

	try {
		const cleanData = JSON.parse(JSON.stringify(data));
		const itemsToHide = filter.split('|');
		const dictionary = pointer.dict(cleanData);

		for (const key in dictionary) {
			if ({}.hasOwnProperty.call(dictionary, key)) {
				for (let i = 0, len = itemsToHide.length; i < len; i++) {
					if (key.includes(itemsToHide[i])) {
						pointer.set(cleanData, key, '*****');
					}
				}
			}
		}

		return cleanData;
	} catch {
		return data;
	}
};

if (process.browser) {
	logger = clientLogger;
} else {
	const winston = require('winston');
	serializeError = require('serialize-error');

	const {combine, label, json, timestamp, prettyPrint} = winston.format;

	const serverTransports = [new winston.transports.Console()];

	winston.loggers.add('server', {
		level: env.LOG_LEVEL,
		format: combine(
			label({label: 'server'}),
			timestamp(),
			prettyPrint(),
			json()
		),
		transports: serverTransports,
	});

	const serverLogger = winston.loggers.get('server');

	logger = serverLogger;
}

const localSeparator =
	'===========================================================================================================';

const createLog = request => {
	if (_req && _req.cookies) {
		request.sessionId = _req.cookies['credit.check.connect.sid'];
		request.cookieParams = _req.cookies['credit-check-ui-params'];
	}

	if (_req && _req.headers) {
		request.requestId = _req.headers.requestId;
	}

	request.data = removeSensitiveData(request.data);
	request.data = JSON.stringify(request.data);
	if (_req && _req.userContext) {
		request.userinfo = _req.userContext.userinfo;
	}

	return request;
};

const log = (level, message, data) => {
	const logObject = createLog({
		message,
		data,
	});

	if (env.WOW_ENV === 'local') {
		console.log(localSeparator);
		console.log(message);
		console.log(localSeparator);
		console.log(logObject);
	} else {
		logger[level](logObject);
	}
};

export default {
	info: (message, data) => {
		log('info', message, data);
	},
	debug: (message, data) => {
		log('debug', message, data);
	},
	error: (message, data) => {
		let error = data;

		if (serializeError) {
			try {
				error = serializeError(data);
			} catch {}
		}

		log('error', message, error);
	},
	warn: (message, data) => {
		log('warn', message, data);
	},
	startProfiler: () => {
		return logger.startTimer();
	},
	setRequest: req => {
		_req = req;
	},
};
