'use strict'
const pug = require('pug');
const path = require('node:path');
const querystring = require('node:querystring');
const fs = require('node:fs');

function handleNotFound(req, res) {
  render(res, 'error', {
    title: 'エラー - デジタル日記帳',
    heading: 'エラー',
    message: 'ページが見つかりません。'
  }, 404);
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location
  });
  res.end();
}

function render(res, templatePath, data = {}, statusCode = 200) {
  const html = pug.renderFile(
    path.join(__dirname, '..', 'views', `${templatePath}.pug`),
    data
  );

  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(html);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      resolve(querystring.parse(body));
    });

    req.on('error', reject);
  });
}

function getQuery(req) {
  const query = req.url.split('?')[1];

  if (!query) {
    return {};
  }

  return querystring.parse(query);
}

function serveStyleCss(req, res) {
  const filePath = path.join(__dirname, '..', 'public', 'style.css');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      handleNotFound(req, res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/css; charset=utf-8'
    });
    res.end(data);
  });
}

function serveFavicon(req, res) {
  const filePath = path.join(__dirname, '..', 'public', 'favicon.ico');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      handleNotFound(req, res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'image/x-icon'
    });
    res.end(data);
  });
}

function getIdFromQuery(req) {
  const query = getQuery(req);
  const id = Number(query.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

module.exports = {
  handleNotFound,
  redirect,
  render,
  parseBody,
  getQuery,
  serveStyleCss,
  serveFavicon,
  getIdFromQuery
};