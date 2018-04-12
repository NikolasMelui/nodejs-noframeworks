import http from 'http';
import url from 'url';
import { StringDecoder } from 'string_decoder';

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const path = parsedUrl.pathname;
	const queryStringObject = parsedUrl.query;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');
	const method = req.method.toLowerCase();
	const headersObject = req.headers;
	let headersString = '';
	for (const [key, value] of Object.entries(headersObject)) {
		headersString += `${key} => ${value}\n`;
	}

	const decoder = new StringDecoder('utf-8');
	let buffer = '';

	req.on('data', data => (buffer += decoder.write(data)));
	req.on('end', () => {
		buffer += decoder.end();
		global.console.log(
			`Request received on path: ${trimmedPath}\nwith method: ${method}\nquery parameters: ${JSON.stringify(
				queryStringObject
			)}\npayloads: ${buffer}`
		);
		global.console.log(`and headers:\n`, headersObject);
		res.end(`Path: ${trimmedPath}\nHeaders:\n${headersString}`);
	});
});

server.listen(3000, () => global.console.log(`Server is listening on port 3000`));

let handlers = {};

handlers.sample = (data, callback) => {
	callback(200, { name: 'sample handler' });
};

handlers.notFound = (data, callback) => {
	callback(404);
};

const router = {
	sample: handlers.sample,
};
