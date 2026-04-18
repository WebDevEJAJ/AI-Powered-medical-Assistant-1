import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    medicalHistory: {
      type: String,
      default: '',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark',
      },
      language: {
        type: String,
        default: 'en',
      },
      resultsPerPage: {
        type: Number,
        default: 8,
        min: 5,
        max: 20,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
