const http = require('http');
const file = require("./module/file_management")
const fs = require('fs');
const url = require("url");
const git = require("./module/git")
const {
  parse
} = require('querystring');

function retFail() {
  res.writeHead(404)
  res.end()
}

function retJson(res, data) {
  try {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.write(JSON.stringify(data));
    res.end();
  } catch (error) {
    retFail()
  }
}

function retText(res, data) {
  try {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.write(data);
    res.end();
  } catch (error) {
    retFail()
  }
}

let router = []

function handle(req, res) {

  if (req.url == "/") {
    fs.readFile('static/index.html', function (err, data) {
      retText(res, data)
    });
    return
  }

  for (r of router) {
    if (r.test(req.url)) {
      r.func(req, res, url.parse(req.url, true).query)
      return
    }
  }

  // handle static resource
  fs.readFile("static" + req.url, function (err, data) {
    let file_type = /.*\.(\w+$)/.exec(req.url)[1]
    let content_type = "text/html"
    if (file_type == "js") {
      content_type = "text/javascript"
    } else if (file_type == "css") {
      content_type = "text/css"
    } else if (file_type == "ico") {
      content_type = "image/vnd.microsoft.icon"
    }
    res.writeHead(200, {
      'Content-Type': content_type
    });
    res.write(data);
    res.end();

  });
}

function regPath() {

  function register(path_func) {
    router.push({
      test: (url) => /.*\/([^?]*)/.exec(url)[1] == path_func[0],
      func: path_func[1]
    })
  }

  let pairs = [
    ["listfile", (req, res, q) => retJson(res, file.allFiles())],
    ["decryptT", (req, res, q) => retText(res, file.decryptFile(q.name))],
    ["decryptJ", (req, res, q) => retJson(res, file.decryptFile(q.name))],
    ["keyexist", (req, res, q) => retJson(res, file.keyExist())],
    ["recoverkey", (req, res, q) => {
      try {
        file.recoverKey(q.pass)
        return retJson(res, true);
      } catch (error) {
        return retJson(res, false);
      }
    }],
    ["genkey", (req, res, q) => {
      file.genKey(q.pass)
      //remove all encrypted files with other key
      file.allFiles().forEach((x) => {
        file.deleteFile(x)
      })
      return retJson(res, true);
    }],
    ["keyrecovered", (req, res, q) => retJson(res, file.keyRecovered())],
    ["savefile", (req, res, q) => {
      let body = "";
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on("end", () => {
        d = parse(body);
        file.encryptFile(d.name, d.content)
        retJson(res, true);
      })
    }],
    ["delete", (req, res, q) => {
      file.deleteFile(q.name);
      return retJson(res, true);
    }],
    ["push", (req, res, q) => {
      git.push()
      return retJson(res, true);
    }],
    ["pull",
      (req, res, q) => {
        git.pull()
        return retJson(res, true);
      }
    ],
  ]

  for (pf of pairs) {
    register(pf)
  }
}

http.createServer(function (req, res) {
  file.mkDirIfNeeded()
  regPath()
  handle(req, res)
}).listen(4321);
