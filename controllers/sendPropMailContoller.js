const nodeMailer = require('nodemailer');
const Mailgen = require('mailgen');

const sendCreatedPropMail = async (req, res) => {
    try {
        const { email, name, text, subject } = req.body;
        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        }
        
        let transporter = nodeMailer.createTransport(config);

        let mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Pindro Realtor',
                link: 'https://mailgen.js/'
            }
        })

        let response = {
            body: {
                name: name,
                intro: `Hello ${name}, ${text}`,
                table: {
                    data: [
                        {
                            email: email,
                            message: text
                        }
                    ]
                }, 
                outro: "Please contact us for any assistance!\n"
            }
        }

        let mail = mailGenerator.generate(response);

        let message = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            html: mail
        }

        await transporter.sendMail(message);

        res.status(202).json({ message: 'An email has been sent to you' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error.message);
    }
}

module.exports = sendCreatedPropMail;