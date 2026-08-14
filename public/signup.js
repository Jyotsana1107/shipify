let form = document.getElementById("signupForm");
form.addEventListener("submit", function(event){
    event.preventDefault();
    const data = new FormData(form);
    const credentials = Object.fromEntries(data);
    const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
    const validPass = /^[a-zA-Z0-9@]{8,}$/;
    
    if (!email.test(credentials.email)){
        alert("Please enter a valid email address");
        return;
    }
    if (!validPass.test(credentials.password)){
        alert("Your Password should be atleast 8 characters long and can have a-z, A-Z, 0-9, and @");
        return;
    }
    if (credentials.password !== credentials.confirmpassword){
        alert("Passwords don't match");
        return;
    }
    console.log(credentials);
    console.log(credentials.name);

    fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    })
    .then(res=>res.json())
    .then(data=>{
        if (data.message === "User Succesfully Added"){
            window.location.href = "/login";
        }
        else if(data.message.includes("email")){
            alert("Email already registered. Please log in or use a different email.");
        }
        else{
            alert(data.message);
        }
    })

})