import http from 'http';

const server = http.createServer((req, res) => res.end('Welcome to new project!'));

server.listen(3000, () => global.console.log(`Server is listening on port 3000`));
