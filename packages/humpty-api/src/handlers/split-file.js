import streams from 'memory-streams';
import hummus from 'hummus';
import {s3Client} from '../utils/s3-client';
import {createThumbnail} from '../utils/create-thumbnail';

export const handler = async (event, context) => {
	const record = event.Records[0];
	const userBucket = 'lodo-humpty-api-user-files';

	console.log('EVENT:', JSON.stringify(event, null, '\t'));

	if (!record.s3.object.key.includes('incoming')) {
		console.log('not an incoming file');
		return 'not an incoming file';
	}

	const fileNameKey = record.s3.object.key.split('/').pop();

	const s3 = s3Client();

	const params = {
		Bucket: decodeURIComponent(record.s3.bucket.name),
		Key: decodeURIComponent(record.s3.object.key),
	};

	console.log('s3 get params:', params);

	let uploadedObject;

	try {
		uploadedObject = await s3.getObject(params).promise();
	} catch (error) {
		console.log('ERROR getting s3 object:', error);
		throw error;
	}

	const pdfReader = hummus.createReader(
		new hummus.PDFRStreamForBuffer(uploadedObject.Body)
	);
	const pageCount = pdfReader.getPagesCount();

	const pages = [];

	for (let i = 0; i < pageCount; i++) {
		pages.push({
			pageNumber: i,
		});
	}

	for await (const page of pages) {
		const outStream = new streams.WritableStream();

		const pdfWriter = hummus.createWriter(
			new hummus.PDFStreamForResponse(outStream)
		);

		pdfWriter
			.createPDFCopyingContext(pdfReader)
			.appendPDFPageFromPDF(page.pageNumber);

		pdfWriter.end();
		outStream.end();

		const body = outStream.toBuffer();

		await s3
			.upload({
				Bucket: userBucket,
				Key: `${
					record.userIdentity.principalId
				}/${fileNameKey}/pages/${fileNameKey}_page_${page.pageNumber + 1}.pdf`,
				Body: body,
				Metadata: {
					originalPage: String(page.pageNumber),
					currentPage: String(page.pageNumber),
				},
			})
			.promise();

		const {buffer} = await createThumbnail({body, fileType: 'pdf'});

		await s3
			.upload({
				Bucket: userBucket,
				Key: `${
					record.userIdentity.principalId
				}/${fileNameKey}/images/${fileNameKey}_page_${page.pageNumber + 1}.png`,
				Body: buffer,
				ContentType: 'image/png',
				Metadata: {
					originalPage: String(page.pageNumber),
					currentPage: String(page.pageNumber),
				},
			})
			.promise();
	}

	return 'done';
};
