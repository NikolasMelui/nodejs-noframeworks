import http from 'http';
import url from 'url';
import { StringDecoder } from 'string_decoder';
import config from './config';

const handlers = {
	sample: (data, callback) => callback(200, { name: 'sample handler' }),
	notFound: (data, callback) => callback(404),
};

const routers = {
	sample: handlers.sample,
};

const server = http.createServer((req, res) => {
	const reqParsedUrl = url.parse(req.url, true);
	const reqPath = reqParsedUrl.pathname;
	const reqQueryStringObject = reqParsedUrl.query;
	const reqTrimmedPath = reqPath.replace(/^\/+|\/+$/g, '');
	const reqMethod = req.method.toLowerCase();
	const reqHeaders = req.headers;

	const decoder = new StringDecoder('utf-8');
	let reqPayload = '';

	req.on('data', data => (reqPayload += decoder.write(data)));
	req.on('end', () => {
		reqPayload += decoder.end();

		const chosenHandler =
			typeof routers[reqTrimmedPath] !== 'undefined' ? routers[reqTrimmedPath] : handlers.notFound;

		const data = {
			trimmedPath: reqTrimmedPath,
			queryStringObject: reqQueryStringObject,
			method: reqMethod,
			headers: reqHeaders,
			payload: reqPayload,
		};

		chosenHandler(data, (statusCode, payload) => {
			statusCode = typeof statusCode === 'number' ? statusCode : 200;
			payload = typeof payload === 'object' ? payload : {};

			const payloadString = JSON.stringify(payload);
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);
			global.console.log('Returning the response: ', statusCode, payloadString);
		});
	});
});

server.listen(config.port, () =>
	global.console.log(`Server is listening on port: ${config.port} in ${config.env} mode.`)
);
