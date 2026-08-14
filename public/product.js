const quantity = document.getElementById("quantity")
const quantityInput = document.getElementById('quantity');
const decreaseBtn = document.getElementById('decreaseQuantity');
let stock = parseInt(quantity.getAttribute("max"));


decreaseBtn.addEventListener('click', function(event) {
    event.preventDefault();
    let currentQuantity = parseInt(quantityInput.value);
    if (currentQuantity > 1) {
        quantityInput.value = currentQuantity - 1;
    }
    else{ 
        alert("Quantity cannot be less than 1");
    }
    quantityInput.textContent = quantityInput.value;
});

const increaseBtn = document.getElementById('increaseQuantity');
increaseBtn.addEventListener('click', function(event) {
    event.preventDefault();
    let currentQuantity = parseInt(quantityInput.value);
    if (currentQuantity < stock) {
        quantityInput.value = currentQuantity + 1;
    }
    else {
        alert("Quantity cannot exceed available stock");
    }
    quantityInput.textContent = quantityInput.value;
});

const addToCartBtn = document.querySelector('.add-to-cart');
addToCartBtn.addEventListener('click', function(event) {
    event.preventDefault();
    const productId = this.getAttribute('data-id');
    const quantity = parseInt(quantityInput.value, 10);
    
    fetch('/cart/' + productId + '/' + quantity, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Error in login"){
            window.location.href = "/login"
        }
        if (data.message === "Product added to cart successfully") {
            alert('Product added to cart successfully!');
            window.location.href = '/cart';
        }
        else {
            alert('Please Log In First.');
            window.location.href = "/login";
        }
    })
    // .catch(error => {
    //     console.error();
    //     alert('An error occurred while adding the product to the cart.');
    // });
});