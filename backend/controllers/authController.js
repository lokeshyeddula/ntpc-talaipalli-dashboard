const jwt = require('jsonwebtoken');
const { username, password, secretKey } = require('../config/authConfig');


exports.loginUser = (req, res) => {
  const { username: inputUsername, password: inputPassword } = req.body;

  
  if (inputUsername !== username) {
    return res.status(400).json({ message: 'Invalid username' });
  }


  if (inputPassword !== password) {
    return res.status(400).json({ message: 'Invalid password' });
  }

 
  const token = jwt.sign({ username: inputUsername }, secretKey, { expiresIn: '2sec' });

  
  res.status(200).json({ message: 'Login successful', token });
};
