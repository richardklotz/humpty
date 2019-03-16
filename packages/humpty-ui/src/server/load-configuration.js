import decrypt from 'server/decrypt';
import logger from 'utils/logger';

const KMS_DECRYPT_MARKER = '#KMS-DEC#';

const loadConfiguration = async environmentVars => {
	const configurationCache = {};
	const encryptedKmsPropertyPromises = [];

	for (const propertyName in environmentVars) {
		if (!{}.hasOwnProperty.call(environmentVars, propertyName)) {
			continue;
		}

		let propertyValue = environmentVars[propertyName] || '';

		if (environmentVars[propertyName]) {
			propertyValue = String(environmentVars[propertyName]).replace(
				/^"(.+(?="$))"$/,
				'$1'
			);
		}

		configurationCache[propertyName] = propertyValue;

		if (propertyValue.startsWith(KMS_DECRYPT_MARKER)) {
			encryptedKmsPropertyPromises.push(
				decrypt({
					propertyName,
					ciphertext: propertyValue.substring(KMS_DECRYPT_MARKER.length),
				})
			);
		}
	}

	try {
		const decryptionResult = await Promise.all(encryptedKmsPropertyPromises);
		decryptionResult.forEach(result => {
			configurationCache[result.propertyName] = result.decryptedValue;
		});
	} catch (error) {
		logger.error('error getting config', error);
		throw error;
	}

	return configurationCache;
};

export default loadConfiguration;
