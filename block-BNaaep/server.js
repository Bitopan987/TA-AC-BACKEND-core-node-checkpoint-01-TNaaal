var http = require('http');
var server = http.createServer(handleRequest);
function handleRequest(req, res) {
  res.end('Welcome');
}

server.listen(5000, () => {
  console.log('Listening to port 5000');
});
