import fs from 'fs';
import path from 'path';
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
		const curStringLength =
			typeof argStringLength === 'number' && argStringLength > 0
				? argStringLength
				: false;
		if (curStringLength) {
			const allChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
			let randomString = '';
			for (let i = 0; i < curStringLength; i += 1) {
				const randomChar = allChars.charAt(
					Math.floor(Math.random() * allChars.length)
				);
				randomString += randomChar;
			}
			return randomString;
		}
		return false;
	},

	// Send an SMS message via Twilio
	sendTwilioSms: (phone, message, callback) => {
		// Validate parametres
		const curPhone =
			typeof phone === 'string' && phone.trim().length === 10
				? phone.trim()
				: false;
		const curMessage =
			typeof message === 'string' &&
			message.trim().length > 0 &&
			message.trim().length <= 1600
				? message.trim()
				: false;
		if (curPhone && curMessage) {
			// Configure the request payload
			const payload = {
				From: config.twilio.fromPhone,
				To: `+7${curPhone}`,
				Body: curMessage,
			};

			// Stringify the payload
			const stringPayload = querystring.stringify(payload);

			// Configure the request details
			const requestDetails = {
				protocol: 'https:',
				hostname: 'api.twilio.com',
				method: 'POST',
				path: `https://api.twilio.com/2010-04-01/Accounts/${
					config.twilio.accountSid
				}/Messages.json`,
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

			// Bing to the error event so it doesn't get thrown
			curRequest.on('error', error => callback(error));

			// Add the payload
			curRequest.write(stringPayload);

			// End the request
			curRequest.end();
		} else {
			callback('Given parameters were missing or invalid');
		}
	},

	// Get the string content of a template
	getTemplate: (_templateName, callback) => {
		const templateName =
			typeof _templateName === 'string' && _templateName.length > 0
				? _templateName
				: false;
		if (templateName) {
			const templatesDir = path.join(__dirname, '../templates/');
		} else {
			callback('A valid template name was not specified');
		}
	},
};

export default helpers;
