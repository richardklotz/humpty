import AWS from 'aws-sdk';

export const s3Client = () => {
	let s3 = new AWS.S3();

	if (process.env.IS_LOCAL === 'true') {
		console.log('using local s3');
		s3 = new AWS.S3({
			s3ForcePathStyle: true,
			endpoint: new AWS.Endpoint('http://localhost:8001'),
		});
	}

	return s3;
};
