"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http = __importStar(require("http"));
const message_1 = require("./model/message");
const email_util_1 = require("./email-util");
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
class ChatServer {
    constructor() {
        this.users = [];
        this.adminUser = { name: 'admin', type: 'admin' };
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }
    createApp() {
        this.app = express_1.default();
        this.app.use(cors_1.default());
        this.app.use((req, res) => res.sendFile(INDEX, { root: __dirname }));
    }
    createServer() {
        this.server = http.createServer(this.app);
    }
    config() {
        this.port = process.env.PORT || PORT;
    }
    sockets() {
        this.io = require('socket.io').listen(this.server, { origins: '*:*' });
        // Initialize our websocket server on port 3000
        this.server.listen(this.port, () => {
            console.log(`Running server on port ${this.port}`);
        });
    }
    // listen for events from client
    listen() {
        setInterval(() => this.io.emit('time', new Date().toTimeString()), 1000);
        this.io.on('connect', (socket) => {
            console.log(`\nConnected client on port ${this.port}`);
            socket.on('joinRoom', (user) => {
                this.joinRoom(socket, user);
                this.sendRoomUsers();
            });
            socket.on('message', (msg) => {
                this.io.emit("message", this.formatMessage(msg, socket.id));
            });
            socket.on('disconnect', () => {
                // remove user from array
                let leavingUser = this.getCurrentUser(socket.id, true);
                if (leavingUser) {
                    this.io.to(leavingUser.room).emit('message', this.formatMessage(`${leavingUser.name} has left the chat`));
                    console.log("Client disconnected\n");
                }
                this.sendRoomUsers();
            });
        });
    }
    // Send users and room info
    sendRoomUsers() {
        this.io.emit('roomUsers', { users: this.users });
    }
    // Users need to be in the same room in order to talk to each other
    joinRoom(socket, newUser) {
        console.log('\nnewUser', newUser);
        newUser.id = socket.id;
        if (newUser.room != undefined) {
            // join the same room as visitor
            socket.join(newUser.room);
            this.io.to(newUser.room).emit('message', this.formatMessage(`${newUser.name} has connected!`));
        }
        else {
            // Generate room token 
            var roomToken = `${newUser.country}-${Date.now().toString()}`;
            socket.join(roomToken);
            newUser.room = roomToken;
            // Send notification to admin with link to chat (includes room token)
            email_util_1.EmailUtil.sendEmail(newUser.country, roomToken);
            // Welcome user, say waiting for someone to connect
            this.io.to(roomToken).emit('message', this.formatMessage(`Hi ${newUser.name}.  Waiting for a guide to connect.`));
        }
        // Add user to users
        this.users.push(newUser);
        console.log("\nNum of users: ", this.users.length);
    }
    // Send message back to client with User info and timestamp
    formatMessage(msg, id) {
        let date = new Date();
        // if no id, then user is admin
        var currentUser = id != undefined ? this.getCurrentUser(id) : this.adminUser;
        return new message_1.Message(currentUser, date.toLocaleTimeString(), msg);
    }
    // Get the user who sent the message or is leaving
    getCurrentUser(id, removeUser = false) {
        if (removeUser)
            return this.users.splice(this.users.findIndex(user => user.id === id), 1)[0];
        else
            return this.users.find(user => user.id === id);
    }
    getApp() {
        return this.app;
    }
}
exports.ChatServer = ChatServer;
