const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail } = require('../utils/email');

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must contain at least 6 characters.' });

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ error: 'Email is already registered.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name: name.trim(), email: normalizedEmail,
      password: await bcrypt.hash(password, 10), role: 'user', isVerified: false,
      verificationToken, verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const sent = await sendMail({
      to: user.email,
      subject: 'Verify your PizzaHub account',
      text: `Verify your account: ${verifyUrl}`,
      html: `<p>Welcome to PizzaHub!</p><p><a href="${verifyUrl}">Verify your email</a></p><p>This link expires in 24 hours.</p>`
    });

    res.status(201).json({ message: sent ? 'Registration successful. Check your email to verify your account.' : 'Registration successful. Email service is not configured, so ask the developer to configure SMTP before testing verification.', email: user.email, emailSent: sent });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.query.token, verificationTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Verification link is invalid or expired.' });
    user.isVerified = true; user.verificationToken = undefined; user.verificationTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ error: 'Invalid credentials.' });
    if (user.role === 'user' && !user.isVerified) return res.status(403).json({ error: 'Please verify your email before logging in.' });
    res.json({ token: signToken(user), role: user.role, name: user.name, email: user.email });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim(), role: 'user' });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken; user.resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); await user.save();
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendMail({ to: user.email, subject: 'PizzaHub password reset', text: `Reset your password: ${url}`, html: `<p><a href="${url}">Reset password</a></p><p>This link expires in 30 minutes.</p>` });
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) return res.status(400).json({ error: 'Valid token and password of at least 6 characters are required.' });
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Reset link is invalid or expired.' });
    user.password = await bcrypt.hash(password, 10); user.resetToken = undefined; user.resetTokenExpiry = undefined; await user.save();
    res.json({ message: 'Password reset successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
