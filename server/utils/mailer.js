import nodemailer from 'nodemailer'

export const sendMail = async ({ to, subject, body }) => {
    try {


        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "tejasvibihari2000@gmail.com",
                pass: "gjnoqyfqnblqhiak", // Ensure you're using an app-specific password
            },
            tls: {
                rejectUnauthorized: false, // This can sometimes help avoid spam filters
            },
        });

        // const emailFormat = {
        //     from: 'biharilibrary@gmail.com', // sender address
        //     text: "Bihari Library",
        //     to: to, // list of receivers
        //     subject: subject, // Subject line
        //     html: body, // html body
        // }
        const emailFormat = {
            from: '"Bihari Library" <tejasvibihari2000@gmail.com>', // Include a clear display name
            to: to,
            subject: subject,
            text: "Bihari Library", // Consider adding a plaintext version of the email
            html: body,
            headers: {
                'X-Priority': '3', // Normal priority
            },
        };
        const info = await transporter.sendMail(emailFormat)
        console.log(info.messageId)

    } catch (error) {
        console.log(error)
    }
}