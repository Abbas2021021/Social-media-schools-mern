import express from "express";
import http from "http";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import { Server } from "socket.io";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const server = http.createServer(app);

//creating an io instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  }
})

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// SOCKET IO SETUP
io.on('connection', (socket) => {

  socket.on("new-user", (userId) => {
    addNewUser(socket.id, userId)
    console.log("new user");
  });

  socket.on("send-notification", async ({ senderId, receiverId, type }) => {
    const receiver = getOnlineUsers(receiverId)
    const user = await User.findById(senderId)
    io.to(receiver.socketId).emit("get-notification", { userName: user.firstName, type })
  })

  socket.on('disconnect', () => {
    removeUser(socket.id)
    console.log('user disconnected');
  });
  
});

// functions for socket io
let onlineUsers = [];
const addNewUser = (socketId, userId) => {
  !onlineUsers.some(el => el.userId === userId) && onlineUsers.push({ socketId, userId });
}
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(el => el.userId !== socketId);
}
const getOnlineUsers = (userId) => {
  return onlineUsers.find(el => el.userId === userId);
}

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
