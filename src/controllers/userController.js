const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const registerUser = async (req, res) => {
  const { name, email, password, phone, city, country, age } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const exists = await User.findByEmail(email);
  if (exists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email: email.trim().toLowerCase(),
    phone,
    city,
    country,
    age,
    password: hashedPassword
  });

  const token = createToken(newUser);
  return res.status(201).json({ message: 'User registered successfully', user: sanitizeUser(newUser), token });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken(user);
  return res.json({ message: 'Login successful', user: sanitizeUser(user), token });
};

const getUsers = async (req, res) => {
  const users = await User.findAll();
  res.json({ users: users.map(sanitizeUser) });
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(Number(id));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(sanitizeUser(user));
};

const createUser = async (req, res) => {
  const { name, email, password, phone, city, country, age } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const hash = password ? await bcrypt.hash(password, 10) : '';
  const newUser = await User.create({
    name,
    email: email.trim().toLowerCase(),
    phone,
    city,
    country,
    age,
    password: hash
  });

  return res.status(201).json({ message: 'User created successfully', user: sanitizeUser(newUser) });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.email) updates.email = updates.email.trim().toLowerCase();
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
  const updatedUser = await User.update(Number(id), updates);
  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ message: 'User updated successfully', user: sanitizeUser(updatedUser) });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const deletedUser = await User.deleteById(Number(id));
  if (!deletedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ message: 'User deleted successfully', user: sanitizeUser(deletedUser) });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  registerUser,
  loginUser
};
