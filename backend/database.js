const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  "./botea.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Lỗi kết nối database:", err.message);
    } else {
      console.log("Kết nối tới database botea.db thành công.");
    }
  }
);

// Chạy các lệnh SQL để tạo bảng nếu chúng chưa tồn tại
db.serialize(() => {
  // Bảng orders (Giữ nguyên)
  db.run(
    `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL
    )`,
    (err) => {
      if (err) return console.error("Lỗi khi tạo bảng orders:", err.message);
      console.log("Bảng 'orders' đã sẵn sàng.");
    }
  );

  // Bảng order_items (Giữ nguyên)
  db.run(
    `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_size TEXT,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id)
    )`,
    (err) => {
      if (err)
        return console.error("Lỗi khi tạo bảng order_items:", err.message);
      console.log("Bảng 'order_items' đã sẵn sàng.");
    }
  );

  // Bảng products (Giữ nguyên)
  db.run(
    `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT,
        description TEXT,
        category TEXT
    )`,
    (err) => {
      if (err) {
        return console.error("Lỗi khi tạo bảng products:", err.message);
      }
      console.log("Bảng 'products' đã sẵn sàng.");
    }
  );

  // === BẢNG MỚI ĐỂ LƯU THÔNG TIN ĐẶT BÀN ===
  db.run(
    `CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        num_people INTEGER NOT NULL,
        reservation_date TEXT NOT NULL,
        reservation_time TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        return console.error("Lỗi khi tạo bảng reservations:", err.message);
      }
      console.log("Bảng 'reservations' đã sẵn sàng.");
    }
  );
});

module.exports = db;
