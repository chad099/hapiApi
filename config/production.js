module.exports = {
    api: {
        host: '0.0.0.0',
        port: 8080,
        url: "away-nation-api.herokuapp.com"
    },
  secret: 'SDF@#$%#$VTJ%#4vf3bbb456ysdfsd674@$@jugbrtdsdf43',
    mongoDb: {
        url: 'mongodb://heroku_v5j0xvv9:rv0lao570sceff1ul9re6d0kcc@ds147167.mlab.com:47167/heroku_v5j0xvv9',
        host: "localhost",
        port: 47167,
        database: "away-nation-api",
        username: "",
        password: "",
        settings: { }
    },
  elastic:{
    peopleModel:'User',
    countryModel:'Country',
    itinenaryModel:'Itinerary',
    feedModel:'Feed',
    tripModel: 'Trip',
    globalType:'global',
    index: 'awaynation'
  },
    appSecret: "!@fGFTY#^(&FGHDYT%$$54D576GHFANITESHNYFDSSFORAJEEVKJDHJGR",
    maxPayloadSize: 41943040,

    mailer: {
      noReplyEmail : "noreply@awaynation.com",
    },
    facebook: {
      provider      : "facebook",
      password      : "&GGHK@$EGsed&*565^*&sdfsdfsdfsdsgfgghfghfghHJHJjgjkkj",
      clientId      : "203018040110783",
      clientSecret  : "35c7f1bba5ad5a87c78e8edaa6c98a3f",
      isSecure      : false
    },
    twitter: {
      provider      : "twitter",
      password      : "&GGHK@$EGsed&*565^*&sdfsdfsdfsdsgfgghfghfghHJHJjgjkkj",
      clientId      : "SxIMWmKb5iUJlhM7wIADFKb6i",
      clientSecret  : "UTe6fOxvoW5hShu8DVqstiYORyoxw65PgXiVq1Tlrelf1oGQD6",
      isSecure      : false
    },
    google: {
      provider      : "google",
      password      : "&GGHK@$EGsed&*565^*&sdfsdfsdfsdsgfgghfghfghHJHJjgjkkj",
      clientId      : "366440796115-lpkd84o6melosv6frbbnqu9vinh939b9",
      clientSecret  : "D0Z8xJpFIk9xZsycuN8UapKv",
      isSecure      : false
    },
    instagram: {
      provider      : "instagram",
      password      : "&GGHK@$EGsed&*565^*&sdfsdfsdfsdsgfgghfghfghHJHJjgjkkj",
      clientId      : "848b4f7dc97543fa9b754a10eee376d0",
      clientSecret  : "51834440606d4054beb61f372d5ab6f3",
      isSecure      : false
    },
};
