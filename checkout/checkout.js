// ===== CHECKOUT STEPPER =====
// Handles the 3-step checkout flow: Shipping -> Payment -> Review

document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".checkout-step");
    const stepItems = document.querySelectorAll(".step-item");

    const subtotalEl = document.getElementById("summary-subtotal");
    const shippingEl = document.getElementById("summary-shipping");
    const totalEl = document.getElementById("summary-total");
    const promoBox = document.getElementById("promo-code");

    let shippingCost = 0;

    // ---- Order summary (sidebar) ----

    function getSubtotal() {
        const raw = subtotalEl.textContent.replace(/[^\d.]/g, "");
        return parseFloat(raw) || 0;
    }

function updateTotals() {
    const subtotal = getSubtotal();
    shippingEl.textContent = shippingCost > 0 ? `€${shippingCost}` : "—";
    totalEl.textContent = `€${(subtotal + shippingCost).toFixed(2)}`;
}

// Let products.js trigger a recalculation once it fills in the real
// subtotal (its fetch finishes after this DOMContentLoaded already ran).
window.refreshCheckoutTotals = updateTotals;


    document.querySelectorAll('input[name="shipping"]').forEach((radio) => {
        radio.addEventListener("change", (event) => {
            shippingCost = Number(event.target.value) || 0;
            updateTotals();
        });
    });

    // ---- Step navigation ----

    function goToStep(stepNumber) {
        steps.forEach((step) => {
            step.classList.toggle("active", Number(step.dataset.step) === stepNumber);
        });
        stepItems.forEach((item) => {
            const n = Number(item.dataset.step);
            item.classList.toggle("active", n === stepNumber);
            item.classList.toggle("completed", n < stepNumber);
        });

        // The promo code box only shows during the Payment step.
        if (promoBox) promoBox.style.display = stepNumber === 2 ? "flex" : "none";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Sync the promo box to the step that's active on page load (Shipping).
    if (promoBox) promoBox.style.display = "none";

    document.querySelectorAll(".step-continue").forEach((button) => {
        button.addEventListener("click", () => {
            const form = button.closest("form");

            // Validate the current step's required fields before advancing.
            if (form && !form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const next = Number(button.dataset.next);
            if (next === 2) buildShippingSummary();
            if (next === 3) buildReviewSummary();
            goToStep(next);
        });
    });

    document.querySelectorAll(".step-back").forEach((button) => {
        button.addEventListener("click", () => goToStep(Number(button.dataset.goto)));
    });

    document.querySelectorAll(".btn-edit").forEach((button) => {
        button.addEventListener("click", () => goToStep(Number(button.dataset.goto)));
    });

    // ---- Summary builders ----

    function buildShippingSummary() {
        const firstName = document.getElementById("firstname").value.trim();
        const lastName = document.getElementById("lastname").value.trim();
        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const postal = document.getElementById("postal").value.trim();

        const selectedShipping = document.querySelector('input[name="shipping"]:checked');
        const shippingLabel = selectedShipping ? selectedShipping.dataset.label : "";

        const summaryText = `${firstName} ${lastName} — ${address}, ${city} ${postal} — ${shippingLabel}`;
        document.getElementById("shipping-summary-text").textContent = summaryText;
    }

    function buildReviewSummary() {
        // Reuse the text already built for step 2's recap.
        const shippingText = document.getElementById("shipping-summary-text").textContent;
        document.getElementById("review-shipping-text").textContent = shippingText;

        const cardName = document.getElementById("card-name").value.trim();
        const cardNumber = document.getElementById("card-number").value.replace(/\s/g, "");
        const last4 = cardNumber.slice(-4);

        document.getElementById("review-payment-text").textContent =
            `${cardName} — Card ending in ${last4 || "****"}`;
    }

    updateTotals();
});