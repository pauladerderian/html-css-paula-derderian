const PRODUCTS_API_URL = "https://v2.api.noroff.dev/rainy-days";
async function getAllProducts () {
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
    `;

    return li;
}

const productList = document.getElementById("homepage-product-list");

getAllProducts().then((products) => {
    console.log(products);
});