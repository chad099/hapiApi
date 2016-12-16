module.exports = {
  env: {
    host: 'localhost',
    PORT: 3001,
    url: "http://localhost:4000"
  },
  mongoDb: {
    url: 'mongodb://localhost:27017/AwayNationDev',
  },
  appSecret: "!@fGFTY#^(&FGHDYT%$$54D576GHFANITESHNYFDSSFORAJEEVKJDHJGR",

  mailer: {
    noReplyEmail : "noreply@awaynation.com",
  },
  // add functionality of login by facbook
  facebook: {
    provider      : "facebook",
    password     : "&GGHK@$EGsed&*565^*&fRAJEEVsdfsdHJHJjgjkkj",
    clientId      : "203018040110783",
    clientSecret  : "35c7f1bba5ad5a87c78e8edaa6c98a3f",
    isSecure      : false
  },
};

