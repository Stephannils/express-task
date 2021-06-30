const express = require('express');
require('./db/mongoose');
const taskRouter = require('./routers/task');
const userRouter = require('./routers/user');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
