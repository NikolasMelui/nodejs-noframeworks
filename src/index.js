import fs from 'fs';
import http from 'http';
import url from 'url';
import https from 'https';
import { StringDecoder } from 'string_decoder';
import _data from './lib/data';
import config from './config';

const handlers = {
	ping: (data, callback) => callback(200, { res: 'server is working' }),
	notFound: (data, callback) => callback(404),
};

const routers = {
	ping: handlers.ping,
};

const httpsServerOptions = {
	key: fs.readFileSync('./src/ssl/key.pem'),
	cert: fs.readFileSync('./src/ssl/cert.pem'),
};

const unifiedServer = (req, res) => {
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
};

const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => global.console.log(`Server is listening on port: ${config.httpPort}.`));
httpsServer.listen(config.httpsPort, () => global.console.log(`Server is listening on port: ${config.httpsPort}.`));
