const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports = class Email {
     constructor(user, url) {
          this.to = user.email;
          this.firstName = user.name.split(' ')[0];
          this.url = url;
          this.from = 'Harshit   <hello@harshit.io>';
     }
     newTransport() {
          if (process.env.NODE_ENV === 'production') {
               return 1;
          }
          return nodemailer.createTransport({
               host: process.env.EMAIL_HOST,
               port: process.env.EMAIL_PORT,
               auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
               },

               //  activate in gmail less secure app option
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
               from: this.from,
               to: this.to,
               subject,
               html,
          };
          //  3) Create a transport and send Email
          await this.newTransport().sendMail(emailOptions);
     }
     async sendWelcome() {
          await this.send('welcome', 'Welcome to the Natours Family');
     }
};
