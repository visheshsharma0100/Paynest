PayNestPayNest
A full-stack peer-to-peer money transfer app built with Node.js + Express (backend) and React + Vite (frontend).

Features
User signup and signin with JWT authentication and bcrypt password hashing
Each user gets a random starting balance on signup
Transfer funds to any registered user
View last 10 sent/received transactions
Search users by name to send money
Atomic balance updates using MongoDB sessions

Project Structure
PAYNEST/
├── backend/
│   ├── index.js          # Express server and all API routes
│   ├── db.js             # MongoDB models (Users, Accounts, Transactions)
│   ├── middleware.js     # JWT auth middleware
│   └── frontend/         # Static HTML frontend (legacy)
│
├── Frontend-1/           # React + Vite frontend
│   ├── src/
│   │   ├── Dashboard.jsx
│   │   ├── Signup.jsx
│   │   ├── Signin.jsx
│   │   └── Send.jsx
│   └── vite.config.js
│
├── .env
└── package.json

Tech Stack
LayerTechnologyBackendNode.js, ExpressDatabaseMongoDB, MongooseAuthJWT, bcryptValidationZodFrontendReact, Vite

Setup
1. Clone the repo
bashgit clone https://github.com/yourusername/paynest.git
cd paynest
2. Create a .env file in root
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
3. Run backend
bashcd backend
npm install
node index.js
4. Run frontend
bashcd Frontend-1
npm install
npm run dev

API Endpoints
Auth
MethodEndpointDescriptionPOST/user/signupRegister a new userPOST/user/signinLogin, returns JWT token
Account (requires auth)
MethodEndpointDescriptionGET/account/balanceGet current balancePOST/account/transferTransfer moneyGET/account/transactionsGet last 10 transactions
Users (requires auth)
MethodEndpointDescriptionGET/user/bulk?filter=Search users by name

Authentication
All protected routes require the JWT token in the request header:
token: <your_jwt_token>
Token expires in 7 days.
License
MIT
