// Alex MEURILLON


// Variables utiles pour le programme

// Défini le nombre de lettres min et max suivant la difficulté du jeu
let nb_lettre_min;
let nb_lettre_max;


// Variables utiles pour le jeu
let mot_livre_split=[];
let mot_livre=[];
let mot;
let errors=0;
let letter;
let isGameOver=false;

// Module importé utile dans le programme
const fs = require('fs');
const url = require('url');



// Dictionnaire qui contiendra toutes les parties de tous les utilisateurs
let games = {};


let all_users = {}; // Dictionnaire pour stocker les utilisateurs


// Module pour crypter la communication du token et mot de passe secret permettant de décrypter
const jwt = require('jsonwebtoken');
const SECRET_KEY='pourrieres';

// http://google.fr/my/result?key=value&key2=value2#myId2
// ? donne le premier paramètre
// & ajouter un ième paramètre apres le 1er
// # va aller à l'id myId2 directement sur la page



// Chemin pour accéder au fichier
const fileName = "lesmiserables.txt";



// Permet de lire le livre dans lequel on va trier les mots utiles pour le jeu
fs.readFile(fileName,"utf-8",function(error, data) {
    if (error) { console.log('Fichier inexistant'); }
    else { 
        // On récupère un tableau de mots du livre
        // Expression régulière, comment ça marche ?
        // / / pour chopper l'expression régulière
        // ( ) pour regrouper des conditions à l'intérieur
        // ? : 0-1
        // * : 0-+infini
        // + : 1-+infini
        // ^ : début de ligne
        // $ : fin de ligne
        // \r?\n : Expression pour les sauts de ligne suivant le système d'exploitation du pc.
        mot_livre_split=data.split(/[\r?\n,.;!' \:]/);
        // On boucle sur le tableau mot_livre_split
        for (let i=0; i<mot_livre_split.length;i++){
            // mot_livre_split[i] est le ième mot du livre
            // On vérifie que le mot fait plus de deux lettres
            if (mot_livre_split[i].length < 2) continue;
            
            let continuer=true;

            // On vérifie si le mot est en minuscule
            for (j=0; j<mot_livre_split[i].length; j++){
                if (mot_livre_split[i].charCodeAt(j)< 97 || mot_livre_split[i].charCodeAt(j)>122){
                    continuer=false;
                    break;
                } 
            }
            // Si le mot ne contient pas que des minuscules, on passe à l'incrémentation suivante
            if (!continuer) continue;

            // On vérifie si le mot est déjà inclu dans la liste et s'il possède entre 4 (min niveau facile) et 14 (max niveau difficile) lettres.
            if (!(mot_livre.includes(mot_livre_split[i])) && mot_livre_split[i].length>=4 && mot_livre_split[i].length<=14){
                // On ne traite que les mots compris entre 4 et 14 caractères, on triera plus tard suivant le niveau de difficulté
                // !1 && 2 && 3
                // a.includes(b) permet de boucler sur b pour savoir si a est dedans
                // Si on rentre dans cette condition alors le mot est acceptable pour le jeu

                // On crée des listes dans la liste mot_livre suivant la taille du mot
                // Si la liste n'a pas été crée alors on en crée une
                if (!mot_livre[mot_livre_split[i].length]){
                    mot_livre[mot_livre_split[i].length] = [];
                } 
                // Ajoute le mot à la liste des mots de même taille
                mot_livre[mot_livre_split[i].length].push(mot_livre_split[i]);
            }
        }
    }     
});











// Data de jwt, par exemple : 
/*
{
    "sub": "1234567890",
    "name": "John Doe",
    "iat": 1516239022
  }
*/
// Doc complète : https://jwt.io

// Fonction vérifiant le token reçu si ça correspond bien avec le décryptage de la clé secrète
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        console.log('Token invalide');
        return error.message;
    }
}


// Fonction gérant toutes les requêtes que l'on reçoit suivant leur nature
function manageRequest(request, response) {
    // 200 à 299 : requête réussie. Par convention, on met 200
    response.statusCode = 200;


    // Récupère l'URL complète
    const fullUrl = `http://${request.headers.host}${request.url}`;
    const url = new URL(fullUrl);

    recup_api=request.url.split('?')[0].split('/');
    let feature=recup_api[recup_api.indexOf("api")+1];


    // On traite tous les cas que le client peut demander au serveur

    // 1er cas : L'utilisateur souhaite s'inscrire. On spécifie la méthode pour distinguer les types de requêtes HTTP que l'on reçoit
    if (feature === 'signin' && request.method === 'POST') {
        let body = '';
        // Ce premier request.on permet, si nécessaire, de recevoir des bouts de data que l'on complète au fur et à mesure pour obtenir body au final.
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            try {
                // On a reçu le body et extrait le nom d'utilisateur et le mot de passe.
                const userData = JSON.parse(body);
                const username = userData.username;
                const password = userData.password;
                console.log("Utilisateur(s) : " + JSON.stringify(all_users));
                
                // Vérification que l'utilisateur n'existe pas sinon on renvoie une erreur. 
                if (all_users[username]) {
                    // 400 à 499 : Erreur de la réponse coté client. Le client rentre un nom d'utilisateur déjà existant donc ne fonctionne pas
                    response.statusCode = 400;
                    response.end(JSON.stringify({ donnee: 'User  ' + username + ' already exists.' }));
                } 
                // Sinon inscription réussie
                else {
                    // On l'ajoute à nos utilisateurs 
                    all_users[username] = password;
                    response.statusCode = 200;
                    response.end(JSON.stringify({ donnee: 'Inscription réussie' }));
                }
            } 
            catch (error) {
                // 500 à 599 : Erreur de la réponse coté serveur. Le serveur ne fonctionne pas donc on avertit le client
                response.statusCode = 500;
                response.end(JSON.stringify({ error: 'Serveur en panne' }));
            }
        });
    }

    // 2ème cas : L'utilisateur se connecte => Méthode POST 
    else if (feature === 'login' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            try {
                const userData = JSON.parse(body);
                const username = userData.username;
                const password = userData.password;
                
                // Si le nom d'utilisateur dans la base de donnée (all_users) n'existe pas, on renvoie une erreur
                if (!all_users[username]){
                    response.statusCode = 400;
                    response.end(JSON.stringify('unknown user ' + username + '.' ));
                } 
                // Si le nom d'utilisateur correspond au mot de passe qui est stocké dans all_users, alors la connection s'établit
                else if (all_users[username] === password) {
                    /* Fonction jwt.sign qui prend 3 arguments :
                    - Payload: { username: username } qui est un objet qui contient le nom d'utilisateur
                    - Clé secrète : SECRET_KEY qui est la clé secrète utilisée pour signer le token
                    - Options : { expiresIn: '1d' } qui définit la durée de validité du token donc 1 jour dans notre cas
                     */
                    const token = jwt.sign({ username: username }, SECRET_KEY, { expiresIn: '1d' });
                    response.statusCode = 200;
                    response.end(JSON.stringify({ message: 'Connexion réussie', token: token }));
                    console.log ("Utilisateur total : " + JSON.stringify(all_users));
                } 
                // Dernier cas, le mot de passe est incorrect
                else {
                    response.statusCode = 400;
                    response.end(JSON.stringify('incorrect password.'));
                }
            } 
            catch (error) {
                // 500 à 599 : Erreur de la réponse coté serveur. Le serveur ne fonctionne pas donc on avertit le client
                response.statusCode = 500;
                response.end(JSON.stringify({error: 'Serveur en panne'}));
            }
        });
    }

    // On est dans le cas où l'on joue au jeu, donc avant toute action, on vérifie si le token est valide
    else {
        const token=request.headers['token'];
        const userData_token = verifyToken(token['token']);

        // Si le token n'est pas bien décrypté, on aura une erreur
        if (!userData_token){
            response.statusCode = 401;
            response.end(JSON.stringify({ error: 'Token invalide ou manquant' }));
            return; // On force le programme à s'arrêter là et ne pas passer dans les boucles de jeu
        }

        // On vient de s'assurer que l'utilisateur qui joue est valide donc on l'affecte à la variable de notre jeu.
        // On ajoute .username car la data contient d'autre information, cf. verifyToken
        username=userData_token.username;

        // 3ème cas : Début d'une partie
        if (feature=='newGame'){
            // On récupère la difficulté que l'utilisateur a choisi
            let parametre=request.url.split('?level=')[1];
            if (parametre=='facile'){
                nb_lettre_min=4;
                nb_lettre_max=5;
            };
            if (parametre=='moyen'){
                nb_lettre_min=6;
                nb_lettre_max=8;
            };
            if (parametre=='difficile'){
                nb_lettre_min=9;
                nb_lettre_max=12;
            };
            if (parametre!='facile' && parametre!='moyen' && parametre!='diffile'){
                // Au cas où l'utilisateur fait des bêtises avec notre code, on le fait souffir 
                nb_lettre_min=11;
                nb_lettre_max=14;
            }

            // On instancie une nouvelle partie, celle qui est en cours, en la mettant dans notre liste de toutes les parties
            partieEnCours = new Game(letter);
            games[partieEnCours.currentGameId] = partieEnCours;
            response.statusCode = 200;
            response.end(JSON.stringify({wordLength: partieEnCours.mot.length, currentGameId: partieEnCours.currentGameId}));
        }

        // 4ème cas : On vérifie une lettre dans le mot
        else if (feature=='testLetter'){

            // Valeur de 'gameId'
            let currentGameId = url.searchParams.get('gameId');


            // Utilise currentGameId pour accéder à l'objet correspondant dans le tableau des jeux
            partieEnCours = games[currentGameId];

            console.log(partieEnCours); // Affiche la partie en cours

            // Partie inconnue
            if (!partieEnCours) {
                response.statusCode = 404;
                console.log("Partie n'existe pas");
                response.end(`Aucune partie trouvée avec l'id ${currentGameId}.`);
            }

            // On règle le problème de pouvoir encore appeler des lettres après avoir fini la partie
            if (partieEnCours.isGameOver) {
                response.statusCode = 400;
                console.log(`Partie déjà terminé donc aucun appel de nouvelle lettre`);
                response.end(`Veuillez relancer une partie`);
            }

            // Récupère la lettre selectionné par l'utilisateur et la transmet à la focntion testLetter dans notre classe Game
            let letter = url.searchParams.get('letter').toLowerCase();
            response.statusCode = 200;
            response.end(JSON.stringify(partieEnCours.testLetter(letter)));  
        }


        // 5ème et dernier cas : On ne trouve pas le endpoint demandé
        else {
            response.statusCode = 404;
            response.end('Endpoint non trouvé');
        }
    }
}

// Permet d'exporter notre fonction manageRequest() dans un autre fichier : index.js
exports.manage = manageRequest;








 

// Classe permettant de gérer, individuellement, chaque partie de chaque utilisateur
class Game {
    static gameIdDepart = 83; // Unique moyen pour déclarer une variable fixe dans une classe

    constructor() {
        // On fixe le nombre de lettre suivant le niveau de difficulté
        this.nb_lettre_mot = getRandomIntInclusive(nb_lettre_min,nb_lettre_max);
        // On instancie une nouvelle partie
        this.newGame();
    }

    newGame() {
        // Initialisation de toutes les variables pour une nouvelle partie.
        // Nombre allant de =0 à <1 pour Math.random() et .floor() pour arrondir à l'inférieur donc aucun problème d'obtenir un mot qui n'est pas dans la liste
        let position_mot = Math.floor(Math.random()*(mot_livre[this.nb_lettre_mot].length));
        this.mot=mot_livre[this.nb_lettre_mot][position_mot];
        this.errors = 0;
        this.mysteryWord = "-".repeat(this.mot.length).split("");
        this.currentGameId = Game.gameIdDepart++; // On doit mettre Game devant pour pouvoir l'utiliser dans la classe sinon error : ReferenceError: gameIdDepart is not defined
        this.isGameOver = false;
    }

    // On vient tester la lettre dans le mot 
    testLetter(letter) {
        // Index où la lettre testée est bonne
        let position_lettre_choisie = [];

        // On boucle sur le mot pour savoir si la lettre est dedans
        for (let i=0 ; i<this.mot.length ; i++) {
            if (this.mot[i] === letter) {
                /// === pour être sur d'avoir le même caractère
                position_lettre_choisie.push(i);
                this.mysteryWord[i] = letter;
            }
        }

        // Le joueur a trouvé une lettre qui est bonne
        if (position_lettre_choisie.length >= 1){
            // Cas où on a trouvé le mot entier 
            if (this.mysteryWord === this.mot){
                this.isGameOver=true;
            }
            // Renvoie le nécessaire pour que le client puisse continuer sa partie ou affiche les informations de fin
            return {
                letter : letter,
                isCorrect : true,
                isGameOver : isGameOver,
                positions: position_lettre_choisie,
                errors: this.errors,
            }
        }

        // Le joueur a fait une faute donc le nombre d'erreurs augmente
        else {
            this.errors++;
            // Cas où le joueur a fait 7 erreurs donc la partie est perdue
            if (this.errors === 7) {
                this.isGameOver = true;
                return {
                    letter: letter,
                    position_lettre_choisie: [],
                    errors: this.errors,
                    isGameOver: true,
                    word: this.mot
                };
                
            } 
            else {
                // Cas où le joueur a fait moins de 7 erreurs, la partie continue
                return {
                    letter : letter,
                    isCorrect : false,
                    isGameOver : false,
                    positions: [],
                    errors: this.errors
                };
            }
        } 
    }
}



// Renvoie un entier aléatoire entre une valeur min (incluse) et une valeur max (incluse)
// Utile pour sélectionner le nombre de lettre parmi un intervalle
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}