// language.js - Đa ngôn ngữ cho label, placeholder, option, và upload file

document.addEventListener("DOMContentLoaded", function () {
  const languageSwitcherBtn = document.getElementById("language-switcher");
  const langOptions = document.querySelectorAll(".lang-option");

  // Hàm để thay đổi ngôn ngữ
  const setLanguage = (langCode) => {
    // Lưu ngôn ngữ người dùng chọn vào bộ nhớ trình duyệt
    localStorage.setItem("language", langCode);

    // Áp dụng dịch cho toàn bộ trang
    applyTranslations(langCode);

    // Cập nhật nút bấm hiển thị ngôn ngữ hiện tại
    if (languageSwitcherBtn) {
      languageSwitcherBtn.textContent = langCode.toUpperCase();
    }

    // Nếu có hàm fetchAndDisplayProducts thì gọi lại để render đúng tên sản phẩm
    if (typeof fetchAndDisplayProducts === "function") {
      fetchAndDisplayProducts();
    }
    // Nếu có hàm updateMiniCartUI thì gọi lại để cập nhật mini cart
    if (
      typeof updateMiniCartUI === "function" &&
      typeof window.cartData !== "undefined"
    ) {
      updateMiniCartUI(window.cartData);
    }

    // Cập nhật lại trạng thái tên file upload (nếu có)
    updateCVFileName();
  };

  // Gắn sự kiện click cho các lựa chọn ngôn ngữ
  langOptions.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.preventDefault();
      const selectedLang = this.getAttribute("data-lang");
      setLanguage(selectedLang);
    });
  });

  // Sự kiện chọn file cho input file upload
  const fileInput = document.getElementById("applicantCV");
  if (fileInput) {
    fileInput.addEventListener("change", updateCVFileName);
  }

  // Tải lại ngôn ngữ đã lưu hoặc mặc định
  const savedLang = localStorage.getItem("language") || "vi"; // Mặc định là Tiếng Việt
  setLanguage(savedLang);
});

// Hàm lấy ngôn ngữ hiện tại
function currentLang() {
  return localStorage.getItem("language") || "vi";
}
window.currentLang = currentLang; // Cho các file khác dùng

// Hàm dịch các thành phần giao diện
function applyTranslations(lang) {
  document.querySelectorAll("[data-lang-key]").forEach(function (el) {
    var key = el.getAttribute("data-lang-key");
    if (translations[lang] && translations[lang][key]) {
      // input/textarea có placeholder
      if (
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA") &&
        el.hasAttribute("placeholder")
      ) {
        el.setAttribute("placeholder", translations[lang][key]);
      }
      // option
      else if (el.tagName === "OPTION") {
        el.textContent = translations[lang][key];
      }
      // còn lại
      else {
        el.textContent = translations[lang][key];
      }
    }
  });

  // Dịch lại label custom "Chọn tệp" nếu có
  const chooseLabel = document.querySelector(
    'label[for="applicantCV"][data-lang-key="careers_form_cv_choose_file"]'
  );
  if (chooseLabel) {
    const lang = currentLang();
    chooseLabel.textContent =
      translations[lang]?.careers_form_cv_choose_file || "Chọn tệp";
  }

  // Dịch lại dòng "chưa có tệp nào được chọn" (nếu chưa chọn file)
  updateCVFileName();
}

// Hàm cập nhật dòng tên file upload
function updateCVFileName() {
  const lang = currentLang();
  const input = document.getElementById("applicantCV");
  const span = document.getElementById("cvFileName");
  if (input && span) {
    if (input.files && input.files.length > 0) {
      span.textContent = input.files[0].name;
    } else {
      span.textContent =
        translations[lang]?.careers_form_cv_no_file ||
        "Chưa có tệp nào được chọn";
    }
  }
}
