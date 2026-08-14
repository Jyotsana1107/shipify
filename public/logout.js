const logoutBtn = document.getElementById("logoutBtn");
if (logout) {
    logout.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/logout";
    });
}