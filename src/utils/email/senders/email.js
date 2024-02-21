// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const nodemailer = require('nodemailer');
const fs = require('fs');
//Load the library and specify options
const replace = require('replace-in-file');
const compressing = require('compressing');

exports.sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: `${process.env.EMAIL_SENDER} <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

exports.sendEmailWithAttachments = async options => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const maillist = [options.email];

    // 2) Define the email options
    const mailOptions = {
      from: `${process.env.EMAIL_SENDER} <${process.env.EMAIL_USERNAME}>`,
      to: maillist,
      subject: options.subject,
      html: options.message,
      attachments: [
        {
          path: options.path
        }
      ]
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado, eliminando plantilla temporal', new Date());
    fs.unlink(options.path, function(err) {
      if (err) throw err;
    });

    if (options.pathOriginal) {
      fs.unlink(options.pathOriginal, function(err) {
        if (err) throw err;
      });
    }
  } catch (error) {
    throw error;
  }
};
