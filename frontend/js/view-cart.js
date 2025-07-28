document.addEventListener("DOMContentLoaded", () => {
  // --- Khai báo các "diễn viên" chính trên trang ---
  const cartContainer = document.getElementById("cart-items-container");
  const totalPriceEl = document.getElementById("total-price");
  const selectAllCheckbox = document.getElementById("select-all-checkbox");
  const confirmButton = document.getElementById("confirm-order-btn");

  // === LỚP PHÒNG THỦ: KIỂM TRA SỰ TỒN TẠI CỦA CÁC THẺ HTML ===
  // Nếu một trong các thẻ này không có trên trang, sẽ báo lỗi và dừng lại.
  if (!cartContainer || !totalPriceEl || !selectAllCheckbox || !confirmButton) {
    console.error(
      "Lỗi cấu trúc HTML: Trang cart.html thiếu một trong các ID cần thiết: cart-items-container, total-price, select-all-checkbox, hoặc confirm-order-btn."
    );
    return;
  }

  // --- Các hàm tiện ích ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // --- Các hàm xử lý chính ---

  /**
   * Tính toán và cập nhật lại tổng tiền dựa trên các sản phẩm được chọn
   */
  function updateTotalPrice() {
    let total = 0;
    document
      .querySelectorAll(".cart-item-checkbox:checked")
      .forEach((checkbox) => {
        const row = checkbox.closest("tr");
        if (row && row.dataset.price && row.querySelector(".quantity-input")) {
          const price = parseFloat(row.dataset.price);
          const quantity = parseInt(
            row.querySelector(".quantity-input").value,
            10
          );
          total += price * quantity;
        }
      });
    totalPriceEl.textContent = formatCurrency(total);
  }

  /**
   * Tạo ra một hàng (<tr>) cho một sản phẩm trong giỏ
   */
  function createCartItemRow(item) {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 1;
    const tableRow = document.createElement("tr");
    tableRow.dataset.cartItemId = item.cartItemId;
    tableRow.dataset.price = itemPrice;
    tableRow.innerHTML = `
            <td class="text-center"><input type="checkbox" class="cart-item-checkbox" checked></td>
            <td>
                <strong>${item.name}</strong><br>
                <small class="text-muted">Size: ${item.size || "N/A"}</small>
            </td>
            <td>${formatCurrency(itemPrice)}</td>
            <td class="text-center">
                <div class="input-group justify-content-center" style="width: 120px;">
                    <button class="btn btn-outline-secondary btn-sm btn-decrease" type="button">-</button>
                    <input type="number" class="form-control quantity-input" value="${itemQuantity}" min="1" style="-moz-appearance: textfield;">
                    <button class="btn btn-outline-secondary btn-sm btn-increase" type="button">+</button>
                </div>
            </td>
            <td class="text-end fw-bold item-total">${formatCurrency(
              itemPrice * itemQuantity
            )}</td>
            <td class="text-center"><button class="btn btn-danger btn-sm delete-item-btn" type="button"><i class="bi bi-trash"></i></button></td>
        `;
    return tableRow;
  }

  /**
   * Tải dữ liệu giỏ hàng từ server và vẽ lên giao diện
   */
  async function renderCart() {
    confirmButton.disabled = true;
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Không thể kết nối tới server");
      const cartData = await response.json();

      cartContainer.innerHTML = "";
      if (!cartData.data || cartData.data.length === 0) {
        cartContainer.innerHTML =
          '<tr><td colspan="6" class="text-center p-4">Giỏ hàng của bạn đang trống...</td></tr>';
        selectAllCheckbox.disabled = true;
      } else {
        cartData.data.forEach((item) =>
          cartContainer.appendChild(createCartItemRow(item))
        );
        selectAllCheckbox.disabled = false;
        confirmButton.disabled = false;
      }
      updateTotalPrice();
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      cartContainer.innerHTML =
        '<tr><td colspan="6" class="text-center text-danger p-4">Không thể tải giỏ hàng!</td></tr>';
    }
  }

  /**
   * Gửi yêu cầu cập nhật số lượng của một sản phẩm lên server
   */
  async function updateItemQuantityOnServer(cartItemId, quantity) {
    try {
      await fetch(`/api/cart/item/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      console.error(`Lỗi cập nhật số lượng cho item ${cartItemId}:`, error);
    }
  }

  // --- Lắng nghe các sự kiện tương tác ---

  // Sự kiện xảy ra bên trong bảng giỏ hàng (tăng, giảm, xóa, nhập số lượng)
  cartContainer.addEventListener("input", (event) => {
    if (event.target.classList.contains("quantity-input")) {
      const row = event.target.closest("tr");
      const quantity = parseInt(event.target.value, 10) || 1;

      row.querySelector(".item-total").textContent = formatCurrency(
        parseFloat(row.dataset.price) * quantity
      );
      updateTotalPrice();
      updateItemQuantityOnServer(row.dataset.cartItemId, quantity);
    }
  });

  cartContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const row = button.closest("tr");
    if (!row || !row.dataset.cartItemId) return;

    const cartItemId = row.dataset.cartItemId;
    const quantityInput = row.querySelector(".quantity-input");
    let quantity = parseInt(quantityInput.value, 10);

    if (button.classList.contains("btn-increase")) {
      quantityInput.value = ++quantity;
      quantityInput.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (button.classList.contains("btn-decrease") && quantity > 1) {
      quantityInput.value = --quantity;
      quantityInput.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (button.classList.contains("delete-item-btn")) {
      if (confirm("Đại ka chắc chắn muốn xóa sản phẩm này?")) {
        row.style.opacity = "0.5";
        const response = await fetch(`/api/cart/item/${cartItemId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        row.remove();
        if (typeof updateCartCount === "function")
          updateCartCount(data.totalItems);
        updateTotalPrice();
      }
    }
  });

  // Sự kiện cho các checkbox
  cartContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("cart-item-checkbox")) {
      updateTotalPrice();
    }
  });

  selectAllCheckbox.addEventListener("change", () => {
    document
      .querySelectorAll(".cart-item-checkbox")
      .forEach((checkbox) => (checkbox.checked = selectAllCheckbox.checked));
    updateTotalPrice();
  });

  // Sự kiện cho nút Xác nhận đặt hàng
  confirmButton.addEventListener("click", () => {
    const selectedItems = Array.from(
      document.querySelectorAll(".cart-item-checkbox:checked")
    );
    if (selectedItems.length === 0) {
      alert("Đại ca chưa chọn sản phẩm nào để đặt hàng!");
      return;
    }

    confirmButton.disabled = true;
    confirmButton.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';

    fetch("/api/orders/create", { method: "POST" })
      .then((res) => (res.ok ? res.json() : Promise.reject("Lỗi server")))
      .then((data) => {
        alert(`Đặt hàng thành công!\nMã đơn hàng của bạn là: ${data.orderId}`);
        if (typeof updateCartCount === "function") updateCartCount(0);
        window.location.href = "/index.html";
      })
      .catch((err) => {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
        confirmButton.disabled = false;
        confirmButton.textContent = "Xác nhận đặt hàng";
      });
  });

  // --- Khởi chạy ---
  renderCart();
});
