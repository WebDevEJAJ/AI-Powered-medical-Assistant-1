import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'structured_response'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    structuredResponse: {
      conditionOverview: String,
      researchInsights: String,
      clinicalTrialsInfo: String,
      personalizedInsight: String,
      sources: [
        {
          id: String,
          title: String,
          authors: [String],
          year: Number,
          platform: {
            type: String,
            enum: ['PubMed', 'OpenAlex', 'ClinicalTrials', 'other'],
          },
          url: String,
          snippet: String,
          relevanceScore: Number,
          citations: Number,
        },
      ],
    },
    metadata: {
      processingTime: Number,
      sourceCount: Number,
      expandedQuery: String,
      queryContext: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
