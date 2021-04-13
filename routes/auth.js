const express = require('express');
const router = express.Router();
const connection = require('../config/db.config');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const flash = require('express-flash');
const bcrypt = require('bcrypt');
const userMiddleware = require('../middleware/user.js');

router.use((req, res, next) => {
  res.locals.message = req.session.message
  delete req.session.message
  next()
});

router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
  connection.query(
    `SELECT * FROM users WHERE LOWER(user) = LOWER(${connection.escape(
      req.body.user
    )});`,
    (err, result) => {
      if (result.length) {

        res.render('users/create')
        req.session.message = "Tên đăng nhập đã tồn tại";
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send(
              "Lỗi server"
            );
          } else {
            connection.query(`SET  @num := 0;UPDATE users SET id = @num := (@num+1);ALTER TABLE users AUTO_INCREMENT =1;INSERT INTO users (name,email,user,password) VALUES (${connection.escape(req.body.name)},${connection.escape(req.body.email)},${connection.escape(req.body.user)},${connection.escape(hash)})`, (err, result) => {
              if (err) {
                throw err;
                return res.status(400).send({ msg: err });
              }
              // return res.status(201).send({
              //   msg: 'Registered!'
              // });
              req.session.message = "Tạo thành công"
              res.redirect('/');
            });
          }
        });
      }
    }
  );
});


router.post('/sign-in', (req, res, next) => {
  connection.query(`SELECT * FROM users WHERE user = ${connection.escape(req.body.user)};`, (err, result) => {
    if (err) {
      throw err;
      return res.status(400).send({ msg: err });
    }
    if (!result.length) {
      // return res.status(401).send({ msg: "Tên đăng nhập hoặc mật khẩu không đúng" });
      req.session.message = "Tên đăng nhập hoặc mật khẩu không đúng"
      res.redirect('/api/sign-in');
    }
    bcrypt.compare(req.body.password, result[0]['password'], (bErr, bResult) => {
      console.log(req.body.password + ", " + result[0]['password'])
      if (bErr) {
        throw bErr;
        req.session.message = "Tên đăng nhập hoặc mật khẩu không đúng"
        res.redirect('/api/sign-in');
      }
      if (bResult) {
        const token = jwt.sign({
          userName: result[0].user,
          userId: result[0].id
        }, 'SECRETKEY',
          { expiresIn: "120s" }, (err, token) => {
            // return res.status(200).send({
            //   msg: "Authentication successfully!",
            //   token: token
            //   // user: result[0]
            // });
            req.session.loggedin = true;
            req.session.name = result[0]['name']
            req.session.token = token
            res.redirect('/auth/home');
          });

      } else {
        return res.status(401).send({
          msg: "Tài khoản hoặc mật khẩu không đúng!"
        });
      }
    })
  })
});
router.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  connection.query(`SELECT * FROM users WHERE id = ${connection.escape(req.userId)}`, (err, user) => {
    if (err) throw err;
    if (!user) return res.status(401).send("Not found User");
    res.status(200).send(user);
  })
});

router.post('/search', (req, res, next) => {
  var str = { stringPart: req.body.searchName };
  let sql = 'SELECT * FROM users WHERE name LIKE "%' + str.stringPart + '%" OR email LIKE "%' + str.stringPart + '%"';
  connection.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.render('index', { itemUser: result });
  })
})


// router.get('/', (req, res) => {
//   res.render('auth/login', {
//     title: "Đăng nhập"
//   });
// });
// router.get('/login', (req, res) => {
//   res.render('auth/login', {
//     title: "Đăng nhập"
//   });
// });
// router.post('/authentication', (req, res) => {
//   var username = req.body.username;
//   var password = req.body.password;
//   if (username && password) {
//     connection.query('SELECT *  FROM users WHERE user = ?', [username], async function (error, results, fields) {
//       let validPass = await bcrypt.compareSync(password, results[0].password);
//       if (validPass) {
//         res.status(200);
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

router.get('/home',function (req, res, next) {

  if (req.session.loggedin && req.session.token) {
    req.session.message = "Login success";
    res.render('auth/home', {
      title: "Dashboard",
      fullName: req.session.name,
      token: req.session.token
    });

  } else {

    req.session.message = "Please login";
    res.redirect('/api/sign-in');
  }
});
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/api/sign-in');
});

module.exports = router;