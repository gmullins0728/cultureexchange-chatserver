import * as nodemailer from "nodemailer";
import { ServerConfig } from './serverConfig';

const EMAIL_TO:string = ServerConfig.emailTo;
const EMAIL_FROM: string = ServerConfig.emailFrom;
const EMAIL_FROM_PWD: string = ServerConfig.emailFromPwd;
const EMAIL_SERVICE: string = ServerConfig.emailService;
const SEND_EMAIL: boolean = ServerConfig.sendEmail;

const APP_CHAT_LOGIN_URL: string = ServerConfig.appChatLoginURL;

const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_FROM,
        pass: EMAIL_FROM_PWD
    }
});

export class EmailUtil {
    public static sendEmail(country:string, roomToken:string): void {

        var urlWithParams: string = `${APP_CHAT_LOGIN_URL}?roomToken=${roomToken}`;

        const message = {
            from: EMAIL_FROM, 
            to: EMAIL_TO,         
            subject: 'Culture Exchange - a visitor wants to chat', 
            html: `<p>A visitor wants to know more about <b>${country}</b> and is waiting to chat at <a href="${urlWithParams}">${urlWithParams}</a><p>`
        };

        if (SEND_EMAIL)
            transporter.sendMail(message, function (err: any, info: any) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('\nEmail success\n', { response: info.response, envelope: info.envelope });
                }
            });
        console.log('\nchatlogin', urlWithParams);
    }
}
