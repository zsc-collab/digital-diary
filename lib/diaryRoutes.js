'use strict';
const controller = require('./diaryController');
const util = require('./util');

function route(req,res){
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] === 'http'){
    util.handleNotFound(req,res);
    return;
  }

  const pathname = req.url.split('?')[0];

  switch (pathname){
    case '/':
      util.redirect(res, '/diaries');
      break;

    case '/diaries':
      controller.index(req, res);
      break;

    case '/diaries/new':
      controller.new(req, res);
      break;

    case '/diaries/create':
      controller.create(req, res);
      break;

    case'/diaries/show':
      controller.show(req, res);
      break;

    case'/diaries/edit':
      controller.edit(req, res);
      break;

    case'/diaries/update':
      controller.update(req, res);
      break;

    case'/diaries/delete':
      controller.delete(req, res);
      break;

    case '/style.css':
      util.serveStyleCss(req,res)
      break;

    case '/favicon.ico':
      util. serveFavicon(req,res);
      break;

    default:
      util.handleNotFound(req, res);
      break;
  }
}

module.exports = {
  route
};