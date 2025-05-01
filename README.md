
Projet E-COMMERCE

    1) Description

Ce projet est une boutique en ligne. Il utilise les technologies utilisés sont, Node.js et vue js.

Prérequis

Avant d'exécuter ce projet, assurez-vous d'avoir installé :

Node.js (si nécessaire)

Installation

Clonez ce dépôt :

git clone https://github.com/votre-utilisateur/votre-projet.git

Accédez au répertoire du projet :

cd e-commerce_microservice

Installez les dépendances avec  "npm install"

      2) Utilisation

Pour exécuter l'application : "npm start"

lancez le serveur avec : "node server.js"

      3) Services

* Authentificaton 
* Gestion des produits 
* Commandes 
* Paiement 
* Livraison

      4) Structure du projet

/e-commerce_microservice 

* │── /controllers
* │── /middlewares 
* │── /controllers
* │── /public/images 
* │── /routes 
* │── /utils 
* │── app.js 
* │── README.md
* │── package.json 
* │── server.js


📌 Installation de RabbitMQ sur Windows
RabbitMQ nécessite Erlang pour fonctionner. Voici les étapes d’installation :

1️⃣ Installer Erlang
Télécharge et installe Erlang depuis le site officiel :
👉 https://www.erlang.org/downloads
Ajoute le chemin d’installation d’Erlang aux variables d’environnement (Path).

2️⃣ Installer RabbitMQ
Télécharge RabbitMQ depuis le site officiel :
👉 https://www.rabbitmq.com/download.html
Installe-le en suivant l’assistant d’installation.

3️⃣ Vérifier l’installation
Ouvre PowerShell en mode admin et exécute :

rabbitmqctl status

Si tout est bien installé, tu verras les informations du serveur RabbitMQ.

si rabbitmq n'est pas reconnu ajouter aux variables d'environment

