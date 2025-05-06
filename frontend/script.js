function formatResultText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // kalın yazı
    .replace(/\n\n/g, "<br><br>") // paragraflar arası boşluk
    .replace(/\n/g, "<br>") // satır atlamaları
    .replace(/•/g, "🔹") // maddeleri ikonla değiştir
    .replace(/- /g, "– "); // daha düzgün kısa tire
}

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-step");
  const progressSteps = document.querySelectorAll(".step");
  const form = document.getElementById("formSlider");
  const resultBox = document.createElement("div");
  resultBox.className = "result";
  form.parentNode.insertBefore(resultBox, form.nextSibling);

  let currentStep = 0;

  // Butonları oluştur
  const prevBtn = document.createElement("button");
  const nextBtn = document.createElement("button");
  const resetBtn = document.createElement("button");

  prevBtn.id = "prevBtn";
  nextBtn.id = "nextBtn";
  resetBtn.id = "resetBtn";

  prevBtn.textContent = "← Geri";
  nextBtn.textContent = "İleri →";
  resetBtn.textContent = "↻ Yeni Soru Sor";

  form.appendChild(prevBtn);
  form.appendChild(nextBtn);
  form.appendChild(resetBtn);

  resetBtn.style.display = "none";

  const updateStep = () => {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep);
      progressSteps[index].classList.toggle("active", index <= currentStep);
    });

    prevBtn.style.display = currentStep === 0 ? "none" : "inline-block";
    nextBtn.textContent =
      currentStep === steps.length - 1 ? "Yanıt Al" : "İleri →";
  };

  updateStep();

  nextBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const currentInput = steps[currentStep].querySelector("input");
    if (!currentInput.value.trim()) {
      currentInput.focus();
      return;
    }

    if (currentStep < steps.length - 1) {
      currentStep++;
      updateStep();
    } else {
      // Form verilerini topla
      const data = {
        product: document.getElementById("product").value,
        country: document.getElementById("country").value,
        budget_min: parseInt(document.getElementById("budgetMin").value),
        budget_max: parseInt(document.getElementById("budgetMax").value),
        currency: document.getElementById("currency").value,
        lang: document.getElementById("lang").value,
      };

      resultBox.innerHTML = `
      <div class="loading-container">
        <div class="loader"></div>
        <p>Yanıt hazırlanıyor...</p>
      </div>
      `;

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/sustainable-fashion-advice",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();
        resultBox.innerHTML = `
        <div class="result-box">
          <h2>🌿 Sonuçlar Hazır</h2>
          <div class="result-scroll">
            ${formatResultText(
              result.advice || result.error || "Bir şeyler yanlış gitti."
            )}
          </div>
          <button id="restartBtn">↺ Yeni Soru Sor</button>
        </div>
      `;

        resetBtn.style.display = "inline-block";
        document.getElementById("restartBtn").addEventListener("click", () => {
          location.reload(); // Sayfayı sıfırdan yenile
        });
        form.style.display = "none";
      } catch (error) {
        resultBox.textContent = "Sunucuya ulaşılamadı.";
      }
    }
  });

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentStep > 0) {
      currentStep--;
      updateStep();
    }
  });

  resetBtn.addEventListener("click", () => {
    // Formu sıfırla
    form.reset();
    resultBox.textContent = "";
    form.style.display = "block";
    resetBtn.style.display = "none";
    currentStep = 0;
    updateStep();
  });
});
