/**
 * Cập nhật số lượng sản phẩm hiển thị trên icon giỏ hàng.
 * @param {number} [count] - Số lượng cụ thể để hiển thị. Nếu không có, hàm sẽ tự gọi API để lấy.
 */
function updateCartCount(count) {
  const cartCountEl = document.getElementById("cart-item-count");
  if (!cartCountEl) return;

  if (count !== undefined) {
    cartCountEl.textContent = count;
    return;
  }

  // Nếu không có số lượng cụ thể, tự gọi API để lấy số mới nhất
  fetch("${API_BASE_URL}/api/cart") // <-- Đã cập nhật URL
    .then((res) => res.json())
    .then((data) => {
      cartCountEl.textContent = data.totalItems || 0;
    })
    .catch((err) => console.error("Không thể cập nhật số lượng giỏ hàng", err));
}

document.addEventListener("DOMContentLoaded", () => {
  // Luôn cập nhật số lượng trên icon khi bất kỳ trang nào tải xong
  updateCartCount();

  // Tìm khu vực chứa toàn bộ sản phẩm (chỉ có trên trang products.html)
  const productContainer = document.getElementById("product-list-container");

  // Chỉ chạy logic "Thêm vào giỏ" nếu đang ở trang có khu vực sản phẩm
  if (productContainer) {
    // Giao nhiệm vụ cho "Tổ trưởng" (productContainer)
    productContainer.addEventListener("click", (event) => {
      // "Tổ trưởng" kiểm tra xem thứ vừa được click có phải là nút "Mua ngay" không
      const button = event.target.closest(".add-to-cart-btn");

      // Nếu đúng là nút "Mua ngay" thì mới hành động
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
          name: card.dataset.productName,
          price: card.dataset.productPrice,
          size: productSize,
          quantity: card.querySelector(".product-quantity").value,
        };

        fetch("${API_BASE_URL}/api/cart/add", {
          // <-- Đã cập nhật URL
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
            alert(data.message); // Sử dụng alert gốc như đại ca muốn
            updateCartCount(data.cartTotalItems);
          })
          .catch((error) => {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            alert("Có lỗi xảy ra, không thể thêm vào giỏ hàng!");
          })
          .finally(() => {
            button.disabled = false;
            button.textContent = "Mua ngay";
          });
      }
    });
  }
});
