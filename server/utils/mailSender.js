const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try{
            let transporter = nodemailer.createTransport({
                host:process.env.MAIL_HOST,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth:{
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
                connectionTimeout: 10000, // 10 seconds timeout
                greetingTimeout: 10000,
                socketTimeout: 10000,
            })


            let info = await transporter.sendMail({
                from: 'Codeverse || CodeHelp - by Sahil & Team',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
    }
}


module.exports = mailSender;