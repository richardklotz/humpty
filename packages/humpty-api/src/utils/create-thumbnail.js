import fs from 'fs';
import mktemp from 'mktemp';
import gm1 from 'gm';

export const createThumbnail = ({body, fileType}) => {
	let tempFile;
	let image;

	const gm = gm1.subClass({imageMagick: true});

	return new Promise((resolve, reject) => {
		if (fileType === 'pdf') {
			tempFile = mktemp.createFileSync('/tmp/XXXXXXXXXX.pdf');
			fs.writeFileSync(tempFile, body);
			image = gm(tempFile + '[0]');
		} else if (fileType === 'gif') {
			tempFile = mktemp.createFileSync('/tmp/XXXXXXXXXX.gif');
			fs.writeFileSync(tempFile, body);
			image = gm(tempFile + '[0]');
		} else {
			image = gm(body);
		}

		image.size((err, size) => {
			if (err) {
				reject(err);
			}

			image.resize(size.width, size.height).toBuffer('png', (err, buffer) => {
				if (tempFile) {
					fs.unlinkSync(tempFile);
				}

				if (err) {
					reject(err);
				} else {
					resolve({buffer});
				}
			});
		});
	});
};
