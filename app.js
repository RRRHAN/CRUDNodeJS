const http = require("http");
const url = require("url");
const router = require("routes");
const view = require("swig");

router.addRoute('/', function (req, res) {
    let html = view.compileFile('./index.html');
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(html);
});

router.addRoute('/detail', function (req, res) {
    let html = view.compileFile('./detail.html');
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(html);
});

router.addRoute('/edit', function (req, res) {
    let html = view.compileFile('./edit.html');
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(html);
});

router.addRoute('/tambah', function (req, res) {
    let html = view.compileFile('./tambah.html');
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(html);
});


http.createServer(function (req, res) {
    let path = url.parse(req.url).pathname;
    let match = router.match(path);
    if (match) {
        match.fn(req, res)
    } else {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });
        res.end("404 not found");
    }
}).listen(3333);


console.log("server is running ......");