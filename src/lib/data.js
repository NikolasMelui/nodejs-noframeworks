import fs from 'fs';
import path from 'path';

const lib = {
	create: (dir, file, data, callback) => {
		const baseDir = path.join(__dirname, '../.data');
		fs.open(`${baseDir}/${dir}/${file}.json`, `wx`, (err, fileDescriptor) => {
			if (!err && fileDescriptor) {
				const stringData = JSON.stringify(data);
				fs.writeFile(fileDescriptor, stringData, err => {
					if (!err) {
						fs.close(fileDescriptor, err => {
							if (!err) {
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
	reade: () => {},
};

export default lib;
