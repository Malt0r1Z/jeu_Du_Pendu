// Alex MEURILLON Gr.3

// Récupération des éléments HTML
const gimage = document.getElementById("gimage");
const gcontrols = document.getElementById("gcontrols");
const startButton = document.getElementById("newgame");
//const continuer = document.getElementById('continue');
const resetButton = document.getElementById('restartb');
const word2guess = document.getElementById("word2guess");
const letterButton = document.querySelectorAll("#gchars span");
const nberreurs = document.getElementById("nbessais");
let stickMan=document.querySelectorAll("#i1, #i2, #i3, #i4, #i5, #i6, #i7");
const loading = document.getElementById('windows8');


const level_select = document.getElementById("level-select");




// Déclararation de variables utiles pour le programme 
let NbrDeClick=0;
let mysteryWord ="";
let guessedWord = []; // ""
let gagner=false;
let nbEssais = 0;
let token=localStorage.getItem('token');
let wordLength=0;
var position=[];
let errors=0;
let lettreRestante=0;
let isCorrect=false;
let trouver = {};
let isGameOver;
let lettreSelectionne=[];
let nouvellePartie;
let gameId;


let level_select_by_user;




// On affiche dans la console que ce n'est pas un outil pour l'utilisateur 
console.log("%cSTOP !", "background: red; color: yellow; font-size: x-large");
console.log("%cIl s’agit d’une fonctionnalité de navigateur conçue pour les développeurs. Si quelqu’un vous a invité(e) à copier-coller quelque chose ici pour activer une fonctionnalité ou pirater le compte d’un tiers, sachez que c’est une escroquerie permettant à cette personne d’accéder à votre compte Jeu du Pendu.", 
"font-size: x-large");




// La fonction s'effectue lorsque la page est chargée 
window.addEventListener('load', ()=> {

    // Cache le message d'erreur si le serveur ne marche pas 
    document.getElementById("no_serveur").style.display='none';

    // Cache le message d'erreur si l'utilisateur n'est pas connecté 
    document.getElementById("no_connect").style.display="none";
    gimage.classList.toggle("hide");
    gcontrols.classList.toggle("hide");
    veriftoken();
});


// Fonction effectué lorsqu'on ferme la fenêtre
// On est obligé de se reconnecter avant d'être sur la page
window.onbeforeunload = closingCode;
function closingCode(){
    localStorage.clear();
   return null;
}

// Fonctions vérifiant si on est bien connecté, sinon est redirigé vers la page de connexion
function redirection_connexion(){
    window.location.assign('connect.html');
}

function veriftoken(){
    if (token==null){
        document.getElementById("no_connect").style.display="block";
        // Redirection vers le jeu du pendu
        setTimeout(redirection_connexion, 5000);
    }
}


//continuer.addEventListener('click', contiuerGame); // Si on appuie sur le bouton Continuer, alors faire la fonction contiuerGame()

resetButton.addEventListener('click', initgame); // Si on appuie sur le bouton Reset game, alors faire la fonction initgame()

startButton.addEventListener('click', affichage); // Si on appuie sur le bouton New game, alors faire la fonction affichage() 







// Fonction async qui initialise le mot à trouver
async function initgame(){
    nouvellePartie=true;
    gagner=false;
    nbEssais = 7;
    trouver = {};
    level_select.style.display="none";
    resetButton.style.display="none";
    document.querySelector("#gcontrols h2").style.display='block';
    //continuer.style.display='none';
    nberreurs.textContent = `Nombre d'essais restants : ${nbEssais}`;
    await word(); // Attend la reponse de testfetch avant de l'attribuer a wordLength;
    lettreRestante= wordLength;
    // Affiche les _ associés au nombre de lettres
    guessedWord="";
    for (let i = 0; i<wordLength; i++){
        guessedWord+="_ ";
    }
    word2guess.innerText = guessedWord; // On affiche dans le paragraphe word2guess 
    apparaitStickman();
}


function apparaitStickman(){
    // Fonction pour faire apparaitre le stickman
    NbrDeClick=0;
    for(let element of stickMan) {
        element.classList.add("non");}
    for(let i=0; i<letterButton.length; i++){ // On déselectionne les lettres pour les remettre à leur couleur initiale 
        letterButton[i].classList.remove("ok");
        letterButton[i].classList.remove("ko");
    }
}


function verificationLettreSelectionne(letter){
    // 1er cas si on clique sur New Game car aucune lettre déjà sélectionné
    if (nbEssais==7) return true;
    // On vérifie sur la lettre sélectionnée à été selctionné
    for (let i=0; lettreSelectionne.length; i++ ){
        if (lettreSelectionne[i]==letter) return true;
    }
    return false;
}


// Affiche uniquement le bouton New Game à l'écran
function affichage(){
    document.getElementById("aucune_partie_trouvee").style.display = "none";
    for(let element of stickMan) {
        element.classList.add("non");
    gimage.classList.toggle("hide");
    gcontrols.classList.toggle("hide");
    startButton.classList.toggle("hide");
    }
    initgame();
}



for (let i=0; i<letterButton.length; i++){ // Appuie sur les lettres de sélection 
    letterButton[i].addEventListener("click", () => letterClick(i));
}

// Fonction qui interagit avec le clavier des lettres et gère le nombre de lettres maximal autorisé
async function letterClick(i){

        if (nouvellePartie==true){ // Si on fait une nouvelle partie, on n'a pas le même appel que si on continue une partie
            await verification(letterButton[i].innerText);
        }
        if (NbrDeClick<7 && gagner==false && lettreRestante!=0) { // S'il reste des possiblités au joueur alors :
            if (isCorrect){ // On sait que la lettre choisie est la bonne après appel au serveur
                letterButton[i].classList.add("ok");
                lettreTrouve(letterButton[i].innerText);
            }
            else {
                nbEssais = 6-NbrDeClick;
                nberreurs.textContent = `Nombre d'essais restants : ${nbEssais}`;
                letterButton[i].classList.add("ko");
                NbrDeClick+=1;
                document.querySelector("#i"+NbrDeClick).classList.remove("non");
            }
        }


        if (NbrDeClick==7){ // si le stickman apparait fin de la partie
            // \n permet un saut de ligne
            word2guess.innerText = `AIE... Vous ferrez mieux la prochaine fois. \n Le mot mystère est : \n \"${mysteryWord} \" `;
            // Fait apparaître le bouton Rejouer
            resetButton.style.display="block";
            // On enlève la phrase Clique sur les lettres et cherche le mot mystère !!
            document.querySelector("#gcontrols h2").style.display='none';
        } 
        // Si le mot est bien choisi alors
        if (lettreRestante==0){
            document.querySelector("#gcontrols h2").style.display='none';
            word2guess.innerText = ` Vous avez GAGNÉ. \n Le mot mystère est : \n \"${mysteryWord} \" `;
            gagner=true;
            nbEssais=0;
            // Fait apparaître le bouton Rejouer
            window.setTimeout(initgame, 6000); // Délai de 6s avant d'effectuer la fonction initgame()
        }
 
}

// Modification de la variable guessedWord avec la lettre devinée, et affichage
function lettreTrouve(letter){

    
    for (let i=0; i<position.length; i++){
        trouver[position[i]]=letter;
        lettreRestante--;
    }

    mysteryWord="";
    for (let i=0; i<wordLength; i++){
        if (i in trouver){
            mysteryWord+= trouver[i] + " ";
        }
        else mysteryWord+= "_ ";
    }

    word2guess.innerText = mysteryWord;// on l'affiche dans le paragraphe word2guess
}




// En sélectionnant le niveau de difficulté, on modifie la taille du mot
level_select.addEventListener('change', function() {
    if (level_select.value=='facile'){
        console.log('facile');
        level_select_by_user='facile';
    };
    if (level_select.value=='moyen'){
        console.log('moyen');
        level_select_by_user='moyen';
    };
    if (level_select.value=='difficile'){
        console.log('difficile');
        level_select_by_user='difficile';
    };
}); 



// Réception du mot mystère grâce à une fonction async dans des données json
async function word() {
    loading.style.display = "block";

    try {
        const reponse = await fetch(`http://localhost:8000/api/newGame?level=${level_select_by_user}`, {
            method: "GET", // ou 'PUT'
            mode: 'cors',
            headers: {
            "token":token,
            'Content-Type': 'application/json',
            },
        });
        // .json() car on attend une réponse de cette forme pour pouvoir donner wordLength
        const resultat = await reponse.json();

        // Affectation des variables
        wordLength = resultat['wordLength'];
        gameId = resultat['currentGameId'];
    } catch (erreur) {
        document.getElementById("no_serveur").style.display='block';
    }
    loading.style.display = "none";
}




async function verification(letter) {
    let resultat;
    
    try {
        const reponse = await fetch(`http://localhost:8000/api/testLetter?letter=${letter}&gameId=${gameId}`, {
            method: "GET", // ou 'PUT'
            headers: {
            "token":token
            },
        });
        // .json() car on attend une réponse de cette forme pour pouvoir donner wordLength
        resultat = await reponse.json();


        // Affectation des variables
        letter=resultat['letter'];
        isCorrect=resultat['isCorrect'];
        isGameOver=resultat['isGameOver'];

    } catch (erreur) {
        document.getElementById("no_serveur").style.display='block';
    }

    if (isCorrect==true){
        position=resultat['positions'];
    }
    else {
        errors=resultat['errors'];
    }
    if (isGameOver || errors==7){
        mysteryWord=resultat['word'];
    }
}


async function contiuerGame(){
    loading.style.display = "block";
    nouvellePartie=false;
    let resultat;
    let correctLetters;
    let incorrectLetters;
    try {
        const reponse = await fetch(`"http://localhost:8000/gameState`, {
            method: "GET", // ou 'PUT'
            headers: {
            "token":token
            },
        });
        // .json() car on attend une réponse de cette forme pour pouvoir donner wordLength
        resultat = await reponse.json();

        // Affectation des différentes variables
        wordLength=resultat['wordLength'];
        errors=resultat['errors'];
        correctLetters=resultat['correctLetters'];
        incorrectLetters=resultat['incorrectLetters'];
        nouvellePartie=true;
        gagner=false;
        nbEssais = 7;
        trouver = {};

        for(let element of stickMan) {
            element.classList.add("non");
        gimage.classList.toggle("hide");
        gcontrols.classList.toggle("hide");
        startButton.classList.toggle("hide");
        }
        document.querySelector("#gcontrols h2").style.display='block';
        //continuer.style.display='none';

        nberreurs.textContent = `Nombre d'essais restants : ${nbEssais}`;
        lettreRestante= wordLength;
        // Affiche les _ associés au nombre de lettres
        guessedWord="";
        for (let i = 0; i<wordLength; i++){
            guessedWord+="_ ";
        }
        word2guess.innerText = guessedWord;


        apparaitStickman();

        isCorrect=true;
        for(let i=0; i<correctLetters.length;i++){
            if (correctLetters[i]!="_"){
                // Permet de récupérer la position de la lettre dans l'alphabet suivant son code décimal :
                // On retire 64 pour convertir à la position de l'alphabet 
                // On enlève 1 car la 1ère lettre est à la position 0 
                // Donc 64-1=65
                letterClick((correctLetters[i].charCodeAt(0)-65));
            }
        }
        isCorrect=false;
        for(let i=0; i<incorrectLetters.length;i++){
            // Permet de récupérer la position de la lettre dans l'alphabet suivant son code décimal :
            // On retire 64 pour convertir à la position de l'alphabet 
            // On enlève 1 car la 1ère lettre est à la position 0 
            // Donc 64-1=65
            letterClick(incorrectLetters[i].charCodeAt(0) - 65);
            
        }


    } catch (erreur) {
        document.getElementById("aucune_partie_trouvee").style.display = "block";
    }
    loading.style.display = "none";
}