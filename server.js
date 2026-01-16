
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Indique au serveur que les fichiers HTML/CSS sont dans le dossier "public"
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('Nouvelle connexion établie');

    // Événement : Un utilisateur rejoint le chat
    socket.on('user joined', (username) => {
        socket.username = username; // On stocke le nom dans la session socket
        // Annoncer à tout le monde (sauf l'expéditeur) l'arrivée du nouveau
        socket.broadcast.emit('system message', `${username} a rejoint la discussion`);
    });

    // Événement : Réception d'un message
    socket.on('chat message', (msgData) => {
        // On renvoie l'objet { user, text, time } à TOUT LE MONDE
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        io.emit('chat message', {
            user: msgData.user,
            text: msgData.text,
            time: time
        });
    });

    // Événement : Déconnexion
    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('system message', `${socket.username} a quitté le chat`);
        }
    });
});

// On définit le port de façon dynamique
const PORT = process.env.PORT || 3000; 

// On écoute sur '0.0.0.0' pour accepter les connexions externes
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur de messagerie lancé sur le port ${PORT}`);
});