const mongoose = require('mongoose');

mongoose.connect(process.env.DB_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
