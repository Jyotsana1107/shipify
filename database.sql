create database shipify;
use shipify;
create table users (
	id int auto_increment primary key,
    name varchar(50) not null,
    email varchar(50) not null unique,
    password varchar(100) not null,
    date timestamp default current_timestamp
);


create table products (
	id int auto_increment primary key,
	name varchar(150) not null,
	description varchar(2000),
	price decimal(10,2) not null,
	image varchar(300) not null,
	category varchar(100) not null,
	stock int not null default 0,
	date timestamp default current_timestamp
);

create table cart (
	id int auto_increment primary key,
    user_id int not null,
    product_id int not null,
    quantity int not null,
    price decimal(10,2),
    foreign key (user_id) references users(id) on delete cascade on update cascade,
    foreign key (product_id) references products(id) on delete cascade on update cascade
);

create table orders (
	id int auto_increment primary key,
    user_id int not null,
    total decimal(10,2),
    name varchar(100) not null,
    email varchar(100) not null,
    phone varchar(20) not null,
    address varchar(255) not null,
    city varchar(100) not null,
    state varchar(100) not null,
    pincode varchar(10) not null,
    payment_method varchar(50),
    status varchar(50) default 'Pending',
    date timestamp default current_timestamp,
    foreign key (user_id) references users(id) on delete cascade on update cascade
);

create table order_list (
	id int auto_increment primary key,
    order_id int not null,
    product_id int not null,
    quantity int not null,
    price decimal(10,2),
    foreign key (order_id) references orders(id) on delete cascade on update cascade,
    foreign key (product_id) references products(id) on delete cascade on update cascade
);


insert into products (name, description, price, image, category, stock) 
values
("GawFalk Television", "Gawfolk Ultrawide Monitor 34 Inch 1500R Curved 120Hz Monitor for Gaming Computers, 21:9 UWQHD (3440 x 1440) Screen, Adaptive Sync, HDR, 178° Viewing Angle, HDMI、Display Port, VESA75 × 75 mm – Black", 15499, "https://m.media-amazon.com/images/I/81MHT4LR65L._AC_.jpg", "Electronics", 5),
("Nike Air Force 1 Shoes", "Add a unique touch to your style and stand out with these custom AF1 sneakers. Handcrafted with precision and care, these custom shoes are made to elevate your sneaker game. Unleash your boldness with these must-have custom sneakers!", 7899, "https://i.pinimg.com/originals/ad/eb/ed/adebedf6313f24e0ec67540da4a30906.jpg", "Shoes", 13),
("Black Birdseye Wool Suit", "Simple yet sophisticated, our Black Birdseye Wool Suit has been a best-seller for years, crafted to create business suits par excellence. This suit combines traditional style and elegance with exceptional wearability, making it suitable for year-round use. The textured birdseye fabric, woven from Super 110s pure wool fibers, offers a perfect balance of durability, breathability, and refined appearance.", 16400, "https://www.mysuittailor.com/cdn/shop/files/blackbirdseye.jpg?v=1701688061&width=533", "Clothes", 3),
("Modern Leather U Shaped Sectional Sofa Couch", "The high-density foam provides excellent support and comfort, ensuring a long-lasting seating experience. Wooden legs offer stability and durability, supporting the sofa's structure and enhancing its longevity.", 38946, "https://tse2.mm.bing.net/th/id/OIP.zCCDsnZvDG8uqVwdhcZ5UwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3", "Furniture", 1);

