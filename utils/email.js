const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
     constructor(user, url) {
          this.to = user.email;
          this.firstName = user.name.split(' ')[0];
          this.url = url;
          this.from = process.env.EMAIL_FROM;
     }
     newTransport() {
          return nodemailer.createTransport({
               host: process.env.EMAIL_HOST,
               secure: process.env.EMAIL_SECURE,
               service: process.env.EMAIL_SERVICE,
               port: process.env.EMAIL_PORT,
               auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
               },
          });
     }

     async send(template, subject) {
          // 1 Render HTML BASED on a Pug template
          const html = pug.renderFile(
               `${__dirname}/../views/emails/${template}.pug`,
               {
                    firstName: this.firstName,
                    url: this.url,
                    subject,
               },
          );
          //2) Define email option
          const emailOptions = {
               from: 'harshit',
               to: 'gharshit937@gmail.com',
               subject,
               html,
          };
          //  3) Create a transport and send Email
          this.newTransport().sendMail(emailOptions, (err, info) => {
               if (err) {
                    console.log(err);
               } else {
                    consaoel.log(info);
               }
          });
     }
     async sendWelcome() {
          await this.send('welcome', 'Welcome to the Natours Family');
     }
};
