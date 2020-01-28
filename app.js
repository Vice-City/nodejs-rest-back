const express = require('express');
const app = express();

const usersRoutes = require('./api/routes/users')
app.use('/search/users', usersRoutes);

module.exports = app;