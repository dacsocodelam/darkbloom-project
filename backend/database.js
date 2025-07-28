// Gọi thư viện "thông dịch viên" cho PostgreSQL
const { Pool } = require("pg");

// Kết nối tới PostgreSQL bằng link mà Render cung cấp
// process.env.DATABASE_URL sẽ tự động đọc biến môi trường đại ka đã tạo
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Bắt buộc phải có khi kết nối tới dịch vụ bên ngoài như Render
  },
});

// Hàm để khởi tạo các bảng trong database
const initializeDatabase = async () => {
  const client = await pool.connect(); // Mượn một kết nối từ "hồ bơi"
  try {
    // Bắt đầu một giao dịch an toàn
    await client.query("BEGIN");

    // Tạo bảng orders (dùng cú pháp PostgreSQL)
    await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                timestamp TIMESTAMPTZ NOT NULL,
                status TEXT NOT NULL
            );
        `);
    console.log("Bảng 'orders' đã sẵn sàng.");

    // Tạo bảng order_items
    await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id TEXT NOT NULL REFERENCES orders(id),
                product_name TEXT NOT NULL,
                product_size TEXT,
                quantity INTEGER NOT NULL,
                price NUMERIC NOT NULL
            );
        `);
    console.log("Bảng 'order_items' đã sẵn sàng.");

    // Tạo bảng products
    await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price NUMERIC NOT NULL,
                image_url TEXT,
                description TEXT,
                category TEXT
            );
        `);
    console.log("Bảng 'products' đã sẵn sàng.");

    // Tạo bảng bookings
    await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                fullName TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                guests INTEGER NOT NULL,
                bookingDate TEXT NOT NULL,
                bookingTime TEXT NOT NULL,
                createdAt TIMESTAMPTZ NOT NULL,
                status TEXT DEFAULT 'Mới'
            );
        `);
    console.log("Bảng 'bookings' đã sẵn sàng.");

    // Lưu lại mọi thay đổi
    await client.query("COMMIT");
  } catch (e) {
    // Nếu có lỗi, hoàn tác lại tất cả
    await client.query("ROLLBACK");
    console.error("Lỗi khi khởi tạo database:", e);
    throw e;
  } finally {
    // Luôn luôn trả lại kết nối sau khi dùng xong
    client.release();
  }
};

// Chạy hàm khởi tạo khi server bắt đầu
initializeDatabase().catch((e) =>
  console.error("Không thể khởi tạo database:", e)
);

// "Xuất khẩu" một hàm query để các file khác có thể sử dụng "hồ bơi" kết nối này
module.exports = {
  query: (text, params) => pool.query(text, params),
};
