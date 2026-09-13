const PRODUCTS_API_URL = "https://v2.api.noroff.dev/rainy-days";
let allProducts = [];

async function getAllProducts() {
    try {
        const response = await fetch(PRODUCTS_API_URL);
        const result = await response.json();
        const products = result.data;
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

function createProductCard(product) {
    const li = document.createElement("li");

    li.innerHTML = `
        <a href="#" class="product-grid">
            <img src="${product.image.url}" alt="${product.image.alt}">
            <div class="product-title">
                <h3>${product.title}</h3>
                <p>€${product.price}</p>
            </div>
            <div class="product-description">
                <p>${product.description}</p>
            </div>
        </a>
        <button class="btn-cart" data-id="${product.id}">Add to Cart</button>
    `;

    return li;
}

function createCartItem(product, quantity) {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.dataset.id = product.id;

    div.innerHTML = `
        <img src="${product.image.url}" alt="${product.image.alt}">
        <div class="cart-item-info">
            <div class="cart-item-top">
                <p class="cart-item-name">${product.title}</p>
                <p class="cart-item-price">€${product.price}</p>
            </div>
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

        const cartItem = createCartItem(product, item.quantity);
        cartItemsList.appendChild(cartItem);

        subtotal += product.price * item.quantity;
    });

    cartSubtotal.textContent = `€${subtotal.toFixed(2)}`;
}

function getBasket() {
    const basket = localStorage.getItem("basket");
    return basket ? JSON.parse(basket) : [];
}

function saveBasket(basket) {
    localStorage.setItem("basket", JSON.stringify(basket));
}

function addToBasket(productId) {
    const basket = getBasket();

    const existingItem = basket.find((item) => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        basket.push({ id: productId, quantity: 1 });
    }

    saveBasket(basket);
    updateCartCount();
    renderCartModal();
}

function updateQuantity(productId, action) {
    const basket = getBasket();
    const item = basket.find((item) => item.id === productId);

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

function updateCartCount() {
    const basket = getBasket();
    const totalItems = basket.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector(".cart-count");
    cartCountElement.textContent = totalItems;
}

const productList = document.getElementById("homepage-product-list");

getAllProducts().then((products) => {
    allProducts = products;

    if (productList) {
        productList.innerHTML = "";

        const featuredProducts = products.slice(0, 4);

        featuredProducts.forEach((product) => {
            const card = createProductCard(product);
            productList.appendChild(card);
        });
    }

    renderCartModal();
});

if (productList) {
    productList.addEventListener("click", (event) => {
        const button = event.target.closest(".btn-cart");

        if (!button) {
            return;
        }

        const productId = button.dataset.id;
        addToBasket(productId);
    });
}

const cartItemsList = document.getElementById("cart-items-list");

cartItemsList.addEventListener("click", (event) => {
    const button = event.target.closest(".qty-btn");

    if (!button) {
        return;
    }

    const cartItem = button.closest(".cart-item");
    const productId = cartItem.dataset.id;
    const action = button.dataset.action;

    updateQuantity(productId, action);
});

updateCartCount();