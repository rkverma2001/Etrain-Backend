const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
// sgMail.setDataResidency('eu'); 
// uncomment the above line if you are sending mail using a regional EU subuser

const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })