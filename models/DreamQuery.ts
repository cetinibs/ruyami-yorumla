import mongoose from 'mongoose';

const dreamQuerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dreamText: {
    type: String,
    required: true,
    maxlength: 500,
  },
  interpretation: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.DreamQuery || mongoose.model('DreamQuery', dreamQuerySchema);
