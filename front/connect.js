// Alex MEURILLON


// Récupération des éléments HTML pour le mot de passe 
const validatorText = document.getElementById("validatorText");
const ShowHide = document.getElementById("ShowHide");
const passwordCheck = document.querySelectorAll(".password-check img");



// Récupération des éléments HTML pour les boutons de connexion et d'inscription 
const bouton_connection = document.getElementById("bouton_connection");
const bouton_inscription = document.getElementById("bouton_inscription");

// Récupération de l'élément HTML pour retourner à la page d'accueil
const home = document.querySelector("header img");

// Récupération des éléments HTML pour la connexion et l'inscription 
const connection = document.getElementById("connection");
const inscription = document.getElementById("inscription");

// On définit ces deux varibales pour avec, respectivement, un dictionnaire avec le nom d'utilisateur/mot de passe et l'identifiant de jeu
let donnee = {};
let token = "";


// On affiche dans la console que ce n'est pas un outil pour l'utilisateur. On le prévient.
console.log("%cSTOP !", "background: red; color: yellow; font-size: x-large");
console.log("%cIl s’agit d’une fonctionnalité de navigateur conçue pour les développeurs. Si quelqu’un vous a invité(e) à copier-coller quelque chose ici pour activer une fonctionnalité ou pirater le compte d’un tiers, sachez que c’est une escroquerie permettant à cette personne d’accéder à votre compte Jeu du Pendu.", 
"font-size: x-large");




// Toutes les combinaisons possibles pour le mot de passe (minuscules, majuscules, nombres et caractères spéciaux)
const combinations = [
  // Regex représente une expression régulière pour un critère spécifique et key la clé
  { regex: /.{8}/, key: 0 }, // Nécessite une longueur minimale de 8 caractères
  { regex: /[A-Z]/, key: 1 }, // Nécessite au moins une lettre majuscule
  { regex: /[a-z]/, key: 2 }, // Nécessite au moins une lettre minuscule
  { regex: /[0-9]/, key: 3 }, // Nécessite au moins un chiffre (0-9)
  { regex: /[$@#&%!]+/, key: 4 }, // Nécessite au moins un caractère spécial parmi [$@#&%!]
];


// On observe si l'utilisateur clique sur le logo de maison pour relancer la page et donc se retrouver à la page d'accueil
home.addEventListener("click", ()=> {
  location.reload();
});


// On observe si l'utilisateur clique sur le bouton "Connexion" sur la page d'accueil
bouton_connection.addEventListener("click", ()=> {
  // Fait apparaître les champs d'identifiant et de mot de passe
  document.getElementById("btns").style.display = "block";
  document.getElementById("container_password").classList.toggle("hide");

  // Cache les boutons d'inscription et de connexion 
  document.getElementById("choix").classList.toggle("hide");
  document.getElementById("inscription").classList.toggle("hide");

  // Cache le message d'erreur si le serveur ne marche pas
  document.getElementById("no_serveur").style.display='none';

  // Cache la phrase de départ
  document.getElementById("par").classList.toggle("hide");
});


// On observe si l'utilisateur clique sur le bouton "Inscription" sur la page d'accueil
bouton_inscription.addEventListener("click", ()=> {
  // Fait apparaître les champs d'identifiant et de mot de passe
  document.getElementById("btns").style.display = "block";
  
  // Cache les boutons d'inscription et de connexion 
  document.getElementById("choix").classList.toggle("hide");
  document.getElementById("connection").classList.toggle("hide");
  document.getElementById("password").classList.toggle("hide");
  document.getElementById("mdp").classList.toggle("hide");

  // Cache le message d'erreur si le serveur ne marche pas
  document.getElementById("no_serveur").style.display='none';

  // Cache la phrase de départ
  document.getElementById("par").classList.toggle("hide");
});








// La méthode HTMLElement.focus() place le focus sur l'élément indiqué, s'il peut recevoir le focus
// L'élément qui a le focus sera celui qui recevra par défaut les évènements du clavier et les autres évènements analogues 
validatorText.focus();


// On écoute le bouton "Oeil" pour savoir si on veut voir le mot de passe rentré
ShowHide.addEventListener("click", function (e) {
  validatorText.type = validatorText.type === "text" ? "password" : "text";
  e.target.setAttribute(
    "src",
    e.target.src.includes("hide_eye.png") ? "images/show_eye.png" : "images/hide_eye.png"
  );
});


validatorText.addEventListener("keyup", function (e) {
  combinations.forEach((item) => {
    const IsValid = item.regex.test(e.target.value);
    const checkItem = passwordCheck[item.key];
    // Si on passe le test alors on valide l'item de sécurité sinon on met une croix pour dire qu'il n'est pas valide.
    if (IsValid) {
      checkItem.src = "images/check.jpeg";
      checkItem.parentElement.style.color = "green";
    } else {
      checkItem.src = "images/close.jpeg";
      checkItem.parentElement.style.color = "purple";
    }
  });
});



// Fonction vérifiant le nombre de point de sécurité validé
function checkpassword(password) {
  var strength = 0;
  if (password.match(/[a-z]+/)) {
    strength += 1;
  }
  if (password.match(/[A-Z]+/)) {
    strength += 1;
  }
  if (password.match(/[0-9]+/)) {
    strength += 1;
  }
  if (password.match(/[$@#&%!]+/)) {
    strength += 1;
  }
  if (password.length>=8){
    strength += 1;
  }
  return strength;
}



// On écoute les boutons Connexion et Inscription
connection.addEventListener('click',donneeConnexion);
inscription.addEventListener('click',donneeInscription);


// Fonction redirigeant vers la page du jeu
function redirection_jeu(){
  window.location.assign('index.html');
}


// Fonction asynchrone qui permet de se connecter

async function donneeConnexion(){
    let mdp_correct=true;
    donnee['username']=document.querySelector('#username input').value; // Username récupère le nom d'utilisateur
    donnee['password']=document.querySelector('#password input').value; // Password récupère la valeur du mdp
    // On récupère les données du serveur 
    try {
      const reponse = await fetch("http://localhost:8000/api/login", {
        method: "POST", // Existe de nombreuses autres méthodes
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donnee),
      });
  
      const resultat = await reponse.text();
      console.log("ta donnee vaut : " + JSON.stringify(donnee));
      console.log("LE RESULTAT DANS CONNECT.JS VAUT :" + resultat);

      // Vérification si le mot de passe est correct. 
      if (resultat.includes("incorrect password.")){
        document.getElementById("no_username").style.display = "none";
        document.getElementById("inconnu").style.display = "none";
        document.getElementById("mdp_faux").style.display = "block";
        mdp_correct=false;
      }
      // Si on a une erreur affichée alors on avertit l'utilisateur avec un message d'erreur associé
      if (resultat.includes('unknown user ')){
        document.getElementById("mdp_faux").style.display = "none";
        document.getElementById("no_username").style.display = "none";
        document.getElementById("inconnu").style.display = "block";
        mdp_correct=false;
      }
      if (resultat.includes('Connexion réussie')) mdp_correct=true;

      if ((resultat.includes("") || checkpassword(donnee['password'])<2) && mdp_correct==false){
        document.getElementById("mdp_faux").style.display = "none";
        document.getElementById("inconnu").style.display = "none";
        document.getElementById("no_username").style.display = "block";
        mdp_correct=false;
      }
      if (mdp_correct==true){
        token=resultat;
        localStorage.setItem('token', token);
        window.location.assign('index.html');
      } 
    // Si on a le serveur qui ne fonctionne pas on affiche un message.
    } catch (erreur) {
      document.getElementById("no_serveur").style.display='block';
    }
    
}


// Fonction asynchrone qui permet de s'inscrir

async function donneeInscription(){
  let validation=true;
  // on vérifie si les 5 points de sécurité sont vérifiées avant de faire l'appel au serveur.
  if (checkpassword(document.querySelector('.password-inputs input').value)==5){
    donnee['username']=document.querySelector('#username input').value; // Username récupère le nom d'utilisateur
    donnee['password']=document.querySelector('.password-inputs input').value; // Password récupère la valeur du mdp
    // On récupère les données du serveur 
    try {
      const reponse = await fetch('http://localhost:8000/api/signin', {
        method: "POST", // ou 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donnee),
      });

      const resultat = await reponse.text();
      console.log(resultat);
      // Si on a une erreur affichée alors on avertit l'utilisateur avec un message d'erreur associé
      if (resultat.includes(' already exists.')){
        document.getElementById("utilisateur_deja_cree").style.display = "block";
        document.getElementById("no_username").style.display = "none";
        validation=false;
      }
      if (resultat.includes('Inscription réussie')){
        validation=true;
      } 
      if ((checkpassword(donnee['username'])<2) && validation==false){
        document.getElementById("no_username").style.display = "block";
        document.getElementById("utilisateur_deja_cree").style.display = "none";
        validation=false;
      }
      if (validation==true) {
        // On a réussi à s'inscrir donc on le redirige vers le jeu du pendu avec le bon token en se connectant directement.

        document.getElementById("utilisateur_deja_cree").style.display = "none";
        document.getElementById("btns").style.display = "none";
        document.getElementById("redirection").style.display = "block";
        document.getElementById("par").classList.toggle("hide");
        document.getElementById("no_username").style.display = "none";

        // Connexion à son compte pour l'amener directement sur la page.

        // On récupère les données du serveur 
        try {
          const reponse = await fetch("http://localhost:8000/api/login", {
            method: "POST", // Existe de nombreuses autres méthodes
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(donnee),
          });
      
        const resultat = await reponse.text();

        // Récupération du token
        token=resultat;

        // On le stocke pour l'utiliser dans le jeu du pendu.
        localStorage.setItem('token', token);
        // Redirection vers le jeu du pendu
        setTimeout(redirection_jeu, 6000);
        }

        // Si on a le serveur qui ne fonctionne pas on affiche un message.
         catch (erreur) {
          document.getElementById("no_serveur").style.display='block';
        }
      }
      
    // Si on a le serveur qui ne fonctionne pas on affiche un message.
    } catch (erreur) {
      document.getElementById("no_serveur").style.display='block';
    }
  }
}
