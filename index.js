// Alex MEURILLON

// Module permettant de créer le serveur et de rediriger vers le bon fichier
const http = require('http');
const manageRequest_files = require("./files.js");
const manageRequest_api = require("./api.js");


// Permet de créer un serveur 
http.createServer(function(request, response) {
    // URL
    let url = request.url;
    let url_split = url.split('/');
    if (url_split[1]=='api'){
        manageRequest_api.manage(request, response);
        // On met .manage car dans notre fichier files.js, on a appelé manageRequest
        // dans la variable manage
    }
    else {
        manageRequest_files.manage(request, response);
    }
}).listen(8000); // On écoute sur le port 8000.
// A savoir que les ports 0 à 1023 sont protégés !