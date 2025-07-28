(function ($) {
  "use strict";

  // Hiệu ứng AOS Animations
  AOS.init();

  // Tự động đóng menu trên điện thoại khi bấm
  $(".navbar-nav .nav-link").click(function () {
    $(".navbar-collapse").collapse("hide");
  });

  // Chức năng cuộn mượt cho các link trên trang chủ
  $('a[href*="#"]').click(function (event) {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        event.preventDefault();
        $("html, body").animate(
          {
            scrollTop: target.offset().top - 76,
          },
          1000
        );
      }
    }
  });
})(window.jQuery);

/**
 * Hiển thị một thông báo nhanh (toast notification) trên màn hình.
 */
function showToast(message, duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.error("Không tìm thấy thẻ #toast-container để hiển thị thông báo.");
    return;
  }
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
      if (toast) {
        toast.remove();
      }
    });
  }, duration);
}

// Hàm dịch chuỗi có biến động (alert/toast)
function t(key, params) {
  const lang = typeof currentLang === "function" ? currentLang() : "vi";
  let str =
    translations[lang] && translations[lang][key]
      ? translations[lang][key]
      : key;
  if (params) {
    Object.keys(params).forEach((k) => {
      str = str.replace(new RegExp("{" + k + "}", "g"), params[k]);
    });
  }
  return str;
}

// =======================================================
//          KHỞI TẠO TẤT CẢ LOGIC KHI TRANG TẢI XONG
// =======================================================
document.addEventListener("DOMContentLoaded", function () {
  // --- Logic cho Cart Sidebar ---
  const cartIcon = document.querySelector(".cart-icon");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartOverlay = document.getElementById("cart-overlay");

  function toggleCart() {
    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.toggle("hidden");
      cartOverlay.classList.toggle("hidden");
    }
  }

  if (cartIcon) {
    cartIcon.addEventListener("click", function (event) {
      event.preventDefault();
      toggleCart();
    });
  }
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", toggleCart);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", toggleCart);
  }

  // --- Logic cho Form Tuyển dụng ---
  const applicationForm = document.getElementById("careers-applicationForm");
  if (applicationForm) {
    applicationForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const successMessage = document.getElementById("success-message");
      const formRows = applicationForm.querySelector(".row");
      if (formRows) {
        formRows.style.display = "none";
      }
      if (successMessage) {
        successMessage.style.display = "block";
      }
      console.log("Form ứng tuyển đã được gửi đi!");
    });
  }

  // === LOGIC CHO FORM ĐẶT BÀN (ĐÃ SỬA LỖI) ===
  const reservationForm = document.getElementById("reservation-form");
  if (reservationForm) {
    // Ngăn không cho đặt ngày trong quá khứ
    const dateInput = document.getElementById("date");
    if (dateInput) {
      dateInput.min = new Date().toISOString().split("T")[0];
    }

    reservationForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitButton = reservationForm.querySelector(
        'button[type="submit"]'
      );
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span> Đang gửi...';

      // Lấy dữ liệu từ các select cho giờ và phút
      const hourSelect = reservationForm.querySelector("select:nth-of-type(1)");
      const minuteSelect = reservationForm.querySelector(
        "select:nth-of-type(2)"
      );

      // Dữ liệu đã được sửa lại cho đúng với tên cột trong database và API
      const bookingData = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        guests: document.getElementById("people").value,
        bookingDate: document.getElementById("date").value,
        bookingTime: `${hourSelect.value}:${minuteSelect.value}`,
      };

      try {
        // API endpoint đã được sửa lại cho đúng
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        });

        const result = await response.json();

        if (response.ok) {
          showToast("✅ Đặt bàn thành công! Cảm ơn bạn.");
          reservationForm.reset();
        } else {
          throw new Error(result.message || "Lỗi không xác định từ server.");
        }
      } catch (error) {
        console.error("Lỗi khi đặt bàn:", error);
        showToast(`Lỗi: ${error.message || "Không thể gửi thông tin."}`);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML =
          '<i class="bi bi-calendar-check"></i> Đặt Bàn Ngay';
      }
    });
  }

  // --- Logic cho Phần Thực đơn ---
  const menuSection = document.getElementById("menu-section");
  if (menuSection) {
    const productGrid = document.getElementById("menu-product-grid");
    const categoryList = document.querySelector(".category-list");
    const currentCategoryTitle = document.getElementById(
      "current-category-title"
    );
    const cartItemsList = document.querySelector(".menu-cart .cart-items-list");
    const cartTotalPriceEl = document.querySelector(".menu-cart .total-price");
    const checkoutBtn = document.querySelector(".menu-cart .btn-checkout");
    let miniCart = [];

    async function loadCategories() {
      try {
        const response = await fetch("/api/products/categories");
        const result = await response.json();
        const categories = result.data;

        categoryList
          .querySelectorAll('.category-item:not([data-category="Món Nổi Bật"])')
          .forEach((el) => el.remove());

        let totalProducts = 0;
        categories.forEach((cat) => {
          totalProducts += cat.productCount;
          const li = document.createElement("li");
          li.className = "category-item";
          li.dataset.category = cat.category;
          li.innerHTML = `
                      <span class="category-name">${cat.category}</span>
                      <span class="category-count">${cat.productCount}</span>
                  `;
          categoryList.appendChild(li);
        });

        const featuredCountEl = categoryList.querySelector(
          '[data-category="Món Nổi Bật"] .category-count'
        );
        if (featuredCountEl) {
          featuredCountEl.textContent = totalProducts;
        }

        attachCategoryClickEvents();
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    }

    async function fetchProducts(category) {
      try {
        productGrid.innerHTML =
          '<p class="text-center text-white-50">Đang tải...</p>';
        let apiUrl = "/api/products";
        if (category && category !== "Món Nổi Bật") {
          apiUrl += `?category=${encodeURIComponent(category)}`;
        }
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        renderProducts(result.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        productGrid.innerHTML =
          '<p class="text-center text-danger">Không thể tải thực đơn.</p>';
      }
    }

    function renderProducts(products) {
      productGrid.innerHTML = "";
      if (!products || products.length === 0) {
        productGrid.innerHTML = `<p class="text-center text-white-50" data-lang-key="cart_empty">${t(
          "cart_empty"
        )}</p>`;
        return;
      }
      const lang = typeof currentLang === "function" ? currentLang() : "vi";
      products.forEach((product) => {
        let nameObj = product.name;
        if (typeof nameObj === "string") {
          try {
            nameObj = JSON.parse(nameObj);
          } catch (e) {
            nameObj = { vi: product.name };
          }
        }
        const displayName = nameObj[lang] || nameObj["vi"];
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
          <div class="product-image-wrapper">
            <img src="${
              product.image_url
            }" alt="${displayName}" class="product-image" loading="lazy">
          </div>
          <h5 class="product-name">${displayName}</h5>
          <p class="product-price">${product.price.toLocaleString("vi-VN")}₫</p>
          <button class="add-to-cart-btn-menu" data-id="${
            product.id
          }" data-name='${JSON.stringify(nameObj)}' data-price="${
          product.price
        }" data-image_url="${product.image_url}">+</button>
        `;
        productGrid.appendChild(productCard);
      });
    }

    function updateMiniCartUI(cartData) {
      miniCart = cartData.data || [];
      cartItemsList.innerHTML = "";
      const lang = typeof currentLang === "function" ? currentLang() : "vi";
      if (miniCart.length === 0) {
        cartItemsList.innerHTML = `<p class="empty-cart-message" data-lang-key="cart_empty">${t(
          "cart_empty"
        )}</p>`;
      } else {
        miniCart.forEach((item) => {
          let displayName = item.name;
          if (typeof displayName === "string") {
            try {
              const nameObj = JSON.parse(displayName);
              displayName = nameObj[lang] || nameObj["vi"];
            } catch (e) {}
          } else if (typeof displayName === "object" && displayName !== null) {
            displayName = displayName[lang] || displayName["vi"];
          }
          const cartItemEl = document.createElement("div");
          cartItemEl.className = "mini-cart-item";
          cartItemEl.innerHTML = `
            <span class="item-name">${item.quantity} x ${displayName}</span>
            <span class="item-price">${(
              item.price * item.quantity
            ).toLocaleString("vi-VN")}₫</span>
          `;
          cartItemsList.appendChild(cartItemEl);
        });
      }
      const totalPrice = miniCart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      cartTotalPriceEl.textContent = `${totalPrice.toLocaleString("vi-VN")}₫`;
      if (typeof updateCartCount === "function") {
        updateCartCount(cartData.totalItems);
      }
    }

    async function fetchInitialCart() {
      try {
        const response = await fetch("/api/cart");
        const cartData = await response.json();
        updateMiniCartUI(cartData);
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      }
    }

    function attachCategoryClickEvents() {
      const categoryItems = document.querySelectorAll(".category-item");
      categoryItems.forEach((item) => {
        item.addEventListener("click", function () {
          const category = this.dataset.category;
          categoryItems.forEach((i) => i.classList.remove("active"));
          this.classList.add("active");
          currentCategoryTitle.textContent = category;
          fetchProducts(category);
        });
      });
    }

    productGrid.addEventListener("click", async function (event) {
      if (event.target.classList.contains("add-to-cart-btn-menu")) {
        const button = event.target;
        const lang = typeof currentLang === "function" ? currentLang() : "vi";
        let displayName = "";
        try {
          let nameObj = {};
          try {
            nameObj = JSON.parse(button.dataset.name);
            displayName = nameObj[lang] || nameObj["vi"];
          } catch (e) {
            displayName = button.dataset.name;
          }
          const product = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            image_url: button.dataset.image_url,
            quantity: 1,
          };
          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
          });
          await response.json();
          showToast(t("add_to_cart_success", { product: displayName }));
          await fetchInitialCart();
        } catch (error) {
          showToast("Lỗi, không thể thêm sản phẩm!");
        }
      }
    });

    checkoutBtn.addEventListener("click", async function () {
      if (!miniCart || miniCart.length === 0) {
        showToast(t("add_to_cart_empty"));
        return;
      }
      try {
        const response = await fetch("/api/orders/create", { method: "POST" });
        const result = await response.json();
        if (response.ok) {
          showToast(t("order_success"));
          await fetchInitialCart();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        showToast(t("order_fail", { error: error.message }));
      }
    });

    // --- KHỞI CHẠY ---
    async function initializeMenu() {
      await loadCategories();
      await fetchProducts("Món Nổi Bật");
      await fetchInitialCart();
    }

    initializeMenu();
  }
});
