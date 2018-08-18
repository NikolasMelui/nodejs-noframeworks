// import fs from 'fs';
// import path from 'path';
import http from 'http';
// import https from 'https';
import url from 'url';
import { StringDecoder } from 'string_decoder';
import util from 'util';
// import _data from './data';
import handlers from './handlers';
import helpers from './helpers';
import config from './config';

const debug = util.debuglog('server');

/**
 * @TEST: test call of the sendTwilioSms function
 *
 */
// helpers.sendTwilioSms('9093442211', 'Hello, Nick!', error => debug(`This was the error: ${error}`));

const server = {
	// Define the request routers
	routers: {
		'': handlers.index,
		'account/create': handlers.accountCreate,
		'account/edit': handlers.accountEdit,
		'account/deleted': handlers.accountDeleted,
		'session/create': handlers.sessionCreate,
		'session/deleted': handlers.sessionDeleted,
		'checks/all': handlers.checkList,
		'checks/create': handlers.checkCreate,
		'checks/edit': handlers.checkEdit,
		'api/users': handlers.users,
		'api/tokens': handlers.tokens,
		'api/checks': handlers.checks,
		ping: handlers.ping,
	},

	unifiedServer: (req, res) => {
		const reqParsedUrl = url.parse(req.url, true);
		const reqPath = reqParsedUrl.pathname;
		const reqQueryStringObject = reqParsedUrl.query;
		const reqTrimmedPath = reqPath.replace(/^\/+|\/+$/g, '');
		const reqMethod = req.method.toLowerCase();
		const reqHeaders = req.headers;

		const decoder = new StringDecoder('utf-8');
		let reqPayload = '';

		// @TODO: get new functional code for this chunk of stringDecoder code.
		req.on('data', data => {
			reqPayload += decoder.write(data);
		});
		req.on('end', () => {
			reqPayload += decoder.end();

			const chosenHandler =
				typeof server.routers[reqTrimmedPath] !== 'undefined'
					? server.routers[reqTrimmedPath]
					: handlers.notFound;

			const data = {
				trimmedPath: reqTrimmedPath,
				queryStringObject: reqQueryStringObject,
				method: reqMethod,
				headers: reqHeaders,
				payload: helpers.parseJsonToObject(reqPayload),
			};

			debug(data);

			// Route the request to the handles specified in the router
			chosenHandler(data, (_statusCode, _payload, _contentType) => {
				// Determine the type of the response (fallback to JSON)
				const contentType =
					typeof _contentType === 'string' ? _contentType : 'json';
				// Use the status code called back by the handler, or default to 200
				const statusCode = typeof _statusCode === 'number' ? _statusCode : 200;
				// Use the payload called back by the handler, or default to an empty object
				const payload = typeof _payload === 'object' ? _payload : {};
				// Convert the payload to a string
				const payloadString = JSON.stringify(payload);
				res.setHeader('Content-Type', 'application/json');
				res.writeHead(statusCode);
				res.end(payloadString);

				// If the response is 200 - print green, otherwise - print red
				if (statusCode === 200) {
					debug(
						'\x1b[32m%s\x1b[0m',
						`${reqMethod.toUpperCase()} /${reqTrimmedPath} /${statusCode}`
					);
				} else {
					debug(
						'\x1b[31m%s\x1b[0m',
						`${reqMethod.toUpperCase()} /${reqTrimmedPath} /${statusCode}`
					);
				}

				/**
				 * @TEST: test function for data.json files.
				 *
				 */

				// _data.create('test', 'newFile', data.headers, err => debug(`This was the error: ${err}`));

				// _data.read('test', 'newFile', (err, __data) =>
				// 	debug(`This was the error: ${err}\n___\nAnd this was the data: ${__data}`)
				// );

				// _data.update('test', 'newFile', data.headers, err => debug(`This was the error: ${err}`));

				// _data.delete('test', 'newFile', err => debug(`This was the error: ${err}`));
			});
		});
	},

	// httpsServerOptions: {
	// 	key: () => {
	// 		fs.readFileSync(path.join(__dirname, '/../ssl/key.pem'));
	// 	},
	// 	cert: () => {
	// 		fs.readFileSync(path.join(__dirname, '/../ssl/cert.pem'));
	// 	},
	// },

	// Initial servers script
	initServer: () => {
		http
			.createServer((req, res) => {
				server.unifiedServer(req, res);
			})
			.listen(config.httpPort, () =>
				global.console.log(
					'\x1b[35m%s\x1b[0m',
					`Server is listening on port: ${config.httpPort}.`
				)
			);
		// https
		// 	.createServer((req, res) => {
		// 		server.unifiedServer(req, res);
		// 	})
		// 	.listen(config.httpsPort, () => debug(`Server is listening on port: ${config.httpsPort}.`));
	},
};

export default server;
