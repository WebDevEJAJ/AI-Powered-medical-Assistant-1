import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Session',
      trim: true,
    },
    context: {
      disease: String,
      keywords: [String],
      intent: {
        type: String,
        enum: ['information', 'treatment', 'diagnosis', 'research', 'other'],
        default: 'information',
      },
      location: String,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    metadata: {
      messageCount: {
        type: Number,
        default: 0,
      },
      lastActivity: Date,
      isArchived: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
