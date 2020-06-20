# cultureexchange-server

### Instructions to run chat server locally

#### Install dependencies and build

After pulling the project from github, open a terminal window and run the following:

`$ cd cultureexchange-server`\
`$ npm install -g gulp-cli`\
`$ npm install`\
`$ gulp build`

#### Run chat server

To start, run the following command:

`$ cd cultureexchange-server`\
`$ npm start`

The socket.io server will be running on port 8080.

This needs to be run in conjuction with the client app.

#### Accessing chat app

1.  Navigate to http://localhost:4200/chatlogin
2.  Enter name, select language and country and submit.
3.  Open the console in the browser and look for `roomUsers > loginurl`
4.  Copy and paste the url in a separate window and login.

#### Configuration

To receive notification with chat loginurl, open `src/serverConfig.ts`.

1. Update `sendEmail:true`.
2. Update `emailTo` with your email address (gmail only).
3. Do not update anything else unless you understand what you are doing.
