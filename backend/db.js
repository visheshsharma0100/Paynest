require('dotenv').config({path: require('path').join(__dirname, '../.env')});
const mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const UsersSchema=mongoose.Schema({
    username: String,   
  password: String,
  firstName: String,
  lastName: String
});
const AccountsSchema=mongoose.Schema({
          // reference to User
          userId:mongoose.Schema.Types.ObjectId,
         balance: Number  
});
const TransactionsSchema=mongoose.Schema({
  senderId: mongoose.Schema.Types.ObjectId,
  receiverId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  senderName: String,
  receiverName: String,
  timestamp: { type: Date, default: Date.now }
});
const UsersModel=mongoose.model("users",UsersSchema);
const AccountsModel=mongoose.model("accounts",AccountsSchema);
const TransactionsModel=mongoose.model("transactions",TransactionsSchema);
 
module.exports={
    UsersModel,
    AccountsModel,
    TransactionsModel,
    mongoose
}


