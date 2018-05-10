import crypto from 'crypto';
import config from './config';

const helpers = {
	hash: string => {
		if (typeof string === 'string' && string.length > 0) {
			const hash = crypto
				.createHmac('sha256', config.hashingSecret)
				.update(string)
				.digest('hex');
			return hash;
		}
		return false;
	},
	parseJsonToObject: _string => {
		try {
			const curObject = JSON.parse(_string);
			return curObject;
		} catch (err) {
			return {};
		}
	},
};

export default helpers;
