const hbs = require('hbs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

var corsOptions = {
  origin: "http://localhost:4001",
  optionsSuccessStatus: 200
};
const bcrypt = require('bcrypt');

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


const cookieParser = require('cookie-parser');
const logger = require('morgan');

var expressValidator = require('express-validator');
var flash = require('express-flash');
var session = require('express-session');




var connection = require('./config/db.config');

var authRouter = require('./routes/auth');

// const hostname = "localhost";
// const port = 4000;

app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:4001"],
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


// add routes
const routers = express.Router();
const router = require('./routes/auth.js');
const { get } = require('./routes/auth');
app.use('/api', router);


//Truy cập mặc định tới trang index
app.get('/', async (req, res) => {
  try {
    let sql = `SELECT * FROM users`;
    await connection.query(sql, (err, users) => {
      if (err) throw err;

      res.render('index', {
        title: "Danh sách người dùng",
        itemUser: users
      });
      // res.json({ message: "Welcome to bezkoder application." })
      // res.send(users)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi server");
  }
});

app.get('/api/sign-up', (req, res) => {
  res.render('users/create', {
    title: "Tạo người dùng mới"
  })
})
router.post('/api/sign-up');

app.get('/api/sign-in', (req, res) => {
  res.render('auth/login');
})

router.get('/api/home')
router.post('/api/sign-in');
router.post('/api/search');
router.get('/api/secret-route');

// Truy cập đến trang sửa thông tin
app.get('/edit-form/:id', async (req, res) => {
  let id = req.params.id;
  let sql = "SELECT * FROM users WHERE id = ? ";
  await connection.query(sql, [id], (err, row) => {
    if (err) throw err;
    res.render('users/edit', {
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
  connection.query(sql, (err) => {
    if (err) throw err;
    console.log(`Sửa thành công người dùng: ${nameInput}`);
    res.redirect('/');
  });
});
app.get('/delete/:id', cors(), (req, res) => {
  let id = req.params.id;
  let sql = "DELETE FROM users WHERE id= ?;SET  @num := 0;UPDATE users SET id = @num := (@num+1);ALTER TABLE users AUTO_INCREMENT =1";
  connection.query(sql, [id], (err, result) => {
    if (err) throw err;
    // console.log("Đã xóa thành công người dùng: " + result[0].name)
    res.redirect('/');

  });
});



// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})