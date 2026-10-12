# PizzaHub - Level 3 MERN Internship Project

## Run
1. Start MongoDB.
2. In `backend`, copy `.env.example` to `.env` and fill MongoDB, JWT, email and Razorpay test credentials.
3. `cd backend && npm install && npm run dev`
4. `cd fontend && npm install && npm run dev`
5. Open http://localhost:5173

The backend automatically seeds inventory and creates an admin account from `ADMIN_EMAIL` + `ADMIN_PASSWORD` on first run.

## Test flow
- Register a user.
- Verify email using the link sent by Gmail SMTP.
- Login.
- Build pizza.
- Use Razorpay test credentials and test payment details.
- Check order tracking.
- Login separately at `/admin/login` using the admin credentials from `.env`.
- Update inventory and order status.

Never commit `.env` or real credentials.
