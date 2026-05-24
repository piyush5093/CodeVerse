const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    // Try Port 465 (SSL) first
    try {
        console.log(`Attempting to send email to ${email} using port 465 (SSL)...`);
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            connectionTimeout: 8000, // 8 seconds timeout
            greetingTimeout: 8000,
            socketTimeout: 8000,
        });

        let info = await transporter.sendMail({
            from: `"Codeverse" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        console.log("Email sent successfully on port 465.");
        return info;
    } catch (err465) {
        console.log(`Port 465 failed (Error: ${err465.message}). Trying fallback Port 587 (TLS)...`);
        
        // Try Port 587 (TLS) fallback
        try {
            let transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: 587,
                secure: false, // false for 587 TLS
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
                connectionTimeout: 8000,
                greetingTimeout: 8000,
                socketTimeout: 8000,
            });

            let info = await transporter.sendMail({
                from: `"Codeverse" <${process.env.MAIL_USER}>`,
                to: `${email}`,
                subject: `${title}`,
                html: `${body}`,
            });
            console.log("Email sent successfully on port 587.");
            return info;
        } catch (err587) {
            console.log(`Both ports 465 and 587 failed to send email. Final Error: ${err587.message}`);
            throw err587; // Throw to trigger OTP database save console fallback
        }
    }
}

module.exports = mailSender;