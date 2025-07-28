document.addEventListener("DOMContentLoaded", () => {
  // --- Khai báo các "diễn viên" chính trên trang ---
  const productForm = document.getElementById("product-form");
  const productTableBody = document.getElementById("product-table-body");
  const formTitle = document.getElementById("form-title");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  // Các ô input trong form
  const productIdInput = document.getElementById("product-id");
  const productNameInput = document.getElementById("product-name");
  const productPriceInput = document.getElementById("product-price");
  const productCategoryInput = document.getElementById("product-category");
  const productImageInput = document.getElementById("product-image");

  // Nếu không ở đúng trang quản lý sản phẩm, không làm gì cả
  if (!productForm || !productTableBody) {
    return;
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  // --- CÁC HÀM XỬ LÝ ---

  // Hàm tải và hiển thị tất cả sản phẩm
  async function fetchAndDisplayProducts() {
    try {
      const response = await fetch("/api/products");
      const result = await response.json();
      productTableBody.innerHTML = ""; // Xóa sạch bảng cũ
      if (result.data && result.data.length > 0) {
        result.data.forEach((product) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                        <th>${product.id}</th>
                        <td>${product.name}</td>
                        <td>${formatCurrency(product.price)}đ</td>
                        <td>${product.category || ""}</td>
                        <td class="text-center table-actions">
                            <button class="btn btn-sm btn-warning btn-edit" data-id="${
                              product.id
                            }" title="Sửa"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-sm btn-danger btn-delete" data-id="${
                              product.id
                            }" title="Xóa"><i class="bi bi-trash"></i></button>
                        </td>
                    `;
          // Lưu trữ data vào chính row để tiện cho việc sửa
          row.dataset.productData = JSON.stringify(product);
          productTableBody.appendChild(row);
        });
      } else {
        productTableBody.innerHTML =
          '<tr><td colspan="5" class="text-center">Chưa có sản phẩm nào trong kho.</td></tr>';
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    }
  }

  // Hàm reset form về trạng thái "Thêm mới"
  function resetForm() {
    formTitle.textContent = "Thêm Sản Phẩm Mới";
    productForm.reset();
    productIdInput.value = "";
    cancelEditBtn.style.display = "none";
  }

  // --- LẮNG NGHE SỰ KIỆN ---

  // Sự kiện GỬI FORM (Thêm mới hoặc Cập nhật)
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = productIdInput.value;
    const productData = {
      name: productNameInput.value,
      price: productPriceInput.value,
      category: productCategoryInput.value,
      image_url: productImageInput.value,
    };

    const isUpdating = !!id;
    const url = isUpdating ? `/api/products/${id}` : "/api/products";
    const method = isUpdating ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        alert(`Đã ${isUpdating ? "cập nhật" : "thêm"} sản phẩm thành công!`);
        resetForm();
        fetchAndDisplayProducts();
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
    }
  });

  // Sự kiện bấm nút trong bảng (Sửa hoặc Xóa)
  productTableBody.addEventListener("click", async (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const id = button.dataset.id;

    // Nếu bấm nút SỬA
    if (button.classList.contains("btn-edit")) {
      const row = button.closest("tr");
      const productData = JSON.parse(row.dataset.productData);

      formTitle.textContent = `Sửa Sản Phẩm #${id}`;
      productIdInput.value = productData.id;
      productNameInput.value = productData.name;
      productPriceInput.value = productData.price;
      productCategoryInput.value = productData.category;
      productImageInput.value = productData.image_url;

      cancelEditBtn.style.display = "block";
      window.scrollTo(0, 0);
    }

    // Nếu bấm nút XÓA
    if (button.classList.contains("btn-delete")) {
      if (
        confirm(
          `Đại ca chắc chắn muốn XÓA sản phẩm #${id}? Hành động này không thể hoàn tác!`
        )
      ) {
        try {
          const response = await fetch(`/api/products/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            alert("Xóa sản phẩm thành công!");
            fetchAndDisplayProducts();
          } else {
            alert("Có lỗi xảy ra, không thể xóa sản phẩm.");
          }
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm:", error);
        }
      }
    }
  });

  // Nút hủy sửa
  cancelEditBtn.addEventListener("click", resetForm);

  // --- KHỞI CHẠY ---
  fetchAndDisplayProducts();
});
