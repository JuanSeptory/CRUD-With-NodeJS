const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const users = require('../models/users');
const fs = require('fs');

// image upload
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
  },
});

let upload = multer({
  storage: storage,
}).single('image');

// GET Home page
router.get('/', (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      res.render('index', { title: 'Home Page', users: users });
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

// GET Add
router.get('/add', (req, res) => {
  res.render('add_users', { title: 'Add Users' });
});

// GET About
router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// GET Contact
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

// Insert an user into database route
router.post('/add', upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user
    .save()
    .then(() => {
      req.session.message = {
        type: 'success',
        message: 'User added successfully !',
      };
      res.redirect('/');
    })
    .catch((err) => {
      res.json({ message: err.message, type: 'danger' });
    });
});

// Edit an user route
router.get('/edit/:id', (req, res) => {
  let id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (user == null) {
        res.redirect('/');
      } else {
        res.render('edit_users', {
          title: 'Edit User',
          user: user,
        });
      }
    })
    .catch((err) => {
      res.redirect('/');
    });
});

// Update user route
router.post('/update/:id', upload, (req, res) => {
  let id = req.params.id;
  let new_image = '';

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync('./uploads' / +req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  User.findByIdAndUpdate(id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: new_image,
  })
    .then((user) => {
      req.session.message = {
        type: 'success',
        message: 'User updated successfully',
      };
      res.redirect('/');
    })
    .catch((err) => {
      res.json({ message: err.message, type: 'danger' });
    });
});

// Delete user route
router.get('/delete/:id', (req, res) => {
  let id = req.params.id;

  User.findByIdAndRemove(id)
    .then((user) => {
      if (user.image != '') {
        try {
          fs.unlinkSync('./uploads/' + user.image);
          console.log('gambar berhasil dihapus');
        } catch (err) {
          console.log(err);
        }
        req.session.message = {
          type: 'info',
          message: 'User deleted successfully',
        };
        res.redirect('/');
      }
    })
    .catch((err) => {
      if (err) {
        res.json({ message: err.message });
      }
    });
});

module.exports = router;
