const winston = require('winston');
winston.add(winston.transports.File, { filename: 'backup.log' });
winston.remove(winston.transports.Console);

const { exec } = require('child_process');
const path = require('path');
const nodemailer = require('nodemailer');

const backupDB = (db, basePath, cb) => {
    winston.log('info', 'dumping db ...');
    let currentDate = new Date().toGMTString();
    let fileName = currentDate.replace(/[, .*+?^${}()|[\]\\]/g, '')// + '.gzip'
    let filePath = path.join(basePath, fileName);

    exec('mongodump --db ' + db + ' --gzip --archive=' + filePath, function (err, stdout, stderr) {
        return cb(null, fileName);
    });
}
const emailSender = (data, cb) => {
    winston.log('info', 'sending email ...');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: data.email,
            pass: data.password
        }
    });

    let attachments = [];

    let filePath = path.join(data.path, data.fileName);
    attachments[attachments.length] = { path: filePath };

    let mailOptions = {
        from: data.email,
        to: data.email, // list of receivers
        subject: data.subject, // Subject line
        html: '',
        attachments: attachments
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            winston.log('warn', error);
            return cb(error);
        }
        return cb(null, info);
    });
}
module.exports = {
    backup: (db, basePath, email, password, project) => {
        winston.log('info', 'sending email ...');
        backupDB(db, basePath, function (err, fileName) {
            emailSender({
                email: email,
                password: password,
                path: basePath,
                fileName: fileName,
                subject: project + ' ' + fileName
            }, function (err, info) { })
        })
    }
}