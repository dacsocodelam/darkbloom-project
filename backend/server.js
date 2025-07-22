const express = require("express");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
const db = require("./database.js");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

let shoppingCart = new Map();
let connectedAdmins = [];

// --- API GIỎ HÀNG ---
app.post("/api/cart/add", (req, res) => {
  const productToAdd = req.body;
  const productId = productToAdd.id.toString();

  if (shoppingCart.has(productId)) {
    shoppingCart.get(productId).quantity += 1;
  } else {
    productToAdd.quantity = 1;
    productToAdd.cartItemId = `item-${Date.now()}`;
    shoppingCart.set(productId, productToAdd);
  }
  res.status(200).json({
    message: `Đã thêm "${productToAdd.name}" vào giỏ!`,
    cartTotalItems: shoppingCart.size,
  });
});

app.get("/api/cart", (req, res) => {
  const cartArray = Array.from(shoppingCart.values());
  res.status(200).json({ data: cartArray, totalItems: cartArray.length });
});

app.delete("/api/cart/item/:cartItemId", (req, res) => {
  const { cartItemId } = req.params;
  let productKeyToDelete;
  for (let [key, value] of shoppingCart.entries()) {
    if (value.cartItemId === cartItemId) {
      productKeyToDelete = key;
      break;
    }
  }
  if (productKeyToDelete) {
    shoppingCart.delete(productKeyToDelete);
  }
  res.status(200).json({
    message: "Xóa sản phẩm thành công",
    totalItems: shoppingCart.size,
  });
});

app.patch("/api/cart/item/:cartItemId", (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  let itemToUpdate;
  for (let item of shoppingCart.values()) {
    if (item.cartItemId === cartItemId) {
      itemToUpdate = item;
      break;
    }
  }
  if (itemToUpdate) {
    const newQuantity = parseInt(quantity, 10);
    if (newQuantity > 0) {
      itemToUpdate.quantity = newQuantity;
      res
        .status(200)
        .json({ message: "Cập nhật thành công", item: itemToUpdate });
    } else {
      shoppingCart.delete(itemToUpdate.id.toString());
      res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
    }
  } else {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
});

// === API QUẢN LÝ SẢN PHẨM ===

// API LẤY TẤT CẢ SẢN PHẨM HOẶC LỌC THEO DANH MỤC
app.get("/api/products", (req, res) => {
  const { category } = req.query;
  let sql = "SELECT * FROM products";
  const params = [];

  if (category && category !== "Món Nổi Bật") {
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

// API LẤY DANH SÁCH DANH MỤC VÀ SỐ LƯỢNG SẢN PHẨM
app.get("/api/products/categories", (req, res) => {
  const sql = `
    SELECT category, COUNT(*) as productCount 
    FROM products 
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category 
    ORDER BY category`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: "Lấy danh mục thành công",
      data: rows,
    });
  });
});

// API THÊM SẢN PHẨM
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

// API SỬA SẢN PHẨM
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

// API XÓA SẢN PHẨM
app.delete("/api/products/:id", (req, res) => {
  const sql = "DELETE FROM products WHERE id = ?";
  db.run(sql, req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  });
});

// === API ĐẶT BÀN ===
app.post("/api/reservations", (req, res) => {
  const { name, email, phone, people, date, time } = req.body;
  if (!name || !email || !phone || !people || !date || !time) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
  }
  const sql = `INSERT INTO reservations (name, email, phone, num_people, reservation_date, reservation_time) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, email, phone, people, date, time];
  db.run(sql, params, function (err) {
    if (err) {
      console.error("Lỗi khi lưu thông tin đặt bàn:", err.message);
      return res
        .status(500)
        .json({ message: "Có lỗi xảy ra, không thể hoàn tất đặt bàn." });
    }
    res
      .status(201)
      .json({ message: "Đặt bàn thành công!", reservationId: this.lastID });
  });
});

app.get("/api/reservations", (req, res) => {
  const sql = "SELECT * FROM reservations ORDER BY created_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err)
      return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu." });
    res.status(200).json({ data: rows });
  });
});

// --- API ĐƠN HÀNG ---
app.post("/api/orders/create", (req, res) => {
  const cartArray = Array.from(shoppingCart.values());
  if (cartArray.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống!" });
  }
  const newOrderData = {
    id: `DH-${crypto.randomBytes(6).toString("hex")}`,
    timestamp: new Date().toISOString(),
    status: "Mới",
    items: cartArray,
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
      shoppingCart.clear();
      res
        .status(200)
        .json({ message: "Đặt hàng thành công!", orderId: newOrderData.id });
    });
  });
});

app.get("/api/orders", (req, res) => {
  const sql = `SELECT o.id, o.timestamp, o.status, i.product_name, i.product_size, i.quantity, i.price FROM orders o JOIN order_items i ON o.id = i.order_id ORDER BY o.timestamp DESC;`;
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
      const sqlSelect = `SELECT o.id, o.timestamp, o.status, i.product_name, i.product_size, i.quantity, i.price FROM orders o JOIN order_items i ON o.id = i.order_id WHERE o.id = ?;`;
      db.all(sqlSelect, [orderId], (err, rows) => {
        if (err || rows.length === 0) {
          return console.error(
            "Lỗi khi lấy lại đơn hàng:",
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

// --- HỆ THỐNG SSE ---
app.get("/api/orders/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  connectedAdmins.push(newClient);
  sendEventToAdmins(
    { event: "welcome", data: { message: "Kết nối thành công!" } },
    newClient
  );
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
