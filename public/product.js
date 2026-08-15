const quantityInput = document.getElementById('quantity');
const decreaseBtn = document.getElementById('decreaseQuantity');
let stock = parseInt(quantityInput.getAttribute("max"), 10);


decreaseBtn.addEventListener('click', function(event) {
    event.preventDefault();
    let currentQuantity = parseInt(quantityInput.value, 10);
    if (isNaN(currentQuantity) || currentQuantity <= 1) {
        alert("Quantity cant be less than 1")
        quantityInput.value = 1;
        return;
    }
    quantityInput.value = currentQuantity - 1;
});

const increaseBtn = document.getElementById('increaseQuantity');
increaseBtn.addEventListener('click', function(event) {
    event.preventDefault();
    let currentQuantity = parseInt(quantityInput.value, 10);
    if (isNaN(currentQuantity) || currentQuantity < 1) {
        alert("Quantity cant be less than 1")
        quantityInput.value = 1;
        return;
    }

    if (currentQuantity < stock) {
        quantityInput.value = currentQuantity + 1;
    }
    else {
        alert("Quantity cannot exceed available stock");
    }
});

const addToCartBtn = document.querySelector('.add-to-cart');
addToCartBtn.addEventListener('click', function(event) {
    event.preventDefault();
    const productId = this.getAttribute('data-id');
    const quantity = parseInt(quantityInput.value, 10);
    
    if (isNaN(quantity) || quantity < 1) {
        alert("Quantity cant be less than 1")
        quantityInput.value = 1;
        return;
    }

    if (quantity > stock){
        alert("Quantity cant exceed available stock");
        quantityInput.value = stock;
        return;
    }

    fetch('/cart/' + productId + '/' + quantity, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Error in login"){
            window.location.href = "/login";
            return;
        }
        if (data.message === "Product added to cart successfully") {
            alert('Product added to cart successfully!');
            window.location.href = '/cart';
            return;
        }
        alert(data.message);
    })
    .catch(error => {
        console.error();
        alert('An error occurred while adding the product to the cart.');
    });
});