// import fs from 'fs';
import http from 'http';
// import https from 'https';
import url from 'url';
import { StringDecoder } from 'string_decoder';
// import _data from './lib/data';
import handlers from './lib/handlers';
import helpers from './lib/helpers';
import config from './lib/config';

const routers = {
	ping: handlers.ping,
	users: handlers.users,
	tokens: handlers.tokens,
	checks: handlers.checks,
};

// const httpsServerOptions = {
// 	key: fs.readFileSync('./src/ssl/key.pem'),
// 	cert: fs.readFileSync('./src/ssl/cert.pem'),
// };

const unifiedServer = (req, res) => {
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
			typeof routers[reqTrimmedPath] !== 'undefined' ? routers[reqTrimmedPath] : handlers.notFound;

		const data = {
			trimmedPath: reqTrimmedPath,
			queryStringObject: reqQueryStringObject,
			method: reqMethod,
			headers: reqHeaders,
			payload: helpers.parseJsonToObject(reqPayload),
		};

		global.console.log(data);

		chosenHandler(data, (_statusCode, _payload) => {
			const statusCode = typeof _statusCode === 'number' ? _statusCode : 200;
			const payload = typeof _payload === 'object' ? _payload : {};
			const payloadString = JSON.stringify(payload);
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);
			global.console.log('Returning the response: ', statusCode, payloadString);

			/**
			 * @TEST: test function for data.json files.
			 *
			 */

			// _data.create('test', 'newFile', data.headers, err => global.console.log(`This was the error: ${err}`));

			// _data.read('test', 'newFile', (err, __data) =>
			// 	global.console.log(`This was the error: ${err}\n___\nAnd this was the data: ${__data}`)
			// );

			// _data.update('test', 'newFile', data.headers, err => global.console.log(`This was the error: ${err}`));

			// _data.delete('test', 'newFile', err => global.console.log(`This was the error: ${err}`));
		});
	});
};

const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

// const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
// 	unifiedServer(req, res);
// });

httpServer.listen(config.httpPort, () => global.console.log(`Server is listening on port: ${config.httpPort}.`));
// httpsServer.listen(config.httpsPort, () => global.console.log(`Server is listening on port: ${config.httpsPort}.`));
