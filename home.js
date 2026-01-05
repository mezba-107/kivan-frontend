document.addEventListener("DOMContentLoaded", async () => {
  console.log("home.js loaded");

  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/products");
    const products = await res.json();

    console.log("products:", products.length);

    const shuffled = products.sort(() => 0.5 - Math.random());

    setProducts(".featured-products", shuffled.slice(0, 6));
    setProducts(".latest-products", shuffled.slice(3, 12));

  } catch (err) {
    console.error(err);
  }
});

function setProducts(rowSelector, products) {
  const row = document.querySelector(rowSelector);
  const cards = row.querySelectorAll(".col-4");

  cards.forEach((card, i) => {
    if (!products[i]) return;

    const p = products[i];

    const link = card.querySelector("a");
    const img = card.querySelector("img");
    const title = card.querySelector("h4");
    const price = card.querySelector("p");

    link.href = `/product/single-product.html?id=${p._id}`;
    img.src = `https://kivan-backend.onrender.com${p.image}`;
    title.innerText = p.name;
    price.innerText = `৳ ${p.price}`;
  });
}
