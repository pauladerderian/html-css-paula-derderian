// ===== ORDER CONFIRMATION =====
// Displays a random 6-digit order number and clears the basket, since
// reaching this page means the "purchase" is complete.

function generateOrderNumber() {
    // Math.random() * 900000 gives 0–899999.999..., plus 100000 shifts the
    // range to 100000–999999, so it's always exactly 6 digits.
    return Math.floor(100000 + Math.random() * 900000);
}

document.addEventListener("DOMContentLoaded", () => {
    const orderNumberEl = document.getElementById("order-number");

    if (orderNumberEl) {
        orderNumberEl.textContent = `Order #${generateOrderNumber()}`;
    }

    localStorage.removeItem("basket");
});