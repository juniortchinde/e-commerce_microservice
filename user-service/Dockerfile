FROM node:20-bookworm

# Changer le répertoire de travail
WORKDIR /app

COPY package.json ./

# Installer les dépendances du projet
RUN npm install
# copie de code source
COPY ./ ./




# Exposer le port de l'application
EXPOSE 4001

# Démarrer l'application avec la commande npm run start
CMD ["node", "server"]
