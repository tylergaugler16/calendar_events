var ids = {
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
  },
  facebook_production: {
    clientID: process.env.FACEBOOK_APP_ID_PRODUCTION,
    clientSecret: process.env.FACEBOOK_APP_SECRET_PRODUCTION
  }
};

module.exports = ids;
