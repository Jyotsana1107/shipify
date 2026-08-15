require('dotenv').config();
const express = require("express");
const fs = require("fs");
const ejs = require("ejs");
const session = require("express-session");
const db = require("./db/db.js");
const multer = require("multer");
const Mailjet = require("node-mailjet");
const app = express();
const PORT = process.env.PORT;
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", __dirname + '/views');

const mailjet = Mailjet.apiConnect(
 process.env.MJ_APIKEY_PUBLIC,
 process.env.MJ_APIKEY_PRIVATE
);



//session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true

}));

//user
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

//login
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next();
    }
    if (req.method === 'GET') {
        return res.redirect('/login');
    }
    return res.status(401).json({
      message: "Error in login"
    });
}


//login
app.get("/login", (req, res) => {
  res.render('login');
})
.post("/login", (req,res)=>{
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results)=>{
      if (err){
          return res.json({message: "Can't Read File"})
      }
    
      if (results.length > 0){
          req.session.user = {
              id: results[0].id,
              name: results[0].name,
              email: results[0].email
          };
          return res.json({message: "Successfully Logged In"})
      }
      return res.json({message: "Wrong Email or Password. \n If you don't have an account, please sign up first."})
  })        
})



//signup
app.get("/signup", (req, res) => {
  res.render('signup');
})
.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], (err, results) => {
    if (err) {
      console.log(err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.json({message: "This email is already registered. Please log in or use a different email."});
      }
      return res.json({message: "Error adding user. Please try again."});
    }
    return res.json({message: "User Succesfully Added"});
  });
});


//logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
});


//profile
app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session.user });
});






//products
app.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching products");
    } 
    res.render("index", {
      products : results
    });
  });
})




//for product details
app.get("/product/:id", (req, res) => {
  const productId = req.params.id;
  db.query("SELECT * FROM products WHERE id = ?", [productId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching product details");
    }

    res.render("product", { product: results[0] });
  });
});





//cart
app.get("/cart", isLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  db.query("SELECT cart.*, products.name, products.price, products.image FROM cart JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?", [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching cart items");
    }
    res.render("cart", { item: results });
  });
})
.post("/cart/:productId/:quantity", isLoggedIn, (req, res) => {
  const { productId, quantity } = req.params;
  const userId = req.session.user.id;

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).json({
      message: "Quantity must be a positive whole number"
    });
  }
  
  db.query("SELECT price FROM products WHERE id = ?", [productId], (err, product) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching product price" });
    }
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (parsedQuantity > product[0].stock){
      return res.status(400).json({message: "Quantity exceeds available stock"})
    }

    const price = product[0].price;
    
    db.query("INSERT INTO cart (user_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [userId, productId, parsedQuantity, price], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error adding product to cart" });
      }
      return res.json({ message: "Product added to cart successfully" });
    });
  });
})


app.delete('/cart', isLoggedIn, (req, res) => {
  const { cartId } = req.body;
  const user_id = req.session.user.id;
  db.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [cartId, user_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error removing item from cart" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found or not authorized" });
    }
    return res.json({ message: "Item removed from cart" });
  });
});






//Order
app.get("/order", isLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  db.query("SELECT cart.*, products.name, products.price FROM cart JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?", [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching cart items");
    }
    if (results.length === 0) {
      return res.redirect("/cart");
    }
    res.render("order", { item: results });
  });
});


//to place an order
app.post("/place-order", isLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  const { name, email, phone, address, city, state, pincode, payment } = req.body;

  db.query("SELECT cart.*, products.price FROM cart JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?", [userId], (err, cartItems) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching cart" });
    }
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });
    db.query("INSERT INTO orders (user_id, total, name, email, phone, address, city, state, pincode, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userId, total, name, email, phone, address, city, state, pincode, payment, "Pending"], (err, orderResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error creating order" });
      }

      const orderId = orderResult.insertId;
      let itemsInserted = 0;
      cartItems.forEach(item => {
        db.query("INSERT INTO order_list (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [orderId, item.product_id, item.quantity, item.price], (err) => {
          if (err) {
            console.log(err);
            return;
          }
          itemsInserted++;
          
          if (itemsInserted === cartItems.length) {
            db.query("DELETE FROM cart WHERE user_id = ?", [userId], (err) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "Order placed but failed to clear cart" });
              }
              const request = mailjet
              .post('send', { version: 'v3.1' })
              .request({
                Messages: [
                  {
                    From: {
                      Email: "jyotsanaanand11@gmail.com",
                      Name: "Jyotsana"
                    },
                    To: [
                      {
                        Email: email,
                        Name: "customer"
                      }
                    ],
                    Subject: "Thanks for Order",
                    TextPart: `Hello ${name},
                      Thank you for placing your order.
                      Order ID: ${orderId}
                      Total: ₹${total}
                      Payment Method: ${payment}
                      Your order will be delivered to:
                      ${address}, ${city}, ${state} - ${pincode}
                      `,

                    HTMLPart: `
                      <h2>Order Confirmed!</h2>
                      <p>Hello ${name},</p>
                      <p>Thank you for placing your order.</p>
                      <h3>Order Details:</h3>
                      <p><strong>Order ID:</strong> ${orderId}</p>
                      <p><strong>Total:</strong> ₹${total}</p>
                      <p><strong>Payment:</strong> ${payment}</p>

                      <h3>Delivery Address</h3>
                      <p> ${address}<br> ${city}, ${state} - ${pincode} </p>
                      <p>We will notify you when your order is shipped.</p>
                      `
                  }
                ]
              });
              request
              .then((result) => {
                console.log(result.body);
              })
              .catch((err) => {
                console.log(err.statusCode);
              });

              return res.json({ message: "Order placed successfully", orderId: orderId, total: total });
            });

          }
        });
      });
    });
  });
});




//order list
app.get("/order-list", isLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC", [userId], (err, orders) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching orders");
    }

    if (orders.length === 0) {
      return res.render("order-list", { orders: [] });
    }
    let ordersProcessed = 0;
    orders.forEach((order, index) => {
      db.query("SELECT ol.*, products.name as product_name FROM order_list ol JOIN products ON ol.product_id = products.id WHERE ol.order_id = ?", [order.id], (err, items) => {
        if (err) {
          console.log(err);
          orders[index].items = [];
        } else {
          orders[index].items = items;
          orders[index].order_id = order.id;
          orders[index].order_date = order.date;
          orders[index].order_total = order.total;
          orders[index].order_status = order.status || "Pending";
        }
        ordersProcessed++;
        if (ordersProcessed === orders.length) {
          res.render("order-list", { orders: orders });
        }
      });
    });
  });
});

//to cancel order
app.delete('/order-list', isLoggedIn, (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  db.query("DELETE FROM order_list WHERE order_id = ?", [orderId], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error deleting order items" });
    }

    db.query("DELETE FROM orders WHERE id = ?", [orderId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error cancelling order" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found or not authorized" });
      }
      return res.json({ message: "Order Cancelled!!" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});