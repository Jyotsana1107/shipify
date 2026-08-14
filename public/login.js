let form = document.getElementById("loginForm");
form.addEventListener("submit", async function(event){
    event.preventDefault();
    const formData = new FormData(form);
    const credentials = Object.fromEntries(formData);
    const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
    const validPass = /^([a-zA-Z0-9@]){8,}$/;
    if (!validEmail.test(credentials.email)){
        alert("Please enter a valid email address");
        return;
    }
    if (!validPass.test(credentials.password)){
        alert("Your Password should be atleast 8 charcters long and can have a-z, A-Z, and 0-9");
        return;
    }


    let res = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
        })
    });
    let data = await res.json();
    if (data.message === "Successfully Logged In"){
        window.location.href = "/";
    }
    else{
        alert(data.message);
    }

})