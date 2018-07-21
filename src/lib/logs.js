/**
 * Library for storing and rotating logs
 */
import fs from 'fs';
import path from 'path';
// import zlib from 'zlib';

const logs = {
	baseDir: path.join(__dirname, '../data/logs'),

	// Append a string to the file. Create the file if it does not exist.
	append: (file, string, callback) => {
		// Open the file for appending
		fs.open(`${logs.baseDir}/${file}.log`, 'a', (err, fileDesctiptor) => {
			if (!err && fileDesctiptor) {
				// Append to file and close it
				fs.appendFile(fileDesctiptor, `${string}\n`, _err => {
					if (!_err) {
						fs.close(fileDesctiptor, __err => {
							if (!__err) {
								callback(false);
							} else {
								callback('Error closing file that was being appended');
							}
						});
					} else {
						callback('Error appending to file');
					}
				});
			} else {
				callback('Could not open file for appending');
			}
		});
	},
	// List all the logs and optionally include the compressed logs
	list: (includeCompressedLogs, callback) => {
		fs.readdir(logs.baseDir, (err, data) => {
			if (!err && data && data.length > 0) {
				const trimmedFileNames = [];
				data.forEach(curFileName => {
					// Add the log files
					if (curFileName.indexOf('.log') > -1) {
						trimmedFileNames.push(curFileName.replace('.log', ''));
					}
					// Add on the gz files
					if (curFileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
						trimmedFileNames.push(curFileName.replace('.gz.b64', ''));
					}
				});
				callback(false, trimmedFileNames);
			} else {
				callback(err, data);
			}
		});
	},
};

export default logs;
