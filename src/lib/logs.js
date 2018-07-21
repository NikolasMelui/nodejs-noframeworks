/**
 * Library for storing and rotating logs
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

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

	// Compress the contents of the .log file into the .gz.b64 file within the same directory
	compress: (logId, newFileId, callback) => {
		const sourceFile = `${logId}.log`;
		const destFile = `${newFileId}.gz.b64`;

		// Read the source file
		fs.readFile(`${logs.baseDir}${sourceFile}`, 'utf8', (err, inputString) => {
			if (!err && inputString) {
				// Compress the data using gzip
				zlib.gzip(inputString, (_err, buffer) => {
					if (!_err && buffer) {
						// Send the data to the destination file
						fs.open(`${logs.baseDir}${destFile}wx`, (__err, fileDesctiptor) => {
							if (!__err && fileDesctiptor) {
								// Write to the destination file
								fs.writeFile(fileDesctiptor, buffer.toString('base64'), ___err => {
									if (!___err) {
										// Close the destination file
										fs.close(fileDesctiptor, ____err => {
											if (!____err) {
												callback(false);
											} else {
												callback(____err);
											}
										});
									} else {
										callback(___err);
									}
								});
							} else {
								callback(__err);
							}
						});
					} else {
						callback(_err);
					}
				});
			} else {
				callback(err);
			}
		});
	},

	// Decompress the contents of the a .gz.b64 file into a string variable
	decompress: (fileId, callback) => {
		const fileName = `${fileId}.gz.b64`;
		fs.readFile(`${logs.baseDir}${fileName}`, 'utf8', (err, string) => {
			if (!err && string) {
				// Decompress the data
				const inputBuffer = Buffer.from(string, 'base64');
				zlib.unzip(inputBuffer, (_err, outputBuffer) => {
					if (!_err && outputBuffer) {
						// Callback
						const callbackString = outputBuffer.toString();
						callback(false, callbackString);
					} else {
						callback(_err);
					}
				});
			} else {
				callback(err);
			}
		});
	},

	// Trancate a log file
	truncate: (logId, callback) => {
		fs.truncate(`${logs.baseDir}${logId}.log`, 0, err => {
			if (!err) {
				callback(false);
			} else {
				callback(err);
			}
		});
	},
};

export default logs;
