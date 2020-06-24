import express from "express";
import cors from "cors";
import * as http from "http";
import { User } from "./model/user";
import { Message } from "./model/message";
import { EmailUtil } from './email-util';
import { ServerConfig } from './serverConfig';

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';


export class ChatServer {
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private port: string | number;

    private users: User[] = [];
    private adminUser: User = { name: 'admin', type: 'admin' };

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
        this.app.use(cors());
        this.app.use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    }

    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || PORT;
    }

    private sockets(): void {
        this.io = require('socket.io').listen(this.server, { origins: '*:*' });
        // Initialize our websocket server on port 3000
        this.server.listen(this.port, () => {
            console.log(`Running server on port ${this.port}`);
        });
    }

    // listen for events from client
    private listen(): void {
        setInterval(() => this.io.emit('time', new Date().toTimeString()), 1000);
        this.io.on('connect', (socket: any) => {
            console.log(`\nConnected client on port ${this.port}`);


            socket.on('joinRoom', (user:User) => {
                this.joinRoom(socket, user);
                this.sendRoomUsers();
            });


            socket.on('message', (msg: string) => {
                this.io.emit("message", this.formatMessage(msg, socket.id));
            });


            socket.on('disconnect', () => {
                // remove user from array
                let leavingUser: User | undefined = this.getCurrentUser(socket.id, true);

                if (leavingUser) {
                    this.io.to(leavingUser.room!).emit('message', this.formatMessage(`${leavingUser.name!} has left the chat`));
                    console.log("Client disconnected\n");
                }
                this.sendRoomUsers();
            });
        });
    }


    // Send users and room info
    private sendRoomUsers(): void {
        this.io.emit('roomUsers', { users: this.users });
    }


    // Users need to be in the same room in order to talk to each other
    private joinRoom(socket: any, newUser:User): void {
        console.log('\nnewUser', newUser);
        newUser.id = socket.id;

        if (newUser.room != undefined) {
            // join the same room as visitor
            socket.join(newUser.room);

            this.io.to(newUser.room).emit('message', this.formatMessage(`${newUser.name} has connected!`));
        }
        else {
            // Generate room token 
            var roomToken: string = `${newUser.country!}-${Date.now().toString()}`;
            socket.join(roomToken);
            newUser.room = roomToken;

            // Send notification to admin with link to chat (includes room token)
            EmailUtil.sendEmail(newUser.country!, roomToken);

            // Welcome user, say waiting for someone to connect
            this.io.to(roomToken).emit('message', this.formatMessage(`Hi ${newUser.name!}.  Waiting for a guide to connect.`));
        }

        // Add user to users
        this.users.push(newUser);
        console.log("\nNum of users: ", this.users.length); 
    }


    // Send message back to client with User info and timestamp
    private formatMessage(msg: string, id?: string): Message {
        let date: Date = new Date();

        // if no id, then user is admin
        var currentUser = id != undefined ? this.getCurrentUser(id!) : this.adminUser;

        return new Message(currentUser, date.toLocaleTimeString(), msg)
    }


    // Get the user who sent the message or is leaving
    private getCurrentUser(id: string, removeUser: boolean = false): User | undefined {
        if (removeUser)
            return this.users.splice(this.users.findIndex(user => user.id === id), 1)[0];
        else
            return this.users.find(user => user.id === id);
    }


    public getApp(): express.Application {
        return this.app;
    }
}


