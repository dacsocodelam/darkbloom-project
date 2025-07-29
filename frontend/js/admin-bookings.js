document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("bookings-table-body");

  // Nếu không phải trang quản lý đặt bàn thì không làm gì cả
  if (!tableBody) return;

  // Hàm để lấy và hiển thị danh sách đặt bàn
  async function fetchAndDisplayBookings() {
    try {
      const response = await fetch("${API_BASE_URL}/api/bookings");
      if (!response.ok) {
        throw new Error("Lỗi mạng hoặc server không phản hồi");
      }
      const result = await response.json();

      tableBody.innerHTML = ""; // Xóa dòng "loading"

      if (result.data && result.data.length > 0) {
        result.data.forEach((booking) => {
          const row = document.createElement("tr");

          // Thêm class màu cho hàng đã xác nhận
          if (booking.status === "Đã xác nhận") {
            row.classList.add("table-success");
          }

          // Tạo nút bấm dựa trên trạng thái
          const actionButton =
            booking.status === "Đã xác nhận"
              ? `<span class="text-success fw-bold">Đã gửi mail</span>`
              : `<button class="btn btn-sm btn-success btn-confirm" data-id="${booking.id}">Xác nhận</button>`;

          // Định dạng lại ngày giờ cho dễ nhìn
          const bookingDateTime = `${new Date(
            booking.bookingDate
          ).toLocaleDateString("vi-VN")} - ${booking.bookingTime}`;
          const createdAtDateTime = new Date(booking.createdAt).toLocaleString(
            "vi-VN"
          );

          row.innerHTML = `
                        <th>${booking.id}</th>
                        <td>${booking.fullName}</td>
                        <td>${booking.phone}</td>
                        <td>${booking.email}</td>
                        <td class="text-center">${booking.guests}</td>
                        <td>${bookingDateTime}</td>
                        <td><span class="badge ${
                          booking.status === "Đã xác nhận"
                            ? "bg-success"
                            : "bg-primary"
                        }">${booking.status || "Mới"}</span></td>
                        <td class="text-center">${actionButton}</td>
                    `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML =
          '<tr><td colspan="8" class="text-center p-4">Chưa có lịch đặt bàn nào.</td></tr>';
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đặt bàn:", error);
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center text-danger p-4">Không thể tải dữ liệu. Vui lòng kiểm tra lại server.</td></tr>';
    }
  }

  // === THÊM "BỘ NÃO" XỬ LÝ CLICK VÀO ĐÂY ===
  tableBody.addEventListener("click", async (e) => {
    // Chỉ hành động nếu bấm vào nút có class 'btn-confirm'
    if (e.target.classList.contains("btn-confirm")) {
      const button = e.target;
      const bookingId = button.dataset.id;

      button.disabled = true;
      button.textContent = "Đang gửi...";

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bookings/${bookingId}/confirm`,
          {
            method: "POST",
          }
        );
        const result = await response.json();
        alert(result.message); // Hiển thị thông báo từ server
        fetchAndDisplayBookings(); // Tải lại danh sách để cập nhật trạng thái
      } catch (error) {
        alert("Lỗi! Không thể thực hiện hành động.");
        button.disabled = false;
        button.textContent = "Xác nhận";
      }
    }
  });

  // Tự động chạy khi trang được tải
  fetchAndDisplayBookings();
});
