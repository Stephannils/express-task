const mailgun = require('mailgun-js');

const mailer = (data) => {
  const mg = mailgun({
    apiKey: process.env.API_KEY,
    domain: process.env.DOMAIN,
  });

  mg.messages().send(data, (error, body) => {
    if (!error) console.log(body);
  });
};

module.exports = mailer;
