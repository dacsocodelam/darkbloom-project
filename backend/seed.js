const db = require("./database.js");

const productsToSeed = [
  // === Cà phê (8 món) ===
  {
    name: {
      vi: "Cà phê Đen",
      en: "Black Coffee",
      jp: "ブラックコーヒー",
      cn: "黑咖啡",
      mn: "Хар кофе",
    },
    price: 25000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_Phin_Den_Da_1.png",
    category: "Cà phê",
  },
  {
    name: {
      vi: "Cà phê Sữa",
      en: "Milk Coffee",
      jp: "ミルクコーヒー",
      cn: "牛奶咖啡",
      mn: "Сүүтэй кофе",
    },
    price: 29000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_Phin_Sua_Da_1.png",
    category: "Cà phê",
  },
  {
    name: {
      vi: "Bạc Xỉu",
      en: "White Coffee (Bac Xiu)",
      jp: "バクシウ",
      cn: "越南白咖啡",
      mn: "Цагаан кофе (Бак Сиу)",
    },
    price: 29000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_Bac_Xiu_Da_1.png",
    category: "Cà phê",
  },
  {
    name: {
      vi: "Cà phê dừa",
      en: "Coconut Coffee",
      jp: "ココナッツコーヒー",
      cn: "椰子咖啡",
      mn: "Кокосны кофе",
    },
    price: 50000,
    image_url:
      "https://cdn.tgdd.vn/Files/2021/08/11/1374530/cung-bat-trend-lam-ca-phe-dua-thom-beo-cuc-de-tai-nha-202108110903086938.jpg",
    category: "Cà phê",
  },
  {
    name: {
      vi: "Cà phê muối",
      en: "Salt Coffee",
      jp: "塩コーヒー",
      cn: "盐咖啡",
      mn: "Давстай кофе",
    },
    price: 45000,
    image_url:
      "https://cdn.tgdd.vn/2021/03/CookProduct/Ca-phe-muoi-la-gi-nguon-goc-va-cach-pha-che-ca-phe-muoi-thom-ngon-chuan-vi-avt-1200x676.jpg",
    category: "Cà phê",
  },
  {
    name: {
      vi: "Cà phê trứng",
      en: "Egg Coffee",
      jp: "エッグコーヒー",
      cn: "鸡蛋咖啡",
      mn: "Өндөгтэй кофе",
    },
    price: 55000,
    image_url:
      "https://static.vinwonders.com/production/cach-lam-ca-phe-trung-1.jpg",
    category: "Cà phê",
  },
  {
    name: {
      vi: "Espresso",
      en: "Espresso",
      jp: "エスプレッソ",
      cn: "意式浓缩咖啡",
      mn: "Эспрессо",
    },
    price: 40000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/03_2023/HLC_PHINDI_CHOCO_1.png",
    category: "Cà phê",
  },
  {
    name: {
      vi: "Americano",
      en: "Americano",
      jp: "アメリカーノ",
      cn: "美式咖啡",
      mn: "Американо",
    },
    price: 45000,
    image_url:
      "https://lifestyle-prod-content.press.discovery.com/wp-content/uploads/2023/02/14172457/what-is-an-americano-725x482.jpg",
    category: "Cà phê",
  },

  // === Trà & Trà sữa (11 món) ===
  {
    name: {
      vi: "Trà sữa trân châu",
      en: "Bubble Milk Tea",
      jp: "タピオカミルクティー",
      cn: "珍珠奶茶",
      mn: "Сүүн цай (Боба)",
    },
    price: 50000,
    image_url: "https://gongcha.com.vn/wp-content/uploads/tra-sua-okinawa.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà sữa khoai môn",
      en: "Taro Milk Tea",
      jp: "タロイモミルクティー",
      cn: "芋头奶茶",
      mn: "Таро сүүн цай",
    },
    price: 55000,
    image_url:
      "https://cdn.tgdd.vn/Files/2020/04/10/1247997/cach-lam-tra-sua-khoai-mon-deo-thom-chuan-vi-ai-cung-me-202201131122170327.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà sữa socola",
      en: "Chocolate Milk Tea",
      jp: "チョコレートミルクティー",
      cn: "巧克力奶茶",
      mn: "Шоколадтай сүүн цай",
    },
    price: 55000,
    image_url: "https://cdn.beptruong.edu.vn/wp-content/uploads/2018/07/tra-sua-socola-tran-chau.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà sữa matcha",
      en: "Matcha Milk Tea",
      jp: "抹茶ミルクティー",
      cn: "抹茶奶茶",
      mn: "Матча сүүн цай",
    },
    price: 52000,
    image_url:
      "https://static.hotdeal.vn/images/130/1303862/400x400/tra-sua-matcha-tran-chau-size-l-kem-lop-macchiato-thom-beo-hap-dan.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà sữa trân châu đường đen",
      en: "Brown Sugar Bubble Milk Tea",
      jp: "黒糖タピオカミルクティー",
      cn: "黑糖珍珠奶茶",
      mn: "Хар элсэн чихэртэй боба сүүн цай",
    },
    price: 58000,
    image_url:
      "https://www.highlandscoffee.com.vn/vnt_upload/product/05_2023/HLC_New_logo_5.1_Products__SUA_DA_DUONG_DEN.png",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà sữa Oolong",
      en: "Oolong Milk Tea",
      jp: "ウーロンミルクティー",
      cn: "乌龙奶茶",
      mn: "Улун сүүн цай",
    },
    price: 48000,
    image_url:
      "https://tocotocotea.com/wp-content/uploads/2022/04/Tra-sua-Olong-Tran-chau-Baby-Kem-Cafe.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà sữa Thái Xanh",
      en: "Thai Green Milk Tea",
      jp: "タイグリーンミルクティー",
      cn: "泰式绿奶茶",
      mn: "Тай ногоон сүүн цай",
    },
    price: 45000,
    image_url:
      "https://cdn.dayphache.edu.vn/wp-content/uploads/2020/02/tra-sua-thai-xanh.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà Sữa Okinawa",
      en: "Okinawa Milk Tea",
      jp: "沖縄ミルクティー",
      cn: "冲绳奶茶",
      mn: "Окинава сүүн цай",
    },
    price: 25000,
    image_url: "https://gongcha.com.vn/wp-content/uploads/tra-sua-okinawa.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà Oolong túi lọc",
      en: "Oolong Tea Bag",
      jp: "ウーロンティーバッグ",
      cn: "乌龙茶包",
      mn: "Улун цайны уут",
    },
    price: 99000,
    image_url: "https://phela.vn/wp-content/uploads/oolong-tea-bag.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà đào cam sả",
      en: "Peach Citrus Lemongrass Tea",
      jp: "ピーチシトラスレモングラスティー",
      cn: "桃子柑橘香茅茶",
      mn: "Тоор, жүрж, лимон өвстэй цай",
    },
    price: 48000,
    image_url: "https://phela.vn/wp-content/uploads/peach-citrus-tea.jpg",
    category: "Trà sữa",
  },
  {
    name: {
      vi: "Trà Matcha",
      en: "Matcha Tea",
      jp: "抹茶ティー",
      cn: "抹茶茶",
      mn: "Матча цай",
    },
    price: 52000,
    image_url:
      "https://static.hotdeal.vn/images/130/1303862/400x400/tra-sua-matcha-tran-chau-size-l-kem-lop-macchiato-thom-beo-hap-dan.jpg",
    category: "Trà sữa",
  },

  // === Sữa chua (8 món) ===
  {
    name: {
      vi: "Sữa chua việt quất",
      en: "Blueberry Yogurt",
      jp: "ブルーベリーヨーグルト",
      cn: "蓝莓酸奶",
      mn: "Нэрстэй тараг",
    },
    price: 55000,
    image_url:
      "https://bakingmad.com/content/uploads/2022/05/Blueberry-Yoghurt-Slices-1080x1080.jpg",
    category: "Sữa chua",
  },
  {
    name: {
      vi: "Sữa chua dâu tây",
      en: "Strawberry Yogurt",
      jp: "イチゴヨーグルト",
      cn: "草莓酸奶",
      mn: "Гүзээлзгэнэтэй тараг",
    },
    price: 48000,
    image_url:
      "https://dayphache.edu.vn/wp-content/uploads/2016/08/sua-chua-dau-tay.jpg",
    category: "Sữa chua",
  },
  {
    name: {
      vi: "Sữa chua xoài",
      en: "Mango Yogurt",
      jp: "マンゴーヨーグルト",
      cn: "芒果酸奶",
      mn: "Манжинтай тараг",
    },
    price: 48000,
    image_url:
      "https://static.vinwonders.com/production/cach-lam-sua-chua-xoai-2.jpg",
    category: "Sữa chua",
  },
  {
    name: {
      vi: "Sữa chua chanh dây",
      en: "Passion Fruit Yogurt",
      jp: "パッションフルーツヨーグルト",
      cn: "百香果酸奶",
      mn: "Чацарганатай тараг",
    },
    price: 45000,
    image_url:
      "https://cdn.tgdd.vn/Files/2020/07/22/1271815/cach-lam-sua-chua-chanh-day-thom-ngon-thanh-mat-giai-nhiet-mua-he-202007221535255474.jpg",
    category: "Sữa chua",
  },
  {
    name: {
      vi: "Sữa chua nha đam",
      en: "Aloe Vera Yogurt",
      jp: "アロエヨーグルト",
      cn: "芦荟酸奶",
      mn: "Зуун насттай тараг",
    },
    price: 40000,
    image_url:
      "https://www.vinamilk.com.vn/sua-chua-vinamilk/wp-content/uploads/2022/01/scad-nha-dam-probi_new-2022.png",
    category: "Sữa chua",
  },
  {
    name: {
      vi: "Sữa chua nếp cẩm",
      en: "Black Glutinous Rice Yogurt",
      jp: "黒もち米ヨーグルト",
      cn: "黑糯米酸奶",
      mn: "Хар будаа тараг",
    },
    price: 35000,
    image_url:
      "https://cdn.tgdd.vn/Files/2018/06/15/1095598/sua-chua-nep-cam-tot-cho-he-tieu-hoa-tim-mach-va-giam-can_760x380.jpg",
    category: "Sữa chua",
  },
  {
    name: {
      vi: "Sữa chua mít",
      en: "Jackfruit Yogurt",
      jp: "ジャックフルーツヨーグルト",
      cn: "菠萝蜜酸奶",
      mn: "Жакфруттай тараг",
    },
    price: 42000,
    image_url:
      "https://cdn.cet.edu.vn/wp-content/uploads/2019/04/sua-chua-mit-thom-mat.jpg",
    category: "Sữa chua",
  },
  {
    name: {
      vi: "Sữa chua phô mai",
      en: "Cheese Yogurt",
      jp: "チーズヨーグルト",
      cn: "芝士酸奶",
      mn: "Бяслагтай тараг",
    },
    price: 38000,
    image_url:
      "https://cdn.dayphache.edu.vn/wp-content/uploads/2019/07/sua-chua-pho-mai.jpg",
    category: "Sữa chua",
  },

  // === Đồ ăn nhẹ (10 loại hạt) ===
  {
    name: {
      vi: "Hạt Điều Rang Muối",
      en: "Roasted Cashew Nuts with Salt",
      jp: "塩ローストカシューナッツ",
      cn: "盐烤腰果",
      mn: "Давстай шарсан самар",
    },
    price: 48000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/299694/bhx/hat-dieu-rang-muoi-vo-lua-tan-tan-goi-140g-202302211624388147.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Hạt Hạnh Nhân Rang Bơ",
      en: "Butter Roasted Almonds",
      jp: "バターアーモンド",
      cn: "黄油烤杏仁",
      mn: "Цөцгийн тосонд шарсан бүйлс",
    },
    price: 52000,
    image_url:
      "https://image.voso.vn/users/vtfamicare/images/c6f01116131d451ebb3d55685a73e168.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Hạt Dẻ Cười",
      en: "Pistachios",
      jp: "ピスタチオ",
      cn: "开心果",
      mn: "Фисташки",
    },
    price: 45000,
    image_url: "https://www.ecohealth.com.vn/wp-content/uploads/2020/07/hat-de-cuoi.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Hạt Macca Sấy Nứt Vỏ",
      en: "Roasted Macadamia Nuts",
      jp: "ローストマカダミアナッツ",
      cn: "烤夏威夷果",
      mn: "Шарсан макадамия самар",
    },
    price: 65000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/252204/bhx/hat-mac-ca-say-nut-vo-luvita-lon-250g-202209261502444391.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Hạt Óc Chó",
      en: "Walnuts",
      jp: "クルミ",
      cn: "核桃",
      mn: "Гүргэм самар",
    },
    price: 58000,
    image_url: "https://frutina.com.vn/wp-content/uploads/2021/11/hat-oc-cho-3.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Hạt Hướng Dương",
      en: "Sunflower Seeds",
      jp: "ひまわりの種",
      cn: "葵花籽",
      mn: "Наранцэцгийн үр",
    },
    price: 22000,
    image_url:
      "https://www.thuocdantoc.org/wp-content/uploads/2021/06/hat-huong-duong.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Hạt Bí Xanh Tách Vỏ",
      en: "Shelled Pumpkin Seeds",
      jp: "かぼちゃの種（殻なし）",
      cn: "去壳南瓜子",
      mn: "Хулууны үр",
    },
    price: 40000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/252205/bhx/hat-bi-xanh-tach-vo-luvita-lon-250g-202209261501416712.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Đậu Phộng Rang Tỏi Ớt",
      en: "Chili Garlic Roasted Peanuts",
      jp: "チリガーリックピーナッツ",
      cn: "辣味蒜香花生",
      mn: "Чили сармисны шарсан газрын самар",
    },
    price: 30000,
    image_url:
      "https://cdn.tgdd.vn/Files/2021/11/24/1400277/cach-lam-dau-phong-rang-toi-ot-gion-tan-dam-da-an-vat-bua-com-deu-hop-202111240901593139.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Đậu Hà Lan Wasabi",
      en: "Wasabi Green Peas",
      jp: "わさびグリーンピース",
      cn: "芥末青豆",
      mn: "Васабитай ногоон вандуй",
    },
    price: 35000,
    image_url:
      "https://cdn.tgdd.vn/Products/Images/8788/193988/bhx/dau-ha-lan-vi-wasabi-tan-tan-lon-190g-202211071420138760.jpg",
    category: "Đồ ăn nhẹ",
  },
  {
    name: {
      vi: "Hạt Sen Sấy Giòn",
      en: "Crispy Roasted Lotus Seeds",
      jp: "カリカリ蓮の実",
      cn: "脆烤莲子",
      mn: "Шарсан лянхуан үр",
    },
    price: 50000,
    image_url: "https://vinamit.com.vn/wp-content/uploads/2021/11/vinamit-hat-sen-say-100g-3.jpg",
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
          JSON.stringify(product.name),
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
