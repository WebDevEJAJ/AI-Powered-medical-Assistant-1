import mongoose from 'mongoose';

const researchResultSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
      index: true,
    },
    sourceId: String,
    platform: {
      type: String,
      enum: ['PubMed', 'OpenAlex', 'ClinicalTrials'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    authors: [String],
    year: Number,
    url: String,
    doi: String,
    abstract: String,
    snippet: String,
    keywords: [String],
    relevanceScore: Number,
    rankings: {
      keywordRelevance: Number,
      diseaseMatch: Number,
      recency: Number,
      credibility: Number,
      locationMatch: Number,
    },
    metadata: {
      citations: Number,
      views: Number,
      journalName: String,
      status: String, // for clinical trials
      eligibilityCriteria: String, // for clinical trials
      location: String, // for clinical trials
    },
  },
  {
    timestamps: true,
  }
);

const ResearchResult = mongoose.model('ResearchResult', researchResultSchema);

export default ResearchResult;
