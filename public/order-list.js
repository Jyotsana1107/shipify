document.addEventListener('DOMContentLoaded', function() {
    console.log('Order list page loaded');
});

const cancel = document.querySelectorAll(".cancelOrder").forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const orderId = this.getAttribute('data-id');
        if (!orderId) return;
        if (!confirm('Remove this item from Orders?')) return;

        fetch('/order-list', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( { orderId } )
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data && data.message) {
                window.location.reload();
            } else {
                alert('Could not cancel the order');
            }
        })
        .catch(function (err) {
            console.error(err);
            alert('Error cancelling Order');
        });
    });
});