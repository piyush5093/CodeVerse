const nodemailer = require("nodemailer");
const axios = require("axios");

const mailSender = async (email, title, body) => {
    const mailPass = process.env.MAIL_PASS || "";
    const mailUser = process.env.MAIL_USER || "";

    // 1. If it's a Brevo API Key (starts with xkeysib-), send via HTTPS REST API (Port 443)
    // This bypasses Render's free tier outbound SMTP port blocks completely.
    if (mailPass.startsWith("xkeysib-")) {
        console.log(`Sending email to ${email} via Brevo HTTP API (Port 443)...`);
        try {
            const response = await axios.post(
                "https://api.brevo.com/v3/smtp/email",
                {
                    sender: { name: "Codeverse", email: mailUser },
                    to: [{ email: email }],
                    subject: title,
                    htmlContent: body,
                },
                {
                    headers: {
                        "api-key": mailPass,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Email sent successfully via Brevo HTTP API.");
            return response.data;
        } catch (error) {
            const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            console.log("Brevo HTTP API sending failed. Error: ", errMsg);
            throw new Error(errMsg);
        }
    }

    // 2. Default SMTP Fallback (for local development with Gmail/SMTP)
    try {
        console.log(`Attempting to send email to ${email} using SMTP port 465 (SSL)...`);
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: mailUser,
                pass: mailPass,
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000,
        });

        let info = await transporter.sendMail({
            from: `"Codeverse" <${mailUser}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        console.log("Email sent successfully on port 465.");
        return info;
    } catch (err465) {
        console.log(`Port 465 failed (Error: ${err465.message}). Trying fallback Port 587 (TLS)...`);
        try {
            let transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: 587,
                secure: false,
                auth: {
                    user: mailUser,
                    pass: mailPass,
                },
                connectionTimeout: 8000,
                greetingTimeout: 8000,
                socketTimeout: 8000,
            });

            let info = await transporter.sendMail({
                from: `"Codeverse" <${mailUser}>`,
                to: `${email}`,
                subject: `${title}`,
                html: `${body}`,
            });
            console.log("Email sent successfully on port 587.");
            return info;
        } catch (err587) {
            console.log(`Both SMTP ports 465 and 587 failed to send email. Final Error: ${err587.message}`);
            throw err587;
        }
    }
}

module.exports = mailSender;