const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const { router } = require('../app');
const route = express.Router();




route.use(authController.isLoggedIn);
route.get('/',viewController.getOverview);
route.get('/tour/:slug',viewController.getTour);
route.get('/login',viewController.getLoginForm);

  module.exports = route
  