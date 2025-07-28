document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const mainContent = document.getElementById("main-content");
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password-input");

  // Mật khẩu để đăng nhập vào trang admin
  const CORRECT_PASSWORD = "daikabotea";

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (passwordInput.value === CORRECT_PASSWORD) {
      loginSection.style.display = "none";
      mainContent.style.display = "block";
      initializeAdminDashboard(); // Khởi chạy dashboard sau khi đăng nhập thành công
    } else {
      alert("Sai mật khẩu, tiểu đệ!");
    }
  });

  function initializeAdminDashboard() {
    const ordersContainer = document.getElementById("orders-container");
    const connectionStatusEl = document.getElementById("connection-status");

    const formatCurrency = (amount) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);

    // --- HÀM TẠO GIAO DIỆN ĐƠN HÀNG (ĐÃ NÂNG CẤP VỚI GIAO DIỆN MỚI) ---
    function createOrderCard(order) {
      const statusClassMap = {
        Mới: "status-moi",
        "Đã tiếp nhận": "status-da-tiep-nhan",
        "Đang xử lý": "status-dang-xu-ly",
        "Hoàn thành": "status-hoan-thanh",
        "Đã hủy": "status-da-huy",
      };
      const statusClass = statusClassMap[order.status] || "bg-secondary";

      let itemsTable = `
        <table class="table table-sm table-bordered mt-2 mb-3">
          <thead class="table-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Tên sản phẩm</th>
              <th scope="col" class="text-center">SL</th>
              <th scope="col" class="text-end">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
      `;

      let totalOrderPrice = 0;
      order.items.forEach((item, index) => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 1;
        totalOrderPrice += itemPrice * itemQuantity;
        itemsTable += `
            <tr>
              <td>${index + 1}</td>
              <td>${item.name} ${item.size ? `(${item.size})` : ""}</td>
              <td class="text-center">${itemQuantity}</td>
              <td class="text-end">${formatCurrency(itemPrice)}</td>
            </tr>
        `;
      });
      itemsTable += `</tbody></table>`;

      let actionButtons = "";
      if (order.status === "Mới") {
        actionButtons = `<button class="btn btn-sm btn-primary action-btn" data-status="Đã tiếp nhận">Tiếp nhận</button>`;
      } else if (order.status === "Đã tiếp nhận") {
        actionButtons = `<button class="btn btn-sm btn-info action-btn" data-status="Đang xử lý">Xử lý</button>`;
      } else if (order.status === "Đang xử lý") {
        actionButtons = `<button class="btn btn-sm btn-success action-btn" data-status="Hoàn thành">Hoàn thành</button>`;
      }

      if (order.status !== "Hoàn thành" && order.status !== "Đã hủy") {
        actionButtons += ` <button class="btn btn-sm btn-danger action-btn" data-status="Đã hủy">Hủy đơn</button>`;
      }

      const card = document.createElement("div");
      card.className = "order-card";
      card.id = `order-${order.orderId}`;
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="mb-1">Đơn hàng: ${order.orderId}</h5>
            <p class="text-muted small mb-0">Thời gian: ${new Date(
              order.timestamp
            ).toLocaleString("vi-VN")}</p>
          </div>
          <span class="badge status-badge ${statusClass}">${order.status}</span>
        </div>
        <hr class="my-2">
        ${itemsTable}
        <div class="d-flex justify-content-between align-items-center">
          <div class="fw-bold fs-5">Tổng tiền: <span class="text-danger">${formatCurrency(
            totalOrderPrice
          )}</span></div>
          <div class="text-end">${actionButtons}</div>
        </div>
      `;
      return card;
    }

    function upsertOrderCard(order) {
      const existingCard = document.getElementById(`order-${order.orderId}`);
      const newCard = createOrderCard(order);
      if (existingCard) {
        existingCard.replaceWith(newCard);
      } else {
        const emptyMessage = ordersContainer.querySelector(".empty-message");
        if (emptyMessage) emptyMessage.remove();
        ordersContainer.prepend(newCard);
      }
    }

    const eventSource = new EventSource("/api/orders/stream");

    eventSource.addEventListener("welcome", (event) => {
      connectionStatusEl.textContent = "Đã kết nối";
      connectionStatusEl.classList.replace("bg-warning", "bg-success");
    });

    eventSource.addEventListener("new_order", (event) => {
      const newOrder = JSON.parse(event.data);
      upsertOrderCard(newOrder);
    });

    eventSource.addEventListener("order_update", (event) => {
      const updatedOrder = JSON.parse(event.data);
      upsertOrderCard(updatedOrder);
    });

    eventSource.onerror = function () {
      connectionStatusEl.textContent = "Mất kết nối";
      connectionStatusEl.classList.replace("bg-success", "bg-warning");
      eventSource.close();
    };

    fetch("/api/orders")
      .then((res) => res.json())
      .then((pastOrders) => {
        if (pastOrders.length === 0) {
          ordersContainer.innerHTML =
            '<p class="text-center text-muted empty-message">Chưa có đơn hàng nào.</p>';
        } else {
          ordersContainer.innerHTML = "";
          pastOrders.forEach((order) => upsertOrderCard(order));
        }
      });

    ordersContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("action-btn")) {
        const button = event.target;
        const card = button.closest(".order-card");
        const orderId = card.id.replace("order-", "");
        const newStatus = button.dataset.status;

        fetch(`/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }).catch((err) => console.error("Lỗi khi cập nhật trạng thái:", err));
      }
    });
  }
});
