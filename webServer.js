const http = require('http');
const fs = require('fs');
const { saveContact, deleteContact, listContacts, handleUserInput } = require('./handleUser');

function htmlServer(res, file, errorMessage) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end(errorMessage);
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(data);
        }
    });
}

const server = http.createServer((req, res) => {
    const url = req.url;

    if (url === '/home') {
        htmlServer(res, 'home.ejs', 'File not found');
    } else if (url === '/about') {
        htmlServer(res, 'about.ejs', 'File not found');
    } else if (url === '/contact') {
        htmlServer(res, 'contact.ejs', 'File not found');
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.end('Page not found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
