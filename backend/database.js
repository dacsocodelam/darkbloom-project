// Gọi thư viện sqlite3 đã cài
const sqlite3 = require("sqlite3").verbose();

// Mở (hoặc tạo nếu chưa có) một file database tên là 'botea.db'
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
  // Bảng để lưu thông tin chung của mỗi đơn hàng
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

  // Bảng để lưu các sản phẩm chi tiết trong mỗi đơn hàng
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

  // Bảng để lưu trữ toàn bộ sản phẩm của quán
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

  // Bảng mới để lưu trữ thông tin đặt bàn
  db.run(
    `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        guests INTEGER NOT NULL,
        bookingDate TEXT NOT NULL,
        bookingTime TEXT NOT NULL,
        createdAt TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        return console.error("Lỗi khi tạo bảng bookings:", err.message);
      }
      console.log("Bảng 'bookings' đã sẵn sàng.");
    }
  );
});

// "Xuất khẩu" biến db để các file khác có thể sử dụng
module.exports = db;
