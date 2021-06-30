const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');


const router = new express.Router();

// Create user
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({user, token});
  } catch (err) {
    res.status(400).send(err);
  }
});


// Login user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.
        findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch (err) {
    res.status(400).send();
  }
});

// Upload avatar
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter: function fileFilter(req, file, cb) {
    if (!file.originalname.match(/(.jpeg|.jpg|.png)$/gm)) {
      return cb(new Error('Please upload a PNG, JPG or JPEG', false));
    }
    cb(null, true);
  },
});

router.post('/users/me/avatar', auth, upload.single('avatar'),
    async (req, res) => {
      const avatar = await sharp(req.file.buffer)
          .resize(200, 200)
          .png()
          .toBuffer();

      req.user.avatar = avatar;
      await req.user.save();
      res.send();
    }, (error, req, res, next) => {
      res.status(400).send({error: error.message});
    });

// Delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  if (!req.user.avatar) {
    res.status(400).send({error: 'No avatar to delete'});
  }
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

// Fetch avatar from id
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      return res.status(404).send();
    }
    res.set('Content-Type', 'image/png').send(user.avatar);
  } catch (err) {
    res.status(500).send();
  }
});

// Logout user from current device
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});


// Logout user from all devices
router.post('/users/logout/all', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});


// Get user
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});


// Update user
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValid = updates.every((update) => allowedUpdates.includes(update));

  if (!isValid) {
    return res.status(400).send({error: 'Invalid updates'});
  }

  try {
    updates.forEach((update) => req.user[update] = req.body[update]);

    await req.user.save();

    res.send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});


// Delete user
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();

    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});


module.exports = router;
