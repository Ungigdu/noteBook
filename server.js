var http = require('http');
var file = require("./module/file_management")
var fs = require('fs');
var url = require("url");
const { parse } = require('querystring');

function retJson(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(data));
  return res.end();
}

function retText(res, data) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(data);
  return res.end();
}

http.createServer(function (req, res) {
  var q = url.parse(req.url, true).query;
  if (req.url == "/listfile") {
    return retJson(res, file.allFiles())
  } else if (/^\/decrypt/.test(req.url)) {
    return retText(res, file.decryptFile(q.name));
  } else if (req.url == "/keyexist") {
    return retJson(res, file.keyExist());
  } else if (/^\/recoverkey/.test(req.url)) {
    try {
      file.recoverKey(q.pass)
      return retJson(res, true);
    } catch (error) {
      return retJson(res, false);
    }
  } else if (/^\/genkey/.test(req.url)) {
    file.genKey(q.pass)
    //remove all encrypted files with other key
    file.allFiles().forEach((x) => { file.deleteFile(x) })
    return retJson(res, true);
  } else if (req.url == "/keyrecovered") {
    return retJson(res, file.keyRecovered())
  } else if (req.url == "/savefile") {
    let body = "";
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on("end", ()=>{
      d = parse(body);
      file.encryptFile(d.name, d.content)
      retJson(res, true);
    })
  }else if(/^\/delete/.test(req.url)){
    file.deleteFile(q.name);
    return retJson(res, true);
  } else {
    fs.readFile('static/index.html', function (err, data) {
      return retText(res, data)
    });
  }
}).listen(4321);