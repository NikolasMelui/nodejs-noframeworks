import fs from 'fs';
import path from 'path';
import helpers from './helpers';

const lib = {
	baseDir: path.join(__dirname, '../data'),
	create: (dir, file, data, callback) => {
		fs.open(`${lib.baseDir}/${dir}/${file}.json`, `wx`, (err, fileDescriptor) => {
			if (!err && fileDescriptor) {
				const stringData = JSON.stringify(data);
				fs.writeFile(fileDescriptor, stringData, _err => {
					if (!_err) {
						fs.close(fileDescriptor, __err => {
							if (!__err) {
								callback(false);
							} else {
								callback('Error closing new file');
							}
						});
					} else {
						callback('Error writing to new file.');
					}
				});
			} else {
				callback('Could not create new file, it may already exist.');
			}
		});
	},
	read: (dir, file, callback) => {
		fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf8', (err, data) => {
			if (!err && data) {
				const parsedData = helpers.parseJsonToObject(data);
				callback(false, parsedData);
			} else {
				callback(err, data);
			}
		});
	},

	/**
	 * @TODO: Update file.
	 */
	update: (dir, file, data, callback) => {
		fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
			if (!err && fileDescriptor) {
				const stringData = JSON.stringify(data);
				fs.ftruncate(fileDescriptor, _err => {
					if (!_err) {
						fs.writeFile(fileDescriptor, stringData, __err => {
							if (!__err) {
								fs.close(fileDescriptor, ___err => {
									if (!___err) {
										callback(false);
									} else {
										callback(`Error closing existing file. Error:\n${___err}`);
									}
								});
							} else {
								callback(`Error writing to existing file. Error:\n${__err}`);
							}
						});
					} else {
						callback(`Error truncating the file. Error:\n${_err}`);
					}
				});
			} else {
				callback(`Could not open file for updating. Error:\n${err}`);
			}
		});
	},
	delete: (dir, file, callback) => {
		fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, err => {
			if (!err) {
				callback(false);
			} else {
				callback(`Could not delete file. Error:\n${err}`);
			}
		});
	},
};

export default lib;
