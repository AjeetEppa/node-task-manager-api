const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: "ajeeteppakayala@gmail.com",
    subject: "Thanks for joining!",
    text: `Hi ${name}, Welcome to our app.`
  }
  sgMail.send(msg)
}

const sendCancelationEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'ajeeteppakayala@gmail.com',
    subject: 'Cancelation Email',
    text: `Hi ${name}, Your account has been canceled.What else we could have done to have kept you on board?`
  }
  sgMail.send(msg)
}

module.exports = { sendWelcomeEmail, sendCancelationEmail }
