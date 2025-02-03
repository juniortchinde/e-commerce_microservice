const multer = require("multer");
const {fromBuffer} = require("file-type");
const fs = require("fs");

const path = require("node:path");
const getFileHash = require("../utils/hashFile");


// les mine types autorisé sur notre app
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'image/avif': 'avif',
};

// on stocke le fichier uploadé dans la memoire vive avec multer
const storage = multer.memoryStorage()

const validateAndSave = async  (req, res, next) =>{
    try {

        // si aucun fichier n'a été envoyé on renvoie un message d'erreur
        if (!req.files[0]) {
            return res.status(400).json({ error: true, message: "Aucun fichier n'a été téléchargé." });
        }

        const imageUrls = []

        for (const file of req.files) {
            // on trouve me mine type rèel du fichier avec la fonction from buffer de file-type
            const fileType = await fromBuffer(file.buffer);
            const extension = MIME_TYPES[fileType?.mime];
            // si  son mine type réel n'est pas autorisé on renvoie un message d'erreur
            if (!fileType || !extension) {
                return res.status(400).json({ error: true, message: `Type de fichier non autorisé : ${file.originalname}` });
            }
            // on créer un  nouveau nom du fichier en nettoyant son ancien nom et en y ajoutant la date d'enregistrement et son extention
            const filename = `${file.originalname.split(" ").join('_')}${Date.now()}.${extension}`;

            // on l'enregistre dans le dossire public/images de notre serveur
            const filePath = path.resolve(__dirname, `../public/images/${filename}`);
            fs.writeFileSync(filePath,file.buffer)

            // on trouve son hash unique pour ne pas l'uploader plusier fois si modification ulterieur
            const hash = await getFileHash(filePath);
            // on recupère le lien vers le fichier et son hash unique
            const imageUrl= `${req.protocol}://${req.get('host')}/public/images/${filename}`
            // on l'ajoute à la liste des images

            imageUrls.push(
                {
                    imageUrl,
                    hash
                }

            )
        }
        // et on ajoute cette liste aux champs de la requête
        req.imageUrls = imageUrls;
        next()
    }catch (error) {
        console.error("Erreur lors de l'upload des fichiers :", error);
        res.status(500).json({ error: true, message: "Erreur interne lors de l'upload des fichiers." });
    }
}

upload = multer({storage : storage}).array('images')

module.exports = {upload, validateAndSave}