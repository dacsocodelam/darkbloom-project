document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.getElementById("reservations-table-body");

  async function loadReservations() {
    try {
      const response = await fetch("/api/reservations");
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu đặt bàn.");
      }
      const result = await response.json();
      renderTable(result.data);
    } catch (error) {
      console.error(error);
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger p-4">Lỗi: ${error.message}</td></tr>`;
    }
  }

  function renderTable(reservations) {
    if (!reservations || reservations.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4">Chưa có ai đặt bàn.</td></tr>`;
      return;
    }

    tableBody.innerHTML = ""; // Xóa nội dung cũ
    reservations.forEach((res, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${res.name}</td>
                <td>${res.phone}</td>
                <td>${res.email}</td>
                <td class="text-center">${res.num_people}</td>
                <td>${new Date(res.reservation_date).toLocaleDateString(
                  "vi-VN"
                )}</td>
                <td>${res.reservation_time}</td>
            `;
      tableBody.appendChild(row);
    });
  }

  loadReservations();
});
