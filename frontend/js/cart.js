// File này dùng cho products.html và được gọi bởi các trang khác

function updateCartCount(count) {
  const cartCountEl = document.getElementById("cart-item-count");
  if (!cartCountEl) return;
  if (count !== undefined) {
    cartCountEl.textContent = count;
    return;
  }
  fetch("/api/cart")
    .then((res) => res.json())
    .then((data) => {
      cartCountEl.textContent = data.totalItems || 0;
    })
    .catch((err) => console.error("Không thể cập nhật số lượng giỏ hàng", err));
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  // === THAY ĐỔI CỐT LÕI NẰM Ở ĐÂY ===
  // 1. Tìm "Tổ trưởng" là khu vực chứa toàn bộ sản phẩm
  const productContainer = document.getElementById("product-list-container");

  // 2. Chỉ chạy logic này nếu đang ở trang có khu vực đó (tức là trang products.html)
  if (productContainer) {
    // 3. Giao nhiệm vụ cho "Tổ trưởng"
    productContainer.addEventListener("click", (event) => {
      // 4. Kiểm tra xem thứ bị click có phải là nút "Mua ngay" không
      const button = event.target.closest(".add-to-cart-btn");

      // 5. Nếu đúng là nút "Mua ngay" thì mới xử lý
      if (button) {
        event.preventDefault();
        button.disabled = true;
        button.innerHTML =
          '<span class="spinner-border spinner-border-sm"></span>';

        const card = button.closest(".product-card");
        const sizeElement = card.querySelector(".product-size");
        const productSize = sizeElement ? sizeElement.value : "N/A";

        const product = {
          id: card.dataset.productId,
          name: card.dataset.productNameObj, // <-- Lưu cả object name (JSON string)
          price: card.dataset.productPrice,
          size: productSize,
          quantity: card.querySelector(".product-quantity").value,
        };

        fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Lỗi server: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            // ---- ĐÃ SỬA ----
            showToast(data.message); // Hiển thị thông báo toast thay vì alert
            updateCartCount(data.cartTotalItems);
          })
          .catch((error) => {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            // ---- ĐÃ SỬA ----
            showToast("Có lỗi xảy ra, không thể thêm vào giỏ hàng!"); // Hiển thị thông báo lỗi
          })
          .finally(() => {
            button.disabled = false;
            button.textContent = "Mua ngay";
          });
      }
    });
  }
});
