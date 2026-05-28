'use strict'
const http = require('node:http');
const auth = require('http-auth');
const router = require('./lib/diaryRoutes');

const AUTH_REALM = 'Enter username and password.';

const basic = auth.basic({
  realm: AUTH_REALM,
  file: './users.htpasswd'
});

const server = http.createServer(basic.check((req, res) => {
  router.route(req, res);
}))
.on('error', e => {
  console.error('Server Error', e);
})
.on('clientError', e => {
  console.error('Client Error', e);
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.info(`Listening on ${port}`);
});