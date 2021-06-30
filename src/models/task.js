const mongoose = require('mongoose');

// eslint-disable-next-line new-cap
const taskSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
},
{
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema );

module.exports = Task;
