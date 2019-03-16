import AWS from 'aws-sdk';
import logger from '../utils/logger';

export default async (encryptedProperty, region = 'us-east-1') => {
	const kms = new AWS.KMS({
		region,
	});

	const params = {
		CiphertextBlob: Buffer.from(encryptedProperty.ciphertext, 'base64'),
	};

	const data = await kms
		.decrypt(params)
		.promise()
		.catch(error => {
			logger.error(
				`decrypting ${encryptedProperty.propertyName} failed:`,
				error
			);
			throw error;
		});

	encryptedProperty.decryptedValue = data.Plaintext.toString('ascii');

	return encryptedProperty;
};
