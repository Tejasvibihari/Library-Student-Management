import nodemailer from 'nodemailer'

export const sendMail = async ({ to, subject, body }) => {
    try {


        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
                user: "manojbihari35@gmail.com",
                pass: "mbygodqftmlxenyl",
            },
        });

        const emailFormat = {
            from: 'tejasvibihari2000@gmail.com', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: body, // html body
        }

        const info = await transporter.sendMail(emailFormat)
        console.log(info)

    } catch (error) {
        console.log(error)
    }
}