const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get tasks by search crits
// GET /tasks?completed=true
// GET /tasks?description=test%20test%20test
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) =>{
  const match = {};
  const sort = {};

  if (req.query.completed === 'true') {
    match.completed = req.query.completed === 'true';
  };

  if (req.query.description) {
    match.description = req.query.description;
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    }).execPopulate();
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send();
  }
});

// Get task by id
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({owner: req.user._id, _id: req.params.id});

    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

// Update task
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValid = updates.every((update) => allowedUpdates.includes(update));

  if (!isValid) {
    return res.status(400).send({error: 'Invalid updates'});
  }

  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

    if (!task) {
      res.status(404).send();
    }

    updates.forEach((update) => task[update] = req.body[update]);

    await task.save();

    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});


// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete(
        {_id: req.params.id, owner: req.user._id},
    );

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
