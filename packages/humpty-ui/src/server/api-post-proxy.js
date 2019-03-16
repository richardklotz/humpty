import got from 'got';
import logger from './server-logger';

export const apiPostProxy = ({url, apiKey}) => {
	return (req, res) => {
		logger.debug(`calling ${url}`, req.body);

		got
			.post(`${url.replace('https://', '')}`, {
				body: JSON.stringify(req.body),
				headers: {
					'x-api-key': apiKey,
					Authorization: `Bearer ${req.userContext.tokens.access_token}`,
				},
			})
			.then(data => {
				logger.debug(`${url} result`, data.body);
				res.status(data.statusCode).send(data.body);
			})
			.catch(error => {
				logger.error(`${url} error`, error.body);
				res.status(error.statusCode).send(error.body);
			});
	};
};
