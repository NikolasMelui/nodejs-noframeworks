import https from 'https';
import querystring from 'querystring';
import crypto from 'crypto';
import config from './config';

const helpers = {
	hash: argString => {
		if (typeof argString === 'string' && argString.length > 0) {
			const curHash = crypto
				.createHmac('sha256', config.hashingSecret)
				.update(argString)
				.digest('hex');
			return curHash;
		}
		return false;
	},
	parseJsonToObject: argString => {
		try {
			const curObject = JSON.parse(argString);
			return curObject;
		} catch (err) {
			return {};
		}
	},
	createRandomString: argStringLength => {
		const curStringLength = typeof argStringLength === 'number' && argStringLength > 0 ? argStringLength : false;
		if (curStringLength) {
			const allChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
			let randomString = '';
			for (let i = 0; i < curStringLength; i += 1) {
				const randomChar = allChars.charAt(Math.floor(Math.random() * allChars.length));
				randomString += randomChar;
			}
			return randomString;
		}
		return false;
	},
	// Send an SMS message via Twilio
	sendTwilioSms: (phone, message, callback) => {
		// Validate parametres
		phone = typeof phone === 'string' && phone.trim().length === 10 ? phone.trim() : false;
		message =
			typeof msg === 'string' && phone.trim().length > 0 && phone.trim().length <= 1600 ? phone.trim() : false;
		if (phone && message) {
			// Configure the request payload
			const payload = {
				From: config.twilio.fromPhone,
				To: `+1 ${config.twilio.toPhone}`,
				Body: message,
			};
			// Stringify the payload
			const stringPayload = querystring.stringify(payload);
			// Configure the request details
			const requestDetails = {
				protocol: 'https',
				hostname: 'api.twilio.com',
				method: 'POST',
				path: 'idontknowit',
				auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(stringPayload),
				},
			};
			// Instantiate the request object
			const curRequest = https.request(requestDetails, res => {
				// Grab the status of the sent request
				const curStatusCode = res.statusCode;
				// Callback successfully if the request went through
				if (curStatusCode === 200 || curStatusCode === 201) {
					callback(false);
				} else {
					callback(`Status code returned was ${curStatusCode}`);
				}
			});
		} else {
			callback('Given parameters were missing or invalid');
		}
	},
};

export default helpers;
