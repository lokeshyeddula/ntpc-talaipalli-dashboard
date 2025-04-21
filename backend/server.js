const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const productionRoutes = require('./routes/productionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportsRoutes');


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));


app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets'))); 

// Routes
app.use('/production', productionRoutes);
app.use('/api/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reports', reportRoutes);


app.get('/', (req, res) => {
  res.render('login', { title: 'Login' });
});


app.get('/home', (req, res) => {
  res.render('home', { title: 'Home' });
});


app.get('/safety', (req, res) => {
  res.render('safety', { title: 'Safety' });
});



app.get('/dispatch', (req, res) => {
  res.render('dispatch', { title: 'Dispatch' });
});


app.listen(port, async () => {
  try {
    console.log(`Server running on http://localhost:${port}`);
  } catch (error) {
    console.error('Connection failed:', error);
  }
});
