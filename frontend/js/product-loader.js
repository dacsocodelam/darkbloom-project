document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("product-list-container");
  const categoryList = document.getElementById("category-filter-list");

  // Nếu không tìm thấy các khu vực cần thiết, không làm gì cả
  if (!productContainer || !categoryList) {
    console.error(
      "Lỗi cấu trúc HTML: Thiếu 'product-list-container' hoặc 'category-filter-list'"
    );
    return;
  }

  /**
   * Hàm tạo giao diện cho một sản phẩm (BẢN THIẾT KẾ BỊ THIẾU)
   * @param {object} product - Dữ liệu của một sản phẩm từ API
   * @returns {HTMLElement} - Một thẻ div chứa toàn bộ HTML của card sản phẩm
   */
  function createProductCard(product) {
    const cardCol = document.createElement("div");
    cardCol.className = "col";

    // Lấy ngôn ngữ hiện tại
    const lang = typeof currentLang === "function" ? currentLang() : "vi";
    // Parse name nếu là string
    let nameObj = product.name;
    if (typeof nameObj === "string") {
      try {
        nameObj = JSON.parse(nameObj);
      } catch (e) {
        nameObj = { vi: product.name };
      }
    }
    const displayName = nameObj[lang] || nameObj["vi"];

    const priceFormatted = new Intl.NumberFormat("vi-VN").format(product.price);

    cardCol.innerHTML = `
            <div class="card h-100 product-card" 
                 data-product-id="${product.id}" 
                 data-product-name="${displayName}" 
                 data-product-name-obj='${JSON.stringify(nameObj)}'
                 data-product-price="${product.price}">
                <div class="product-image-container">
                    <img src="${
                      product.image_url || "images/default-product.png"
                    }" class="card-img-top" alt="${displayName}" style="height: 200px; object-fit: cover;">
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${displayName}</h5>
                    <p class="card-text fs-5 fw-bold text-primary">${priceFormatted}đ</p>
                    <div class="mt-auto">
                        <div class="row g-2 align-items-center">
                            <div class="col-6">
                                 <select class="form-select form-select-sm product-size">
                                    <option value="M" selected>Size M</option>
                                    <option value="L">Size L</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <input type="number" class="form-control form-control-sm product-quantity" value="1" min="1">
                            </div>
                        </div>
                        <button class="btn btn-primary w-100 mt-2 add-to-cart-btn">Mua ngay</button>
                    </div>
                </div>
            </div>
        `;
    return cardCol;
  }

  /**
   * Hàm tải sản phẩm từ API và hiển thị lên trang
   * @param {string} category - Loại sản phẩm cần lọc (mặc định là 'all')
   */
  async function fetchAndDisplayProducts(category = "all") {
    let url = "${API_BASE_URL}/api/products";
    if (category !== "all") {
      url += `?category=${encodeURIComponent(category)}`;
    }

    productContainer.innerHTML =
      '<div class="text-center w-100"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    try {
      const response = await fetch(url);
      const result = await response.json();

      productContainer.innerHTML = ""; // Xóa chữ "loading"
      if (result.data && result.data.length > 0) {
        result.data.forEach((product) => {
          console.log(product); // Thêm dòng này trong vòng lặp forEach
          const productCard = createProductCard(product);
          productContainer.appendChild(productCard);
        });
      } else {
        productContainer.innerHTML =
          '<p class="text-center w-100">Không tìm thấy sản phẩm nào.</p>';
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      productContainer.innerHTML =
        '<p class="text-center text-danger w-100">Không thể tải danh sách sản phẩm.</p>';
    }
  }

  // --- LẮNG NGHE SỰ KIỆN CLICK VÀO DANH MỤC ---
  categoryList.addEventListener("click", (event) => {
    event.preventDefault();
    const link = event.target.closest(".category-link");
    if (!link) return;

    categoryList.querySelector(".active")?.classList.remove("active");
    link.classList.add("active");

    const category = link.dataset.category;
    fetchAndDisplayProducts(category);
  });

  // --- KHỞI CHẠY LẦN ĐẦU ---
  fetchAndDisplayProducts("all");
});
