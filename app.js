const hbs = require('hbs');
const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const sql = require('mysql');

const hostname = "localhost";
const port = 4000;

const db = sql.createConnection({
  host: hostname,
  user: 'root',
  password: '',
  database: 'nodejs'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Mysql Connected...');
});
// để sử dụng biến body
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
//set view engine
app.set('view engine', 'hbs');
//set public folder as static folder for static file
app.use(express.static('public'));


//Truy cập mặc định tới trang index
app.get('/', (req, res) => {
  let sql = `SELECT * FROM users`;
  db.query(sql, (err, users) => {
    if (err) throw err;
    res.render('\index', {
      title: "Danh sách người dùng",
      itemUser: users
    });
  });

  //Truy cập đến trang create
  app.get('/create-form', (req, res) => {
    res.render('\create', {
      title: "Thêm người dùng"
    })
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
app.listen(port, hostname, () => {
  console.log(`Server is running at https://${hostname}:${port}`);
})