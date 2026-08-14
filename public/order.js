document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            payment: document.getElementById('payment').value
        };

        try {
            const response = await fetch('/place-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            if (response.ok) {
                alert(`Order Placed Successfully!\nOrder ID: ${result.orderId}\nTotal: $${result.total.toFixed(2)}`);

                //to send email
                

                window.location.href = '/order-list';
            } else {
                alert(result.message || 'Error placing order');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error placing order. Please try again.');
        }
    });
});
