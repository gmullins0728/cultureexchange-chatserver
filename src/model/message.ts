import {User} from './user';

export class Message {
    constructor(
        public from?: User,
        public time?: string,
        public content?: string,
        public translatedcontent?: string
        ) { }
}

