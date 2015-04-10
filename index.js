var qr = require('qr-image');  
var express = require('express');

var app = express();

var notp = require('notp'),
    t2 = require('thirty-two'),
    K = '12345678901234567890',
	b32 = t2.encode(K),
	issuer = encodeURIComponent('Bgok LTD'),
	username = encodeURIComponent('bgok@me.com');

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/qr-image.svg', function(req, res) {  
  var code = qr.image(req.query.d, { type: 'svg' });
  res.type('svg');
  code.pipe(res);
});

app.get('/', function(req, res) {
  var html = buildHtml(req);

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Expires': new Date().toUTCString()
  });
  res.end(html);
});

app.post('/validate', function(req, res) {
  var code = req.body.code;
  var httpReturnCode ;

  var skew = notp.totp.verify(code, K, {
    window: 1
  });

  console.log("code:", code, "skew:", skew);

  if (skew) {
  	httpReturnCode = 200;
  } else {
  	httpReturnCode = 403;
  }

  res.writeHead(httpReturnCode, {
    'Content-Type': 'text/html',
    'Expires': new Date().toUTCString()
  });

  res.end();
});

function buildHtml(req) {
  return '<img style="width:300px;height:300px;" src="/qr-image.svg?d=' + encodeURIComponent('otpauth://totp/' + username + '?secret=' + b32 + '&issuer=' + issuer)+ '">'
}

app.listen(3000);  
