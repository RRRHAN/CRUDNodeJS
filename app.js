const http = require("http");
const url = require("url");
const router = require("routes")();
const qstring = require("querystring");
const view = require("swig-templates");
const static = require('node-static');
const mysql = require("mysql");

const formidable = require('formidable');
const fs = require('fs');

let NodeSession = require('node-session');
session = new NodeSession({
    secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD'
});

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: '',
    database: "crudnodejs"
});


let file = new static.Server('./public', {
    cache: 7200,
    headers: {
        'X-Hello': 'World!'
    }
});

http.createServer(function (request, response) {
    file.serve(request, response, function (err, res) {
        if (err) { // An error as occured
            console.error("> Error serving " + request.url + " - " + err.message);
            response.writeHead(err.status, err.headers);
            response.end();
        } else { // The file was served successfully
            // console.log("> " + request.url + " - " + res.message);
        }
    });
}).listen(1111);



router.addRoute('/', function (req, res) {
    connection.query("select * from player", function (err, rows, field) {
        if (err) {
            console.log(err);
        }
        session.startSession(req, res, function () {
            let flashdata = req.session.get('flashdata');
            // console.log(req.session.get('delete'));
            let html;
            if (flashdata) {
                html = view.compileFile('./view/index.html')({
                    data: rows,
                    flashdata: flashdata
                });
                // console.log(Delete);
                req.session.forget('flashdata');
            } else if (!flashdata) {
                html = view.compileFile('./view/index.html')({
                    data: rows
                });
            }
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.end(html);
        });
    });
});

router.addRoute('/detail/:id', function (req, res) {
    connection.query("select * from player where ?", {
        id: this.params.id
    }, function (err, rows, field) {
        if (err) {
            console.error(err);
        }
        let html = view.compileFile('./view/detail.html')({
            data: rows[0]
        });
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end(html);
    });
});

router.addRoute('/delete/:id', function (req, res) {
    let id = this.params.id;
    connection.query("delete from player where ?", {
        id: id
    }, function (err, field) {
        session.startSession(req, res, function () {
            req.session.put('flashdata', 'Data delete succesfully');
            res.writeHead(302, {
                "Location": "/"
            });
            res.end();
        });
    });
});

router.addRoute('/edit/:id', function (req, res) {
    let id = this.params.id;
    // console.log(id);
    if (req.method.toUpperCase() == "POST") {
        let data_post = "";
        req.on('data', function (chuncks) {
            data_post += chuncks;
            // console.log(chuncks);
        });
        req.on('end', function () {
            data_post = qstring.parse(data_post);
            // console.log(data_post);
            // console.log(id);
            connection.query("update player set ? where ?", [data_post, {
                id: id
            }], function (err, field) {
                if (err) {
                    console.log("error")
                    console.log(err)
                }
                session.startSession(req, res, function () {
                    req.session.put('flashdata', 'Data update succesfully');
                    res.writeHead(302, {
                        "Location": "/"
                    });
                    res.end();
                });
            });
            // console.log(data_post);
        });
    } else {
        // console.log(rows);
        connection.query("select * from player where ?", {
            id: id
        }, function (err, rows, field) {
            if (err) {
                console.log(err)
            }
            // console.log(id);
            let html = view.compileFile('./view/edit.html')({
                data: rows[0]
            });
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.end(html);
        });
    }

});

// router.addRoute('/form', function (req, res) {
//     res.writeHead(200, {
//         'Content-Type': 'text/html'
//     });
//     res.write('<form action="/post" method="post" enctype="multipart/form-data">');
//     res.write('<input type="file" name="filetoupload"><br>');
//     res.write('<input type="submit">');
//     res.write('</form>');
//     return res.end();
// });

// router.addRoute('/post', function (req, res) {
//     let form = new formidable.IncomingForm();
//     form.parse(req, function (err, fields, files) {
//         // let oldpath = files.filetoupload.path;
//         // let newpath = './public/img/photo/' + files.filetoupload.name;
//         let newpath = './public/img/photo/lewiiiii.jpg';
//         let oldpath = './public/img/photo/lewi.jpg';
//         console.log("old : " + oldpath);
//         console.log("new : " + newpath);
//         fs.rename(oldpath, newpath, function (err) {
//             if (err) {
//                 throw err;
//             }
//             res.write('File uploaded and moved!');
//             res.end();
//         });
//     });
// });


router.addRoute('/tambah', function (req, res) {
    if (req.method.toUpperCase() == "POST") {
        // console.log("form : " + form);
        let data_post = "";
        // console.log(files);
        req.on('data', function (chuncks) {
            data_post += chuncks;
        });
        req.on('end', function () {
            // console.log(data_post);
            data_post = qstring.parse(data_post);
            let data = data_post;
            let position = data.position.toUpperCase();
            data.position = position;
            data.photo = data.name + data.club;
            // console.log(data.photo);
            connection.query("insert into player set ? ", data, function (err, field) {
                if (err) {
                    console.log(err);
                }
                session.startSession(req, res, function () {
                    req.session.put('flashdata', 'Data added succesfully');
                    res.writeHead(302, {
                        "Location": "/"
                    });
                    res.end();
                });
            });
        });
        // console.log(data_post);
    } else {
        // console.log(req.method.toUpperCase())
        let html = view.compileFile('./view/tambah.html')();
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end(html);
    }
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