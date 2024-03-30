const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
mongoose
  .connect(
    "mongodb://localhost:27017/wisol",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("đã kết nối tới MongoDB");
  })
  .catch((error) => {
    console.error("lỗi kết nối", error);
  });

const wifiSchema = new mongoose.Schema({
  name: String,
  address: String,
  password: String,
  sol: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})

const Wifi = mongoose.model("wifi", wifiSchema)

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  address: String,
  walletId: String,
  avatar: String,
});

const User = mongoose.model("User", userSchema);

let currentUser = null;

app.post("/register", (req, res) => {
  const { username, password, fullname, address, walletId, avatar } = req.body;

  const newUser = new User({
    username,
    password,
    fullname,
    address,
    walletId,
    avatar,
  });

  newUser
    .save()
    .then(() => {
      res.status(201).json({ message: "Đã đăng ký thành công" });
    })
    .catch((error) => {
      console.error("Lỗi khi đăng ký:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi server" });
    });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username, password })
    .then((user) => {
      if (user) {
        currentUser = user;
        res.status(200).json({ message: "Đăng nhập thành công", user });
      } else {
        res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
      }
    })
    .catch((error) => {
      console.error("Lỗi khi đăng nhập:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi server" });
    });
});

app.get('/wifis', async (req, res) => {
  try {
    let wifis = await Wifi.find({});
    if (currentUser) {
      wifis = wifis.sort((a, b) => {
        const aMatch = a.address.includes(currentUser.address);
        const bMatch = b.address.includes(currentUser.address);
        if (aMatch && !bMatch) {
          return -1;
        } else if (!aMatch && bMatch) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    res.json(wifis);
  } catch (error) {
    console.error("Error fetching wifis:", error);
    res.status(500).send("Internal Server Error");
  }
})

app.post("/api/wifi", (req, res) => {
  const { name, address, password, sol, userId } = req.body;

  const newWifi = new Wifi({
    name,
    address,
    password,
    sol,
    userId,
  });

  newWifi
    .save()
    .then(() => {
      res.status(201).json({ message: "Đã lưu đối tượng vào MongoDB" });
    })
    .catch((error) => {
      console.error("Lỗi lưu đối tượng vào MongoDB:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi server" });
    });
})

app.get("/wifis/:id", (req, res) => {
  Wifi.findById(req.params.id)
    .then((wifi) => {
      if (wifi) {
        res.status(200).json(wifi);
      } else {
        res.status(404).json({ error: "Không tìm thấy wifi" });
      }
    })
    .catch((error) => {
      console.error("Lỗi khi lấy thông tin wifi:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi server" });
    });
});

const transactionSchema = new mongoose.Schema({
  userId: String,
  wifiId: String,
  timestamp: Date,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

app.get("/transactions/:userId", (req, res) => {
  Transaction.find({ userId: req.params.userId })
    .populate('wifiId') // Điền thông tin wifi dựa trên wifiId
    .then((transactions) => {
      res.status(200).json(transactions);
    })
    .catch((error) => {
      console.error("Lỗi khi lấy lịch sử giao dịch:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi server" });
    });
});

app.post("/transactions", (req, res) => {
  const { userId, wifiId } = req.body;

  const newTransaction = new Transaction({
    userId,
    wifiId,
    timestamp: new Date(),
  });

  newTransaction
    .save()
    .then(() => {
      res.status(201).json({ message: "Đã thêm giao dịch thành công" });
    })
    .catch((error) => {
      console.error("Lỗi khi thêm giao dịch:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi server" });
    });
});

app.get("/users/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "Không tìm thấy người dùng" });
      }
    })
    .catch((error) => {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi server" });
    });
});

app.get("/users/:id/total-sol", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.id }).populate('wifiId');
    let totalSol = 0;
    transactions.forEach(transaction => {
      totalSol += transaction.wifiId.sol;
    });
    res.status(200).json({ totalSol });
  } catch (error) {
    console.error("Lỗi khi lấy tổng số SOL:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi server" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`server đang lắng nghe tại cổng ${port}`);
});
