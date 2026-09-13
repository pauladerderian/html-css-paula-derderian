const PRODUCTS_API_URL = "https://v2.api.noroff.dev/rainy-days";
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

const productList = document.getElementById("homepage-product-list");

getAllProducts().then((products) => {
    productList.innerHTML = "";

    const featuredProducts = products.slice(0, 4);

    featuredProducts.forEach((product) => {
        const card = createProductCard(product);
        productList.appendChild(card);
    });
});

productList.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-cart");

    if (!button) {
        return;
    }

    const productId = button.dataset.id;
    addToBasket(productId);
});

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
}

function updateCartCount() {
    const basket = getBasket();
    const totalItems = basket.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector(".cart-count");
    cartCountElement.textContent = totalItems;
}

updateCartCount();