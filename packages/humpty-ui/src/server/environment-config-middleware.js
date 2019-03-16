const environmentConfigMiddleware = envVars => {
	return (req, res, next) => {
		if (!req.userContext) {
			return next();
		}

		const configCopy = Object.assign({}, envVars);

		const serverRuntimeConfigKeys = Object.keys(configCopy);
		for (const key of serverRuntimeConfigKeys) {
			if (
				typeof configCopy[key] === 'string' &&
				configCopy[key].includes('humpty-ui-access-token')
			) {
				configCopy[key] = configCopy[key].replace(
					'humpty-ui-access-token',
					req.userContext.tokens.access_token
				);
			}
		}

		req.envVars = configCopy;

		return next();
	};
};

export default environmentConfigMiddleware;
