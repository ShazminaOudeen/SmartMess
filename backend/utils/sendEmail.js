const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If SMTP_HOST is not provided, mock the email send for local development.
    if (!process.env.SMTP_HOST) {
        console.log('\n================== MOCK EMAIL ==================');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`\nMessage:\n${options.message}`);
        console.log('================================================\n');
        return; // Early return prevents Nodemailer from throwing Auth errors.
    }

    // Create a transporter using environment config
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || 'SmartMess Admin'} <${process.env.FROM_EMAIL || 'noreply@smartmess.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
