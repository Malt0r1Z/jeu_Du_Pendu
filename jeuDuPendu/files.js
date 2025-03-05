// Alex MEURILLON Gr.3

// Module utile pour la suite
const url = require('url');
const path = require('path');
const fs = require('fs');

// pathName pour trouver les fichiers sur lequels redirigés
const chemin_front = "./front";
const indexDeBase = "index.html";

// Format de fichiers
const mimeTypes = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.md': 'text/plain',
    'default': 'application/octet-stream'
};


// Erreur 404 lorsque le fichier n'existe pas 
function error404(pathName,response){
    response.statusCode = 404;
    response.end(`Le fichier ${pathName} n'existe pas...`);
}

// Gère les requêtes HTTP entrantes dans notre serveur Node.js
function manageRequest(request, response) {
    // On récupère le nom du chemin et l'extension
    let pathName = url.parse(chemin_front +request.url).pathname;
    let extension = path.parse(pathName).ext;
    
    try {
        // Error getting the file: ./front/: Error: EISDIR: illegal operation on a directory, read
        // On regarde si notre dossier existe bien sinon on a l'erreur au-dessous
        if (!fs.existsSync(pathName)) {
            error404(pathName,response);
            return;
        }

        // Redirige vers le fichier spécifique index.html à l'intérieur du répertoire /front et met à jour l'extension de fichier
        if (fs.statSync(pathName).isDirectory()){
            pathName+=`/${indexDeBase}`;
            extension=`.${indexDeBase.split(".")[1]}`;
        }

        // Lit toutes les données du fichier index.html
        fs.readFile(pathName, function(error, data) {
            // Fonction de callback prenant deux arguments
            // Fonction appelée après la lecture
            if (error) { 
                // Status code, le fichier n'existe pas
                response.statusCode = 404;
                console.log(`Error getting the file: ${pathName}: ${error}`);
            }
            else { 
                // Headers
                // TypeError [ERR_HTTP_INVALID_HEADER_VALUE]: Invalid value "undefined" for header "Content-Type"
                // On met 'default' car si on retape index.hmtl après avoir mis http://localhost:8000
                // On n'aura l'erreur ci-dessus. 
                response.setHeader('Content-Type', mimeTypes[extension] || mimeTypes['default'] );
                response.end(data);
            }
        })
    } 
    catch(error) {
        response.end("Il n'existe pas ton fichier");
    }
}

exports.manage = manageRequest;