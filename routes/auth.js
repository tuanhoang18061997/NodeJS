var express = require('express');
var router = express();
var connection = require('../config/db.config');
var flash = require('express-flash');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  res.render('auth/login', {
    title: "Đăng nhập"
  });
});
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: "Đăng nhập"
  });
});
router.post('/authentication', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    connection.query('SELECT *  FROM users WHERE user = ?', [username], async function (error, results, fields) {
      let validPass = await bcrypt.compareSync(password,results[0].password);
      if (validPass) {
        res.status(200);
        req.session.loggedin = true;
        req.session.name = results[0].name;
        res.redirect('/auth/home');
      } else {
        req.session.message = "Sai thông tin đăng nhập";
        res.redirect('/auth')
      }
      res.end();
    });
  } else {
    req.session.message = "Không được để trống username và password";
    res.redirect('/auth')
    res.end();
  }
})








// router.post('/authentication', (req, res) => {
//   var username = req.body.username;
//   var password = req.body.password;
//   if (username && password) {
//     connection.query('SELECT *  FROM users WHERE user = ? AND password = ?', [username, password], function (error, results, fields) {
//       if (results.length > 0) {
//         req.session.loggedin = true;
//         req.session.name = results[0].name;
//         res.redirect('/auth/home');
//       } else {
//         req.session.message = "Sai thông tin đăng nhập";
//         res.redirect('/auth')
//       }
//       res.end();
//     });
//   } else {
//     req.session.message = "Không được để trống username và password";
//     res.redirect('/auth')
//     res.end();
//   }
// })

router.get('/home', function (req, res, next) {
  if (req.session.loggedin) {
    req.session.message = "Login success";
    res.render('auth/home', {
      title: "Dashboard",
      fullName: req.session.name,
    });

  } else {

    req.session.message = "Please login";
    res.redirect('/auth');
  }
});
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/auth');
});

module.exports = router;