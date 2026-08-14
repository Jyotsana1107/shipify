// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', function() {
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// for details of the product
const gallery = document.getElementById('gallery');
gallery.addEventListener('click', function(event) {
    const productCard = event.target.closest('.product-card');
    if (productCard) {
        const productId = productCard.querySelector('button').getAttribute('id');
        window.location.href = `/product/${productId}`;
    }
});

const cart = document.getElementById('cartIcon');
cart.addEventListener('click', function() {
    window.location.href = "/cart";
});


