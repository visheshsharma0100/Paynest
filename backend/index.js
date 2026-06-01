const express=require('express');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const z=require('zod');
const cors = require('cors');
const path = require("path");
const {authmiddleware}=require("./middleware");
const {UsersModel,AccountsModel,TransactionsModel,mongoose}=require('./db');
const app=express();
app.use(express.json());
app.use(cors());
const port=3000;


const SignUpSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(3),
    firstName:z.string().min(3),
    lastName:z.string().min(3),

})

app.post("/user/signup",async function(req,res){
    const {data,success,error}=SignUpSchema.safeParse(req.body);
    if(!success){
        return res.status(403).json({
            message:"Incorrect input",error:JSON.parse(error)
        });
    }
    let username=data.username;
    let password=data.password;
    let firstName=data.firstName;
    let lastName=data.lastName;
    let hashedpassword=await bcrypt.hash(password,10);
    let UserExists=await UsersModel.findOne({
        username,
    });
    if(UserExists){
        return res.status(403).json({
            message:"User already Exists",
        });
    }
    const newUser=await UsersModel.create({
        username,
       password: hashedpassword,
        firstName,
        lastName,
    });

    await AccountsModel.create({
        userId:newUser._id,
        balance:Math.floor(Math.random()*10000)+1
    });

    res.json({
        id:newUser._id,
        message:"SignUp Successfully",
    });

});

app.post("/user/signin", async function(req,res){
    let username=req.body.username;
    let password=req.body.password;
    let firstName=req.body.firstName;
    let lastName=req.body.lastName;
    let UserExists= await UsersModel.findOne({
        username,
    });
    if(!UserExists){
        return res.status(403).json({
            message:"Incorrect Creadentials",
        });
    }
    let passwordmatched=await bcrypt.compare(password,UserExists.password);
    if(!passwordmatched){
        return res.status(403).json({
            message:"Inccorect credentials",
        });
    }

    const token=jwt.sign({
        id:UserExists._id
    },process.env.JWT_SECRET,{
        expiresIn:"7d"
    });
    res.json({
        token
    });
});

app.get("/account/balance",authmiddleware, async function(req,res){
    const account =await AccountsModel.findOne({
        userId:req.userId,
    });
    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        });
    }
    res.json({
        balance:account.balance
    });
})

app.post("/account/transfer", authmiddleware, async function(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const amount = parseInt(req.body.amount);
        const receiver = req.body.receiver;

        if (!amount || amount <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Invalid amount" });
        }

        const senderAccount = await AccountsModel.findOne({ userId: req.userId }).session(session);
        
        if (!senderAccount || senderAccount.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const receiverAccount = await AccountsModel.findOne({ userId: receiver }).session(session);
        
        if (!receiverAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Receiver account not found" });
        }

        const sender = await UsersModel.findOne({ _id: req.userId }).session(session);
        const receiverUser = await UsersModel.findOne({ _id: receiver }).session(session);

        await AccountsModel.updateOne(
            { userId: req.userId },
            { $inc: { balance: -amount } }
        ).session(session);

        await AccountsModel.updateOne(
            { userId: receiver },
            { $inc: { balance: amount } }
        ).session(session);

        await session.commitTransaction();
        session.endSession();

    
        const transaction = await TransactionsModel.create({
            senderId: new mongoose.Types.ObjectId(req.userId),
            receiverId: new mongoose.Types.ObjectId(receiver),
            amount: amount,
            senderName: sender.firstName + " " + sender.lastName,
            receiverName: receiverUser.firstName + " " + receiverUser.lastName,
            timestamp: new Date()
        });

        console.log("Transaction saved:", transaction._id);

        res.status(200).json({
            message: "Transaction Successful",
            transactionId: transaction._id
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Transfer error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/account/transactions", authmiddleware, async function(req, res) {
    try {
        const userId = req.userId;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        console.log("Fetching transactions for userId:", userId);
        console.log("userId type:", typeof userId);
        console.log("userObjectId:", userObjectId);
        
        const transactions = await TransactionsModel.find({
            $or: [
                { senderId: userObjectId },
                { receiverId: userObjectId }
            ]
        }).sort({ timestamp: -1 }).limit(10);
        
        console.log("Found transactions:", transactions.length);
        console.log("Transaction details:", transactions);
        
        const formattedTransactions = transactions.map(t => ({
            amount: t.amount,
            senderName: t.senderName,
            receiverName: t.receiverName,
            timestamp: t.timestamp,
            type: t.senderId.toString() === userObjectId.toString() ? 'sent' : 'received'
        }));
        
        console.log("Formatted transactions:", formattedTransactions);
        
        res.json({ transactions: formattedTransactions });
    } catch(err) {
        console.log("Error in transactions endpoint:", err);
        res.status(500).json({ message: "Error fetching transactions", error: err.message });
    }
})

// Debug endpoint - list all transactions
app.get("/debug/all-transactions", async function(req, res) {
    try {
        const allTransactions = await TransactionsModel.find({});
        console.log("All transactions in DB:", allTransactions);
        res.json({ 
            count: allTransactions.length, 
            transactions: allTransactions 
        });
    } catch(err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
})

app.get("/user/bulk", authmiddleware, async function(req, res) {
    const filter = req.query.filter || "";
    const users = await UsersModel.find({
        $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } }
        ]
    });
    res.json({ users });
});



app.listen(port,()=>{
    console.log(`Server Runing at port: ${port}`);
});
