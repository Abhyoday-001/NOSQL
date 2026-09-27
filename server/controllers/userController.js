const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) { next(error); }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;
    let recs = await Recommendation.findOne({ userId: id }).populate('recommended.productId');
    
    if (!recs || recs.recommended.length === 0) {
      const { generateForUser } = require('../services/recommendationEngine');
      await generateForUser(id);
      recs = await Recommendation.findOne({ userId: id }).populate('recommended.productId');
    }
    
    if (!recs) return res.json({ recommended: [] });
    res.json(recs);
  } catch (error) { next(error); }
};