import http from 'http';
import config from './config';

const server = http.createServer((req, res) => res.end('Hello there!'));

server.listen(3000, () => console.log(`Server is listening on ${config.server.port}`));
