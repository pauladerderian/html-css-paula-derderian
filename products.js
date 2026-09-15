const PRODUCTS_API_URL = "https://v2.api.noroff.dev/rainy-days";
let allProducts = [];

// Category pages (women.html, men.html) now live one folder deeper, so the link to the product detail page needs an
// extra "../" when generated from there.
const isCategoryPage = window.location.pathname.includes("/category/");
const PRODUCT_PAGE_URL = isCategoryPage ? "../product.html" : "product.html";

async function getAllProducts() {
    const response = await fetch(PRODUCTS_API_URL);

    if (!response.ok) {
        throw new Error(`Failed to fetch products (status ${response.status})`);
    }

    const result = await response.json();
    return result.data;
}

function createProductCard(product) {
    const li = document.createElement("li");

    const sizeOptions = product.sizes
        .map((size) => `<option value="${size}">${size}</option>`)
        .join("");

    const isGenderSpecificPage =
        document.body.classList.contains("women-page") ||
        document.body.classList.contains("men-page");

    const genderBadge = isGenderSpecificPage
        ? ""
        : `<span class="product-gender product-gender--${product.gender.toLowerCase()}">${product.gender}</span>`;

    li.innerHTML = `
        <a href="${PRODUCT_PAGE_URL}?id=${product.id}" class="product-grid">
            ${genderBadge}
            <img src="${product.image.url}" alt="${product.image.alt}">
            <div class="product-title">
                <h3>${product.title}</h3>
                <p>€${product.price}</p>
            </div>
            <div class="product-description">
                <p>${product.description}</p>
            </div>
        </a>
        <div class="size-select-wrap">
            <select class="size-select" aria-label="Select size for ${product.title}">
                <option value="" disabled selected>Select size</option>
                ${sizeOptions}
            </select>
        </div>
        <button class="btn-cart" data-id="${product.id}">Add to Cart</button>
    `;

    return li;
}

function createCartItem(product, quantity, size) {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.dataset.id = product.id;
    div.dataset.size = size;

    div.innerHTML = `
        <img src="${product.image.url}" alt="${product.image.alt}">
        <div class="cart-item-info">
            <div class="cart-item-top">
                <p class="cart-item-name">${product.title}</p>
                <p class="cart-item-price">€${product.price}</p>
            </div>
            <p class="cart-item-size">Size: ${size}</p>
            <div class="cart-quantity">
                <button class="qty-btn" data-action="decrease">-</button>
                <span class="qty-count">${quantity}</span>
                <button class="qty-btn" data-action="increase">+</button>
            </div>
        </div>
    `;

    return div;
}

function renderCartModal() {
    const basket = getBasket();
    const cartItemsList = document.getElementById("cart-items-list");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const checkoutBtn = document.getElementById("checkout-btn");

    cartItemsList.innerHTML = "";

    if (basket.length === 0) {
        cartItemsList.innerHTML = `<p class="loading-message">Your cart is empty.</p>`;
        cartSubtotal.textContent = "€0";
        checkoutBtn.hidden = true;
        return;
    }

    checkoutBtn.hidden = false;

    let subtotal = 0;

    basket.forEach((item) => {
        const product = allProducts.find((p) => p.id === item.id);

        if (!product) {
            return;
        }

        const cartItem = createCartItem(product, item.quantity, item.size);
        cartItemsList.appendChild(cartItem);

        subtotal += product.price * item.quantity;
    });

    cartSubtotal.textContent = `€${subtotal.toFixed(2)}`;
}

function renderCheckoutSummary() {
    const orderItemsList = document.getElementById("order-items-list");
    const summarySubtotal = document.getElementById("summary-subtotal");

    if (!orderItemsList || !summarySubtotal) {
        return;
    }

    const basket = getBasket();

    orderItemsList.innerHTML = "";

    if (basket.length === 0) {
        orderItemsList.innerHTML = `<p class="loading-message">Your cart is empty.</p>`;
        summarySubtotal.textContent = "€0";
    } else {
        let subtotal = 0;

        basket.forEach((item) => {
            const product = allProducts.find((p) => p.id === item.id);

            if (!product) {
                return;
            }

            const orderItem = document.createElement("div");
            orderItem.className = "order-item";

            orderItem.innerHTML = `
                <img src="${product.image.url}" alt="${product.image.alt}">
                <div class="order-item-details">
                    <div class="order-item-row">
                        <p><strong>QTY. ${item.quantity}</strong></p>
                        <p><strong>€${(product.price * item.quantity).toFixed(2)}</strong></p>
                    </div>
                    <div class="order-item-row">
                        <p><strong>${product.title}</strong></p>
                        <p>${product.gender.toUpperCase()}</p>
                        <p>SIZE: ${item.size}</p>
                    </div>
                </div>
            `;

            orderItemsList.appendChild(orderItem);

            subtotal += product.price * item.quantity;
        });

        summarySubtotal.textContent = `€${subtotal.toFixed(2)}`;
    }

    if (typeof window.refreshCheckoutTotals === "function") {
        window.refreshCheckoutTotals();
    }
}

function getBasket() {
    const basket = localStorage.getItem("basket");
    return basket ? JSON.parse(basket) : [];
}

function saveBasket(basket) {
    localStorage.setItem("basket", JSON.stringify(basket));
}

function addToBasket(productId, size) {
    const basket = getBasket();

    const existingItem = basket.find(
        (item) => item.id === productId && item.size === size
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        basket.push({ id: productId, size, quantity: 1 });
    }

    saveBasket(basket);
    updateCartCount();
    renderCartModal();
    showToast();
}

function updateQuantity(productId, size, action) {
    const basket = getBasket();
    const item = basket.find(
        (item) => item.id === productId && item.size === size
    );

    if (!item) {
        return;
    }

    if (action === "increase") {
        item.quantity++;
    } else if (action === "decrease") {
        item.quantity--;
    }

    const updatedBasket = basket.filter((item) => item.quantity > 0);

    saveBasket(updatedBasket);
    updateCartCount();
    renderCartModal();
}

function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = `<li><p class="loading-message">No products found.</p></li>`;
        return;
    }

    products.forEach((product) => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function renderProductsError(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = `<li><p class="error-message">Something went wrong loading products. Please try again later.</p></li>`;
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function renderProductDetail(products) {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const product = products.find((p) => p.id === productId);

    if (!product) {
        renderProductDetailError();
        return;
    }

    document.body.classList.add(
        product.gender === "Female" ? "women-product-page" : "men-product-page"
    );

    document.title = product.title;

    const image = document.getElementById("product-image");
    image.src = product.image.url;
    image.alt = product.image.alt;

    document.getElementById("product-title").textContent = product.title;
    document.getElementById("product-price").textContent = `€${product.price}`;
    document.getElementById("product-description").textContent = product.description;

    const sizeOptions = document.getElementById("size-options");

    sizeOptions.innerHTML = SIZE_ORDER.map((size) => {
        const available = product.sizes.includes(size);
        const inputId = `size-${size}`;

        return `
            <input type="radio" name="size" id="${inputId}" value="${size}" ${available ? "" : "disabled"}>
            <label for="${inputId}" class="size-btn${available ? "" : " disabled"}">${size}</label>
        `;
    }).join("");

    const sizeErrorMessage = document.getElementById("size-error-message");
    const addToCartBtn = document.getElementById("product-add-to-cart");

    addToCartBtn.addEventListener("click", () => {
        const selectedSize = sizeOptions.querySelector('input[name="size"]:checked');

        if (!selectedSize) {
            if (sizeErrorMessage) {
                sizeErrorMessage.hidden = false;
            }
            return;
        }

        if (sizeErrorMessage) {
            sizeErrorMessage.hidden = true;
        }

        addToBasket(product.id, selectedSize.value);
    });
}

function renderProductDetailError() {
    const main = document.querySelector(".product-page main");

    if (!main) {
        return;
    }

    main.innerHTML = `<p class="error-message">Something went wrong loading this product. Please try again later.</p>`;
}

function getFeaturedProducts(products) {
    const femaleProducts = products.filter((p) => p.gender === "Female");
    const maleProducts = products.filter((p) => p.gender === "Male");

    const featured = [...femaleProducts.slice(0, 2), ...maleProducts.slice(0, 2)];

    if (featured.length < 4) {
        const remaining = products.filter((p) => !featured.includes(p));
        featured.push(...remaining.slice(0, 4 - featured.length));
    }

    return featured;
}

function updateCartCount() {
    const basket = getBasket();
    const totalItems = basket.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector(".cart-count");
    cartCountElement.textContent = totalItems;
}

let toastTimeoutId;

function showToast() {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.classList.add("toast-visible");

    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
        toast.classList.remove("toast-visible");
    }, 2000);
}

const productList = document.getElementById("homepage-product-list");
const genderProductList = document.getElementById("product-list");
const isProductPage = document.body.classList.contains("product-page");

async function initProducts() {
    // Show loading indicators immediately, before the fetch even starts.
    if (productList) {
        productList.innerHTML = `<li><p class="loading-message">Loading products...</p></li>`;
    }

    if (genderProductList) {
        genderProductList.innerHTML = `<li><p class="loading-message">Loading products...</p></li>`;
    }

    if (isProductPage) {
        const titleEl = document.getElementById("product-title");
        const descriptionEl = document.getElementById("product-description");

        if (titleEl) titleEl.textContent = "Loading...";
        if (descriptionEl) descriptionEl.textContent = "Loading product details...";
    }

    const cartItemsListEl = document.getElementById("cart-items-list");
    if (cartItemsListEl) {
        cartItemsListEl.innerHTML = `<p class="loading-message">Loading your cart...</p>`;
    }

    const orderItemsListEl = document.getElementById("order-items-list");
    if (orderItemsListEl) {
        orderItemsListEl.innerHTML = `<p class="loading-message">Loading your order...</p>`;
    }

    try {
        const products = await getAllProducts();

        allProducts = products;

        if (productList) {
            productList.innerHTML = "";

            const featuredProducts = getFeaturedProducts(products);

            featuredProducts.forEach((product) => {
                const card = createProductCard(product);
                productList.appendChild(card);
            });
        }

        if (genderProductList) {
            const gender = document.body.classList.contains("women-page")
                ? "Female"
                : document.body.classList.contains("men-page")
                ? "Male"
                : null;

            const genderProducts = gender
                ? products.filter((product) => product.gender === gender)
                : products;

            renderProducts(genderProducts, "product-list");
        }

        if (isProductPage) {
            renderProductDetail(products);
        }
    } catch (error) {
        console.error("Error loading products:", error);

        if (productList) {
            renderProductsError("homepage-product-list");
        }

        if (genderProductList) {
            renderProductsError("product-list");
        }

        if (isProductPage) {
            renderProductDetailError();
        }
    }

    renderCartModal();
    renderCheckoutSummary();
}

initProducts();

document.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-cart");

    if (!button || !button.dataset.id) {
        return;
    }

    const li = button.closest("li");
    const sizeSelect = li ? li.querySelector(".size-select") : null;

    if (!sizeSelect) {
        return;
    }

    const size = sizeSelect.value;

    if (!size) {
        sizeSelect.classList.add("size-select-error");
        sizeSelect.focus();
        return;
    }

    sizeSelect.classList.remove("size-select-error");

    const productId = button.dataset.id;
    addToBasket(productId, size);
});

const cartItemsList = document.getElementById("cart-items-list");

cartItemsList.addEventListener("click", (event) => {
    const button = event.target.closest(".qty-btn");

    if (!button) {
        return;
    }

    const cartItem = button.closest(".cart-item");
    const productId = cartItem.dataset.id;
    const size = cartItem.dataset.size;
    const action = button.dataset.action;

    updateQuantity(productId, size, action);
});

updateCartCount();