const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./database.js");
const nodemailer = require("nodemailer"); // Gọi "vũ khí" mới

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// === CẤU HÌNH GỬI EMAIL ===
// Đại ka hãy điền MẬT KHẨU ỨNG DỤNG đã tạo vào đây
const GMAIL_USER = "vnd22darkhorse@gmail.com";
const GMAIL_PASSWORD = "darkbloom22"; // <-- DÙNG MẬT KHẨU ỨNG DỤNG, KHÔNG DÙNG MẬT KHẨU THẬT

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
});

let shoppingCart = [];
let connectedAdmins = [];

// --- API GIỎ HÀNG (Giữ nguyên) ---
app.post("/api/cart/add", (req, res) => {
  const productToAdd = req.body;
  productToAdd.cartItemId = `item-${Date.now()}`;
  shoppingCart.push(productToAdd);
  res.status(200).json({
    message: `Đã thêm "${productToAdd.name}" vào giỏ!`,
    cartTotalItems: shoppingCart.length,
  });
});
app.get("/api/cart", (req, res) => {
  res.status(200).json({ data: shoppingCart, totalItems: shoppingCart.length });
});
app.delete("/api/cart/item/:cartItemId", (req, res) => {
  const { cartItemId } = req.params;
  shoppingCart = shoppingCart.filter((item) => item.cartItemId !== cartItemId);
  res.status(200).json({
    message: "Xóa sản phẩm thành công",
    totalItems: shoppingCart.length,
  });
});
app.patch("/api/cart/item/:cartItemId", (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  const itemToUpdate = shoppingCart.find(
    (item) => item.cartItemId === cartItemId
  );
  if (itemToUpdate) {
    itemToUpdate.quantity = parseInt(quantity, 10);
    res
      .status(200)
      .json({ message: "Cập nhật thành công", item: itemToUpdate });
  } else {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
});

// --- API SẢN PHẨM (Giữ nguyên) ---
app.get("/api/products", (req, res) => {
  const { category } = req.query;
  let sql = "SELECT * FROM products";
  const params = [];

  if (category) {
    sql += " WHERE category = ?";
    params.push(category);
  }
  sql += " ORDER BY id DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: "Lấy danh sách sản phẩm thành công",
      data: rows,
    });
  });
});

app.post("/api/products", (req, res) => {
  const { name, price, category, image_url } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Tên và giá sản phẩm là bắt buộc." });
  }
  const sql = `INSERT INTO products (name, price, category, image_url) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, price, category, image_url], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công", id: this.lastID });
  });
});

app.put("/api/products/:id", (req, res) => {
  const { name, price, category, image_url } = req.body;
  const sql = `UPDATE products SET name = ?, price = ?, category = ?, image_url = ? WHERE id = ?`;
  db.run(
    sql,
    [name, price, category, image_url, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: "Cập nhật sản phẩm thành công" });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  const sql = "DELETE FROM products WHERE id = ?";
  db.run(sql, req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  });
});

// === API QUẢN LÝ ĐẶT BÀN (ĐÃ NÂNG CẤP) ===

// POST: Nhận lịch đặt bàn mới (Giữ nguyên)
app.post("/api/bookings", (req, res) => {
  const { fullName, email, phone, guests, bookingDate, bookingTime } = req.body;
  const createdAt = new Date().toISOString();

  if (
    !fullName ||
    !email ||
    !phone ||
    !guests ||
    !bookingDate ||
    !bookingTime
  ) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
  }
  const sql = `INSERT INTO bookings (fullName, email, phone, guests, bookingDate, bookingTime, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    fullName,
    email,
    phone,
    guests,
    bookingDate,
    bookingTime,
    createdAt,
  ];
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: "Lỗi server khi lưu đặt bàn." });
    }
    res
      .status(201)
      .json({ message: "Đặt bàn thành công!", bookingId: this.lastID });
  });
});

// GET: Lấy tất cả lịch đặt bàn (Giữ nguyên)
app.get("/api/bookings", (req, res) => {
  const sql = "SELECT * FROM bookings ORDER BY createdAt DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Lấy danh sách đặt bàn thành công", data: rows });
  });
});

// POST: "NÚT BẤM HẠT NHÂN" - XÁC NHẬN VÀ GỬI EMAIL
app.post("/api/bookings/:id/confirm", (req, res) => {
  const { id } = req.params;
  const newStatus = "Đã xác nhận";

  db.run(
    "UPDATE bookings SET status = ? WHERE id = ?",
    [newStatus, id],
    function (err) {
      if (err)
        return res.status(500).json({ error: "Lỗi khi cập nhật database." });
      if (this.changes === 0)
        return res.status(404).json({ message: "Không tìm thấy lịch đặt" });

      db.get("SELECT * FROM bookings WHERE id = ?", [id], (err, booking) => {
        if (err || !booking)
          return res
            .status(500)
            .json({ error: "Lỗi khi lấy thông tin đặt bàn." });

        const mailOptions = {
          from: `"Dark Bloom" <${GMAIL_USER}>`,
          to: booking.email,
          subject: "Xác nhận Đặt bàn thành công tại Dark Bloom!",
          html: `
                    <h3>Xin chào ${booking.fullName},</h3>
                    <p>Cảm ơn bạn đã tin tưởng và đặt bàn tại <strong>Dark Bloom</strong>.</p>
                    <p>Chúng tôi xin xác nhận lịch đặt của bạn với thông tin sau:</p>
                    <ul>
                        <li><strong>Thời gian:</strong> ${
                          booking.bookingTime
                        } - ${new Date(booking.bookingDate).toLocaleDateString(
            "vi-VN"
          )}</li>
                        <li><strong>Số lượng khách:</strong> ${
                          booking.guests
                        } người</li>
                    </ul>
                    <p>Chúng tôi rất mong được đón tiếp bạn!</p>
                    <p>Trân trọng,<br>Đội ngũ Dark Bloom.</p>
                `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Lỗi khi gửi mail:", error);
            return res
              .status(200)
              .json({ message: "Đã xác nhận đặt bàn (gửi mail thất bại)." });
          }
          console.log("Email xác nhận đã được gửi: " + info.response);
          res
            .status(200)
            .json({ message: "Đã xác nhận và gửi email thành công!" });
        });
      });
    }
  );
});

// === API ĐƠN HÀNG (Giữ nguyên) ===
app.post("/api/orders/create", (req, res) => {
  if (shoppingCart.length === 0)
    return res.status(400).json({ message: "Giỏ hàng trống!" });

  const newOrderData = {
    id: `DH-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: "Mới",
    items: [...shoppingCart],
  };

  db.serialize(() => {
    db.run("BEGIN TRANSACTION;");
    const orderStmt = db.prepare(
      "INSERT INTO orders (id, timestamp, status) VALUES (?, ?, ?)"
    );
    orderStmt.run(newOrderData.id, newOrderData.timestamp, newOrderData.status);
    orderStmt.finalize();

    const itemStmt = db.prepare(
      "INSERT INTO order_items (order_id, product_name, product_size, quantity, price) VALUES (?, ?, ?, ?, ?)"
    );
    newOrderData.items.forEach((item) => {
      itemStmt.run(
        newOrderData.id,
        item.name,
        item.size,
        item.quantity,
        item.price
      );
    });
    itemStmt.finalize();

    db.run("COMMIT;", (err) => {
      if (err) {
        db.run("ROLLBACK;");
        return res
          .status(500)
          .json({ message: "Lỗi server khi tạo đơn hàng." });
      }

      const orderForAdmin = { orderId: newOrderData.id, ...newOrderData };
      sendEventToAdmins({ event: "new_order", data: orderForAdmin });
      shoppingCart = [];
      res
        .status(200)
        .json({ message: "Đặt hàng thành công!", orderId: newOrderData.id });
    });
  });
});
app.get("/api/orders", (req, res) => {
  const sql = `
        SELECT o.id, o.timestamp, o.status, i.product_name, i.product_size, i.quantity, i.price
        FROM orders o JOIN order_items i ON o.id = i.order_id
        ORDER BY o.timestamp DESC;
    `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = {};
    rows.forEach((row) => {
      if (!orders[row.id]) {
        orders[row.id] = {
          orderId: row.id,
          timestamp: row.timestamp,
          status: row.status,
          items: [],
        };
      }
      orders[row.id].items.push({
        name: row.product_name,
        size: row.product_size,
        quantity: row.quantity,
        price: row.price,
      });
    });
    res.json(Object.values(orders));
  });
});
app.patch("/api/orders/:orderId/status", (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;
  db.run(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      const sqlSelect = `
        SELECT o.id, o.timestamp, o.status, i.product_name, i.product_size, i.quantity, i.price
        FROM orders o JOIN order_items i ON o.id = i.order_id WHERE o.id = ?;`;
      db.all(sqlSelect, [orderId], (err, rows) => {
        if (err || rows.length === 0) {
          return console.error(
            "Lỗi khi lấy lại đơn hàng sau khi cập nhật:",
            err ? err.message : "Không tìm thấy hàng"
          );
        }
        const fullOrder = {
          orderId: rows[0].id,
          timestamp: rows[0].timestamp,
          status: rows[0].status,
          items: rows.map((r) => ({
            name: r.product_name,
            size: r.product_size,
            quantity: r.quantity,
            price: r.price,
          })),
        };
        sendEventToAdmins({ event: "order_update", data: fullOrder });
        res.status(200).json({ message: "Cập nhật trạng thái thành công" });
      });
    }
  );
});

// --- HỆ THỐNG SSE (Giữ nguyên) ---
app.get("/api/orders/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  connectedAdmins.push(newClient);
  const welcomeMessage = {
    event: "welcome",
    data: { message: "Kết nối thành công!" },
  };
  sendEventToAdmins(welcomeMessage, newClient);
  req.on("close", () => {
    connectedAdmins = connectedAdmins.filter(
      (client) => client.id !== clientId
    );
  });
});

function sendEventToAdmins(payload, singleClient = null) {
  const sseFormattedData = `event: ${payload.event}\ndata: ${JSON.stringify(
    payload.data
  )}\n\n`;
  const clients = singleClient ? [singleClient] : connectedAdmins;
  clients.forEach((client) => {
    try {
      client.res.write(sseFormattedData);
    } catch (error) {
      console.error(`Lỗi khi gửi đến client ${client.id}:`, error.message);
    }
  });
}

// --- KHỞI CHẠY SERVER ---
app.listen(port, () => {
  console.log(
    `Bẩm đại ka, server đã chạy thành công tại http://localhost:${port}`
  );
});
