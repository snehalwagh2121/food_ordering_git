CREATE TABLE users(
	user_id INT PRIMARY KEY AUTO_INCREMENT,
	firstName VARCHAR(60),
	lastName VARCHAR(20),
	email VARCHAR(60),
	password VARCHAR(20),
	phone VARCHAR(10),
	address VARCHAR(30),
	state VARCHAR(20),
	country VARCHAR(20)
);

INSERT INTO users(`firstName`, `lastName`, `email`, `password`, `phone`, `address`, `State`, `Country`) 
VALUES("Snehal","Wagh","snehalwagh2121@gmail.com", "pass","7028352534","ahmednagar","maharashtra","india");


create table restaurants(	
	restaurantId INT PRIMARY KEY AUTO_INCREMENT,
	rName VARCHAR(60),
	rAddress VARCHAR(60),
	rImage VARCHAR(60)
);

INSERT INTO restaurants(`rName`, `rAddress`, `rImage`)
VALUES ("udupi", "bangalore", "udupi.jpg");

INSERT INTO restaurants(`rName`, `rAddress`, `rImage`)
VALUES ("chulha chauki", "bangalore", "chulhaChauki.jpg");

INSERT INTO restaurants(`rName`, `rAddress`, `rImage`)
VALUES ("ccd", "pune", "ccd.jpg");

INSERT INTO restaurants(`rName`, `rAddress`, `rImage`)
VALUES ("dinner place", "ahmednagar", "dinnerPlace.jpg");

create table products(
	productId INT PRIMARY KEY AUTO_INCREMENT,
	pImage VARCHAR(60),
	productName VARCHAR(60),
	price INT,
	category VARCHAR(60),
	rId INT,
	FOREIGN KEY (rId) REFERENCES  restaurants (restaurantId)
);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("udupiBhel.jpg","bhel",40,"chaat",1);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("udupiCoffee.jpg","coffee",20,"drinks",1);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("udupiMasalaDosa.jpg","Masala Dosa",50,"Breakfast",1);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("udupiUsal.jpg","Usal",30,"chaat",1);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("udupiBhel.jpg","bhel",40,"chaat",1);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("ccdLassi.jpg","Lassi",40,"drinks",3);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("ccdMasalaDosa.jpg","Masala Dosa",100,"breakfast",3);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("ccdVadaSambar.jpg","Vada sambar",30,"breakfast",3);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("ccdVegBiryani.jpg","Veg birayani",140,"meal",3);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("dinnerPlacePoha.jpg","Poha",20,"breakfast",4);

insert into products(`pImage`,`productName`,`price`,`category`,`rId`)
VALUES ("dinnerPlaceSadaDosa.jpg","Sada Dosa",35,"breakfast",4);

ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';

GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

flush privileges;