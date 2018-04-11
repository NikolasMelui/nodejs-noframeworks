import http from 'http';
import url from 'url';

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const path = parsedUrl.pathname;
	const queryStringObject = parsedUrl.query;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');
	const method = req.method.toLocaleUpperCase();
	res.end(`Path is: ${trimmedPath}\n`);
	global.console.log(
		`Request received on path: ${trimmedPath} with ${method} method and these query parameters: ${JSON.stringify(
			queryStringObject
		)}.`
	);
});

server.listen(3000, () => global.console.log(`Server is listening on port 3000`));
