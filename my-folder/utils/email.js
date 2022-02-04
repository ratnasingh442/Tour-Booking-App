const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1)Create a transporter
  // 2)Define the email options
  // 3)Acually send the email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    logger: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    //Activate less secure app in gmail(INCASE GMAIL AS SERVICE IS USED)
  });

  const mailOptions = {
    from: 'Ratna Singh <user@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
