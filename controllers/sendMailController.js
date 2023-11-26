const nodeMailer = require('nodemailer');
const Mailgen = require('mailgen');

const sendMail = async (req, res) => {
    try {
        const { firstname, lastname, email } = req.body;
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
                name: `${firstname} ${lastname}`,
                intro: `Welcome ${lastname}, Your account was created successfully`,
                table: {
                    data: [
                        {
                            email: email,
                            message: ''
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
            subject: 'Welcome To Pindro Realtor',
            html: mail
        }

        await transporter.sendMail(message);

        res.status(202).json({ message: 'A confirmation email has been sent to you' });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error.message);
    }

}

module.exports = sendMail;
