require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const seedData = require('./utils/seedData');
const checkInventoryLevels = require('./utils/cronJobs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods:['GET','POST','PUT'] } });

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (req,res)=>res.json({ok:true, message:'PizzaHub API is running'}));
app.use((req,res,next)=>{ req.io=io; next(); });
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

io.on('connection', socket=>{
  socket.on('joinUserRoom', userId=>{ if(userId) socket.join(`user:${userId}`); });
});

const PORT = process.env.PORT || 5000;
connectDB().then(async()=>{ await seedData(); checkInventoryLevels(); server.listen(PORT,()=>console.log(`Server running at http://localhost:${PORT}`)); }).catch(err=>{ console.error('Startup failed:',err.message); process.exit(1); });
