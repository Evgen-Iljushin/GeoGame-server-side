const nodemailer = require('nodemailer');

let testAccount;
let transporter;

const InitMailer = async () => {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });
};

const SendResetPasswordMailMail = async function ({receiverAddress, newPassword}) {
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Let\'s Bingo mailer" <letsbingo@gmail.com>',
        to: receiverAddress,
        subject: "Let's Bingo password reset",
        text: `You've requested to reset your password. Your new password is: ${newPassword}`,
        html: `<b>You've requested to reset your password. Your new password is: ${newPassword}</b>`
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

InitMailer();

exports = module.exports = {
    SendResetPasswordMailMail
};
