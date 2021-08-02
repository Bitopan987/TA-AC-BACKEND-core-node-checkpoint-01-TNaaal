var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
var server = http.createServer(handleRequest);
var userPath = __dirname + '/contacts/';

function handleRequest(req, res) {
  var parseUrl = url.parse(req.url, true);
  var store = '';
  req.on('data', (chunk) => {
    store += chunk;
  });

  if (req.url.split('.').pop() === 'css') {
    res.setHeader('Content-Type', 'text/css');
    fs.readFile(__dirname + req.url, (err, content) => {
      if (err) return console.log(err);
      res.end(content);
    });
  }
  if (req.url.split('.').pop() === 'png') {
    res.setHeader('Content-Type', 'image/png');
    fs.readFile(__dirname + req.url, (err, content) => {
      if (err) return console.log(err);
      res.end(content);
    });
  }
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile(__dirname + '/index.html', (err, content) => {
      if (err) return console.log(err);
      res.end(content);
    });
  }
  if (req.method === 'GET' && req.url === '/about') {
    res.setHeader('Content-Type', 'text/html');
    fs.readFile(__dirname + '/about.html', (err, content) => {
      if (err) return console.log(err);
      res.end(content);
    });
  }

  req.on('end', () => {
    if (req.method === 'GET' && req.url === '/contact') {
      res.setHeader('Content-type', 'text/html');
      fs.createReadStream('./form.html').pipe(res);
    }

    if (req.url === '/form' && req.method === 'POST') {
      var username = qs.parse(store).username;
      fs.open(userPath + username + '.json', 'wx', (err, fd) => {
        if (err) return res.end('username taken');
        fs.writeFile(fd, store, (err) => {
          if (err) return console.log(err);
          fs.close(fd, () => {
            return res.end(`contact saved`);
          });
        });
      });
    }
  });

  if (parseUrl.pathname === '/users' && req.method === 'GET') {
    var userName = parseUrl.query.username;
    fs.readFile(userPath + userName + '.json', (err, content) => {
      var parsedata = qs.parse(content.toString());
      if (err) return console.log(err);
      return res.end(JSON.stringify(parsedata));
    });
  }
}

server.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});
