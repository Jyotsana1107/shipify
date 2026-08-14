document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.remove-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const cartId = this.getAttribute('data-id');
            if (!cartId) return;
            if (!confirm('Remove this item from cart?')) return;

            fetch('/cart', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( { cartId } )
            })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data && data.message) {
                    window.location.reload();
                } else {
                    alert('Could not remove item');
                }
            })
            .catch(function (err) {
                console.error(err);
                alert('Error removing item');
            });
    });
    });
});