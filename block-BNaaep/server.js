var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
// var path = require('path');
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
      return fs.createReadStream('./form.html').pipe(res);
    }

    if (req.url === '/form' && req.method === 'POST') {
      var dataparsed = qs.parse(store);
      var username = qs.parse(store).username;
      fs.open(userPath + username + '.json', 'wx', (err, fd) => {
        if (err) return res.end(`${username} taken`);
        fs.writeFile(fd, JSON.stringify(dataparsed), (err) => {
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
      var parsedata = JSON.parse(content);
      if (err) return console.log(err);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`<h2>${parsedata.name}</h2>`);
      res.write(`<h2>${parsedata.email}</h2>`);
      res.write(`<h2>${parsedata.username}</h2>`);
      res.write(`<h2>${parsedata.age}</h2>`);
      res.write(`<h2>${parsedata.bio}</h2>`);
      return res.end();
    });
  }
  if (req.url === '/users' && req.method === 'GET') {
    let rootFolder = __dirname + '/contacts';
    let files = fs.readdirSync(rootFolder);
    let contacts = files.map((file) => {
      return JSON.parse(fs.readFileSync(rootFolder + '/' + file));
    });

    let datas = '';

    contacts.forEach((contact) => {
      datas += `<h2>${contact.name}</h2>
         <h2>${contact.email}</h2>
        <h2>${contact.username}</h2>
        <h2>${contact.age}</h2>
      <h2>${contact.bio}</h2>`;
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(datas);
  }
  if (req.url === '*') {
    res.statusCode = 404;
    res.end('Page Not Found');
  }
}

server.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});
