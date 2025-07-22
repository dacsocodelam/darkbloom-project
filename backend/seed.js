const db = require("./database.js");

// DANH SÁCH SẢN PHẨM HOÀN CHỈNH - ĐÃ GỘP CHUNG CÁC LOẠI TRÀ
const productsToSeed = [
  // === Cà phê (8 món) ===
  {
    name: "Cà phê Đen",
    price: 25000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_Phin_Den_Da_1.png",
    category: "Cà phê",
  },
  {
    name: "Cà phê Sữa",
    price: 29000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_Phin_Sua_Da_1.png",
    category: "Cà phê",
  },
  {
    name: "Bạc Xỉu",
    price: 29000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_Bac_Xiu_Da_1.png",
    category: "Cà phê",
  },
  {
    name: "Cà phê dừa",
    price: 50000,
    image_url:
      "https://cdn.tgdd.vn/Files/2021/08/11/1374530/cung-bat-trend-lam-ca-phe-dua-thom-beo-cuc-de-tai-nha-202108110903086938.jpg",
    category: "Cà phê",
  },
  {
    name: "Cà phê muối",
    price: 45000,
    image_url:
      "https://cdn.tgdd.vn/2021/03/CookProduct/Ca-phe-muoi-la-gi-nguon-goc-va-cach-pha-che-ca-phe-muoi-thom-ngon-chuan-vi-avt-1200x676.jpg",
    category: "Cà phê",
  },
  {
    name: "Cà phê trứng",
    price: 55000,
    image_url:
      "https://static.vinwonders.com/production/cach-lam-ca-phe-trung-1.jpg",
    category: "Cà phê",
  },
  {
    name: "Espresso",
    price: 40000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_PHINDI_CHOCO_1.png",
    category: "Cà phê",
  },
  {
    name: "Americano",
    price: 45000,
    image_url:
      "https://lifestyle-prod-content.press.discovery.com/wp-content/uploads/2023/02/14172457/what-is-an-americano-725x482.jpg",
    category: "Cà phê",
  },

  // === Trà & Trà sữa (11 món) ===
  {
    name: "Trà sữa trân châu",
    price: 50000,
    image_url: "https://gongcha.com.vn/wp-content/uploads/tra-sua-okinawa.jpg",
    category: "Trà sữa",
  },
  {
    name: "Trà sữa khoai môn",
    price: 55000,
    image_url:
      "https://cdn.tgdd.vn/Files/2020/04/10/1247997/cach-lam-tra-sua-khoai-mon-deo-thom-chuan-vi-ai-cung-me-202201131122170327.jpg",
    category: "Trà sữa",
  },
  {
    name: "Trà sữa socola",
    price: 55000,
    image_url:
      "https://cdn.beptruong.edu.vn/wp-content/uploads/2018/07/tra-sua-socola-tran-chau.jpg",
    category: "Trà sữa",
  },
  {
    name: "Trà sữa matcha",
    price: 52000,
    image_url:
      "https://static.hotdeal.vn/images/130/1303862/400x400/tra-sua-matcha-tran-chau-size-l-kem-lop-macchiato-thom-beo-hap-dan.jpg",
    category: "Trà sữa",
  },
  {
    name: "Trà sữa trân châu đường đen",
    price: 58000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/05_2023/HLC_New_logo_5.1_Products__SUA_DA_DUONG_DEN.png",
    category: "Trà sữa",
  },
  {
    name: "Trà sữa Oolong",
    price: 48000,
    image_url:
      "https://tocotocotea.com/wp-content/uploads/2022/04/Tra-sua-Olong-Tran-chau-Baby-Kem-Cafe.jpg",
    category: "Trà sữa",
  },
  {
    name: "Trà sữa Thái Xanh",
    price: 45000,
    image_url:
      "https://cdn.dayphache.edu.vn/wp-content/uploads/2020/02/tra-sua-thai-xanh.jpg",
    category: "Trà sữa",
  },
  {
    name: "Trà Sữa Okinawa",
    price: 25000,
    image_url: "https://gongcha.com.vn/wp-content/uploads/tra-sua-okinawa.jpg",
    category: "Trà sữa",
  },
  {
    name: "Trà Oolong túi lọc",
    price: 99000,
    image_url: "https://phela.vn/wp-content/uploads/oolong-tea-bag.jpg",
    category: "Trà sữa",
  }, // Đã gộp
  {
    name: "Trà đào cam sả",
    price: 48000,
    image_url: "https://phela.vn/wp-content/uploads/peach-citrus-tea.jpg",
    category: "Trà sữa",
  }, // Đã gộp
  {
    name: "Trà Matcha",
    price: 52000,
    image_url:
      "https://static.hotdeal.vn/images/130/1303862/400x400/tra-sua-matcha-tran-chau-size-l-kem-lop-macchiato-thom-beo-hap-dan.jpg",
    category: "Trà sữa",
  }, // Đã gộp

  // === Sữa chua (8 món) ===
  {
    name: "Sữa chua việt quất",
    price: 55000,
    image_url:
      "https://bakingmad.com/content/uploads/2022/05/Blueberry-Yoghurt-Slices-1080x1080.jpg",
    category: "Sữa chua",
  },
  {
    name: "Sữa chua dâu tây",
    price: 48000,
    image_url:
      "https://dayphache.edu.vn/wp-content/uploads/2016/08/sua-chua-dau-tay.jpg",
    category: "Sữa chua",
  },
  {
    name: "Sữa chua xoài",
    price: 48000,
    image_url:
      "https://static.vinwonders.com/production/cach-lam-sua-chua-xoai-2.jpg",
    category: "Sữa chua",
  },
  {
    name: "Sữa chua chanh dây",
    price: 45000,
    image_url:
      "https://cdn.tgdd.vn/Files/2020/07/22/1271815/cach-lam-sua-chua-chanh-day-thom-ngon-thanh-mat-giai-nhiet-mua-he-202007221535255474.jpg",
    category: "Sữa chua",
  },
  {
    name: "Sữa chua nha đam",
    price: 40000,
    image_url:
      "https://www.vinamilk.com.vn/sua-chua-vinamilk/wp-content/uploads/2022/01/scad-nha-dam-probi_new-2022.png",
    category: "Sữa chua",
  },
  {
    name: "Sữa chua nếp cẩm",
    price: 35000,
    image_url:
      "https://cdn.tgdd.vn/Files/2018/06/15/1095598/sua-chua-nep-cam-tot-cho-he-tieu-hoa-tim-mach-va-giam-can_760x380.jpg",
    category: "Sữa chua",
  },
  {
    name: "Sữa chua mít",
    price: 42000,
    image_url:
      "https://cdn.cet.edu.vn/wp-content/uploads/2019/04/sua-chua-mit-thom-mat.jpg",
    category: "Sữa chua",
  },
  {
    name: "Sữa chua phô mai",
    price: 38000,
    image_url:
      "https://cdn.dayphache.edu.vn/wp-content/uploads/2019/07/sua-chua-pho-mai.jpg",
    category: "Sữa chua",
  },

  // === Đồ ăn nhẹ (10 loại hạt) ===
  {
    name: "Hạt Điều Rang Muối",
    price: 48000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/299694/bhx/hat-dieu-rang-muoi-vo-lua-tan-tan-goi-140g-202302211624388147.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Hạt Hạnh Nhân Rang Bơ",
    price: 52000,
    image_url:
      "https://image.voso.vn/users/vtfamicare/images/c6f01116131d451ebb3d55685a73e168.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Hạt Dẻ Cười",
    price: 45000,
    image_url:
      "https://www.ecohealth.com.vn/wp-content/uploads/2020/07/hat-de-cuoi.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Hạt Macca Sấy Nứt Vỏ",
    price: 65000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/252204/bhx/hat-mac-ca-say-nut-vo-luvita-lon-250g-202209261502444391.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Hạt Óc Chó",
    price: 58000,
    image_url:
      "https://frutina.com.vn/wp-content/uploads/2021/11/hat-oc-cho-3.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Hạt Hướng Dương",
    price: 22000,
    image_url:
      "https://www.thuocdantoc.org/wp-content/uploads/2021/06/hat-huong-duong.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Hạt Bí Xanh Tách Vỏ",
    price: 40000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/252205/bhx/hat-bi-xanh-tach-vo-luvita-lon-250g-202209261501416712.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Đậu Phộng Rang Tỏi Ớt",
    price: 30000,
    image_url:
      "https://cdn.tgdd.vn/Files/2021/11/24/1400277/cach-lam-dau-phong-rang-toi-ot-gion-tan-dam-da-an-vat-bua-com-deu-hop-202111240901593139.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Đậu Hà Lan Wasabi",
    price: 35000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/193988/bhx/dau-ha-lan-vi-wasabi-tan-tan-lon-190g-202211071420138760.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: "Hạt Sen Sấy Giòn",
    price: 50000,
    image_url:
      "https://vinamit.com.vn/wp-content/uploads/2021/11/vinamit-hat-sen-say-100g-3.jpg",
    category: "Đồ ăn nhẹ",
  },
];

function seedProducts() {
  db.serialize(() => {
    db.run("DELETE FROM products", [], (err) => {
      if (err) return console.error("Lỗi khi xóa sản phẩm cũ:", err.message);

      console.log("Đã xóa sản phẩm cũ, bắt đầu nhập kho sản phẩm mới...");
      const stmt = db.prepare(
        `INSERT INTO products (name, price, image_url, category) VALUES (?, ?, ?, ?)`
      );

      productsToSeed.forEach((product) => {
        stmt.run(
          product.name,
          product.price,
          product.image_url,
          product.category
        );
      });

      stmt.finalize((err) => {
        if (err) return console.error("Lỗi khi hoàn tất:", err.message);

        console.log(
          `Hoàn tất! Đã nhập thành công ${productsToSeed.length} sản phẩm vào kho.`
        );

        db.close((err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log("Đã đóng kết nối database.");
        });
      });
    });
  });
}

// Chạy hàm seed
seedProducts();
