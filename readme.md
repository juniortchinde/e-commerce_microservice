                                Pour Lancer le projet : 

effectuer un git clone sur le lien du projet 


******************* Le backend ***************************
- faire un cd /my-express-app
- créer un fichier .env à la racine
- remplir les variables d'environnement

    MONGO_URL (lien de connexion à la base de donnée mongoDB)
    PORT (port d'exposition de l'API)
    ACCESS_TOKEN = (jeton d'acces pour l'authentifier )
    REFRESH_TOKEN = (jeton pour rafraichir le jeton d'acces)
    SALT = (nombre salt pour chiffrer le mot de passe avant de l'enregistrer en BDD)

- faire un npm install pour installer les packages decris dans le package.json obligatoire pour faire fonctionner l'API
- taper npm run dev pour lancer l'API


******************* Le frontend  **************************

- faire un cd /my-vue-app

- créer un fichier .env à la racine

- remplir les variables d'environnement
 VITE_BASE_URL= http://localhost:<PORT>/api (PORT: le de l'api configuré en backend)

- faire un npm install pour installer les packages decris dans le package.json obligatoire pour faire fonctionner l'application frontend

- taper npm run dev pour lancer l'application 


******************* La Base de données  **************************
    Une fois la Base de donnée créer et fonctionnelle :
- Créer les collections categories et products et y importer respectivement les fichiers e-commenceDB.categories.csv et e-commenceDB.products.csv pour 

                    
                    vous pouvez utiliser l'application 

