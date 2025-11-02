import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection - USE YOUR ACTUAL CONNECTION STRING HERE!
const MONGODB_URI = 'mongodb+srv://veggie-admin:Vegetable123@cluster0.vkaymvt.mongodb.net/veggie_survey?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Survey Response Schema
const surveyResponseSchema = new mongoose.Schema({
  // Page 1 - Demographics
  ageGroup: { type: String, required: true },
  membersinfamily: { type: String, required: true },
  income: { type: String, required: true },
  favoriteVeggie: [{ type: String, required: true }],
  
  // Page 2 - Shopping Habits
  buyingLocation: { type: String, required: true },
  purchaseFrequency: { type: String, required: true },
  spendingAmount: { type: String, required: true },
  
  // Page 3 - Core Problem Validation
  priceEffect: { type: String, required: true },
  priceResponse: [{ type: String }],
  budgetDifficulty: { type: String, required: true },
  purchaseAdjustment: { type: String, required: true },
  
  // Page 4 - Solution Interest & Usage
  priceForecastUseful: { type: String, required: true },
  budgetRecommendation: { type: String, required: true },
  recipeSuggestions: { type: String, required: true },
  smartphoneOwnership: { type: String, required: true },
  appComfort: { type: String, required: true },
  decisionFactors: [{ type: String }],
  forecastUseful: { type: String, required: true },
  motivationFactors: [{ type: String }],
  appLikely: { type: String, required: true },
  prototypeInterest: { type: String, required: true },
  feedback: { type: String },
  
  // Metadata
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
});

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🌱 The Great Veggie Survey API is running!',
    version: '1.0.0',
    endpoints: {
      submit: 'POST /api/submit',
      responses: 'GET /api/responses',
      stats: 'GET /api/stats'
    }
  });
});

// Submit survey response
app.post('/api/submit', async (req, res) => {
  try {
    const surveyData = req.body;
    
    // Add metadata
    surveyData.ipAddress = req.ip || req.connection.remoteAddress;
    surveyData.userAgent = req.get('User-Agent');
    
    const newResponse = new SurveyResponse(surveyData);
    await newResponse.save();
    
    console.log('✅ New survey response saved:', newResponse._id);
    
    res.status(201).json({
      success: true,
      message: 'Survey response saved successfully!',
      responseId: newResponse._id
    });
    
  } catch (error) {
    console.error('❌ Error saving survey response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save survey response',
      error: error.message
    });
  }
});

// Get all responses (for admin purposes)
app.get('/api/responses', async (req, res) => {
  try {
    const responses = await SurveyResponse.find().sort({ timestamp: -1 });
    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    console.error('❌ Error fetching responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch responses',
      error: error.message
    });
  }
});

// Get survey statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalResponses = await SurveyResponse.countDocuments();
    
    // Get favorite vegetables count
    const veggieStats = await SurveyResponse.aggregate([
      { $unwind: '$favoriteVeggie' },
      { $group: { _id: '$favoriteVeggie', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get age group distribution
    const ageStats = await SurveyResponse.aggregate([
      { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalResponses,
        vegetablePreferences: veggieStats,
        ageDistribution: ageStats,
        lastSubmission: await SurveyResponse.findOne().sort({ timestamp: -1 }).select('timestamp')
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : error.stack
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌱 The Great Veggie Survey API is ready!`);
});