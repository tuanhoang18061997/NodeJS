const hbs = require('hbs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

const cookieParser = require('cookie-parser');
const logger = require('morgan');

var expressValidator = require('express-validator');
var flash = require('express-flash');
var session = require('express-session');




var mysql = require('mysql');
var connection = require('./config/db.config');

var authRouter = require('./routes/auth');

// const hostname = "localhost";
// const port = 4000;

app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:4000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(session({
  secret: '123456cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

// Flash message
app.use((req, res, next) => {
  res.locals.message = req.session.message
  delete req.session.message
  next()
});

// để sử dụng biến body


app.set('views', path.join(__dirname, 'views'));
app.use('/auth', authRouter);

//set view engine
app.set('view engine', 'hbs');
//set public folder as static folder for static file
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/css')));
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/pages');


//Truy cập mặc định tới trang index
app.get('/', (req, res) => {
  // let sql = `SELECT * FROM users`;
  // connection.query(sql, (err, users) => {
  //   if (err) throw err;
  //   res.render('\index', {
  //     title: "Danh sách người dùng",
  //     itemUser: users
  //   });
  res.json({ message: "Welcome to bezkoder application." })
});
//Truy cập đến trang create
app.get('/create-form', (req, res) => {
  res.render('\create', {
    title: "Tạo người dùng mới"
  })
})
// post thêm người dùng
app.post('/create', (req, res) => {
  let nameInput = req.body.name;
  let emailInput = req.body.email;

  let data = { name: nameInput, email: emailInput };
  let sql = `INSERT INTO users SET ? `;
  db.query(sql, data, (err) => {
    if (err) throw err;
    console.log(`Tạo mới thành công người dùng: ${nameInput}`);
    res.redirect('/');
  });
});

// Truy cập đến trang sửa thông tin
app.get('/edit-form/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM users WHERE id = "${id}" `;
  db.query(sql, (err, row) => {
    if (err) throw err;
    res.render('\edit', {
      title: 'Sửa thông tin',
      user: row[0]


    })
  })
});

app.post('/edit/:id', (req, res) => {
  let id = req.params.id;
  let nameInput = req.body.name;
  let emailInput = req.body.email;
  let sql = `UPDATE users SET name ="${nameInput}", email="${emailInput}" WHERE id ="${id}"`;
  db.query(sql, (err) => {
    if (err) throw err;
    console.log(`Sửa thành công người dùng: ${nameInput}`);
    res.redirect('/');
  });
});
app.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  let sql = `DELETE FROM users WHERE id=${id}`;
  db.query(sql, (err) => {
    if (err) throw err;
    res.redirect('/');
    console.log(`Đã xóa thành công người dùng: ${req.params.name}`)
  });
});

app.post('/search', function (req, res) {
  var str = { stringPart: req.body.searchName };
  let sql = 'SELECT * FROM users WHERE name LIKE "%' + str.stringPart + '%" OR email LIKE "%' + str.stringPart + '%"';

  db.query(sql, function (err, rows, fields) {
    if (err) throw err;
    // res.redirect('/', { itemUser: rows });
    res.render('\index', { itemUser: rows });
  })
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})