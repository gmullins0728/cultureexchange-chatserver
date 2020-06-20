"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
const serverConfig_1 = require("./serverConfig");
const EMAIL_TO = serverConfig_1.ServerConfig.emailTo;
const EMAIL_FROM = serverConfig_1.ServerConfig.emailFrom;
const EMAIL_FROM_PWD = serverConfig_1.ServerConfig.emailFromPwd;
const EMAIL_SERVICE = serverConfig_1.ServerConfig.emailService;
const SEND_EMAIL = serverConfig_1.ServerConfig.sendEmail;
const APP_CHAT_LOGIN_URL = serverConfig_1.ServerConfig.appChatLoginURL;
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_FROM,
        pass: EMAIL_FROM_PWD
    }
});
class EmailUtil {
    static sendEmail(country, roomToken) {
        var urlWithParams = `${APP_CHAT_LOGIN_URL}?roomToken=${roomToken}`;
        const message = {
            from: EMAIL_FROM,
            to: EMAIL_TO,
            subject: 'Culture Exchange - a visitor wants to chat',
            html: `<p>A visitor wants to know more about <b>${country}</b> and is waiting to chat at <a href="${urlWithParams}">${urlWithParams}</a><p>`
        };
        if (SEND_EMAIL)
            transporter.sendMail(message, function (err, info) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('\nEmail success\n', { response: info.response, envelope: info.envelope });
                }
            });
        console.log('\nchatlogin', urlWithParams);
    }
}
exports.EmailUtil = EmailUtil;
