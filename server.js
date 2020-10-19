const express = require('express');
const path=require('path');
const mysql= require('mysql');
const bodyParser= require('body-parser');
const { urlencoded } = require('body-parser');
const session=require('express-session');
// const fileUpload = require('express-fileupload');
const multer = require('multer');
const port = process.env.PORT || 3000;

var reload = require('reload')

var urlEncodedParser= bodyParser.urlencoded({extended : false})

const server=express();
server.set('view engine', 'ejs');

const publicDirectory=path.join(__dirname,'./public');
server.use(express.static(publicDirectory));
server.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));
// server.use(fileUpload());

const db=mysql.createConnection({
    host: "food-db.cqaznpmn9lsc.us-east-2.rds.amazonaws.com",
    database:"delicious_corner",
    user:"admin",
    password:"password"
})
db.connect((err)=>{
    if(!err)
        console.log('successfully connected to DB');
    else
        console.log('could not connect to DB', err);
});


const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'public/images');
    },
    filename: (req, file, callBack) => {
        callBack(null, `RIMG_${file.originalname}`)
    }
  })

const upload = multer({ storage: storage })



server.get('/', (req, res)=>{
    console.log('index page');
    req.session.status='LOGIN';
    res.render('index', {status : req.session.status});
});

server.get('/index', (req, res)=>{
    console.log('index page');
    if(req.session.status!=undefined)
        res.render('index',{status : req.session.status});
    else{
        req.session.status='LOGIN';
        res.render('index', {status: req.session.status});
    }
});

server.get('/login', (req, res)=>{
    console.log('login page');
    res.render('login');
});

server.get('/status',(req,res)=>{
    const status=req.query.stat;
    console.log('status: '+status);
    if(status === 'LOGIN'){
        console.log('redirecting to LOGIN PAGE');
        res.redirect('login');
    }else{
        console.log('logging out the USER');
        console.log('session = '+req.session.userId);  
        req.session.destroy(function(err){  
            if(err){  
                console.log(err);  
            }  
            else  
            {  
                console.log('session = '+req.session);
                res.redirect('/');  
            }  
        });  
    }
})

server.get('/restaurants', (req, res)=>{
    const sql=" select * from restaurants";
    db.query(sql, (err,result)=>{
        if(!err){
            console.log('category = '+req.session.category);
            console.log('place = '+req.session.place);
            if(req.session.category!=undefined || req.session.place!=undefined){
                req.session.category=undefined;
                req.session.place=undefined;
            }
            console.log("displying the index/restaurant page having restaurants");
            res.render('restaurants',{data : result, status: req.session.status});
        }else{
            console.log("error while showing the restauarnt/index page. Error: "+err);
            res.render('index',{status: req.session.status});
        }
    });
});

const getProducts=(req, res, rId)=>{
    console.log("rId = "+rId);
    const sql="select * from products where rId="+rId;
    console.log('query to get menu = '+sql);

    db.query(sql, (err, result)=>{
        if(!err){
            console.log('fetching the menu for you');
            console.log(result[0]);
            req.session.data=result;
            req.session.product=req.query.id;
            console.log('status session = '+req.session.status);
            // res.render('products', {data: result, message: req.session.message});
            res.render('products',{data: result, status: req.session.status});
        }else{
            console.log('could not get the menu, because of error: '+err);
            res.render('index',{status: req.session.status});
        }
    });
}

//1. validate the user
//2.  set session status=LOGOUT
//3. set session userId= login User id
//4. check if session restaurantId is present if yes.. then show the products page for all restaurants.
//5. check if session category is preset i.e if login through categories page.. if yes.. then show the category page data.
//else show the index page.
server.post('/login', urlEncodedParser ,(req, res)=>{
    console.log('body : ', req.body);
    const sql="select * from users where email='"+req.body.email+"' and password='"+req.body.password+"'";
    console.log('query : '+sql);
    db.query(sql, (err, result)=>{
        console.log('query executed : '+sql);
    if(err){
        console.log('could not validate the user because of the following error: '+err);
        res.redirect('login');
    }else if(result.length>0){
        console.log('login successfull');
        req.session.status='LOGOUT';
        console.log('user : '+result[0].userId);
        req.session.userId=result[0].userId;
        if(req.session.rId!=undefined){
            console.log('show all producst of a particular restaurant');
            getProducts(req, res, req.session.rId);
        }else if(req.session.category!=undefined){
            console.log(' show the categories page for categories: '+req.session.category);
            res.render('prodCtgries',{data: req.session.data,status : req.session.status});
        }else if(req.session.place!=undefined){
            console.log('rendering products page for a specific place');
            res.render('restaurant',{data: req.session.data});
        }else{
            res.render('index',{ status: req.session.status});
        }    
    }else{
        console.log('invalid user/password');
        res.redirect("login");
    }
    });
});
 

server.get('/register', (req, res)=>{
    console.log('register page');
    res.render('register');
});

server.post('/register', urlEncodedParser ,(req, res)=>{
    console.log('body : ', req.body);
    const sql = "INSERT INTO `users`(`firstName`, `lastName`, `email`, `password`, `phone`, `address`, `State`, `Country`) "+
    "VALUES ('"+ req.body.firstName+"','"+req.body.lastName+"','"+ req.body.email+"','"+req.body.password+"','"+
    req.body.phone+"','"+req.body.address+"','"+req.body.state+"','"+req.body.country+"')";

    db.query(sql, (err, result)=>{
        if(err){
                console.log('could not insert in DB. Error : '+err);
                res.redirect('register');
        }else
        res.redirect('login');
    });  
});

//THis will be accessed when the user wants to list menu for a particular category. For now it can be accessed from the index page only and from the
// POST call of login page.
//set session data = categories page data
server.get('/foodCategory', (req, res)=>{
    console.log('restaurant page');
    console.log('place session: '+req.session.place);
    req.session.place=undefined;
    console.log('rId session: '+req.session.rId);
    req.session.rId=undefined;
    console.log('status: '+req.session.status);
    const category=req.query.category.toUpperCase();
    console.log("category = "+category);
    req.session.category=category;
    const sql="select p.pImage, p.productName, p.price, p.productId, p.category,r.rName, p.rId from products p inner join restaurants r on (p.rId =r.restaurantId) where p.category= '"+category+"'";
    console.log('query to fetch restaurants of a particular category: '+sql);
    db.query(sql, (err, result)=>{
        if(err){
            console.log('error in fetching the restaurant page ERR: '+err);
            res.redirect('index', {status: req.session.status});
        }else{
            console.log('fetching restaurants with category: ');
            req.session.data=result;
            res.render('prodCtgries',{data:result,status: req.session.status});
        }
    })
});
server.get('/restaurant', (req, res)=>{
    console.log('restaurant page');
    let category;
    let sql="";
    let flag;
    if(req.query.place!=undefined){
        req.session.category=undefined;
        req.session.rId=undefined;
        const place=req.query.place.toUpperCase();
        console.log("place = "+place);
        sql="select * from restaurants where rAddress='"+place+"'";
        console.log('query to fetch restaurants from a particular area: '+sql);
    }else if(req.query.category!=undefined){
        category=req.query.category.toUpperCase();
        req.session.place=undefined;
        const RId=req.query.rId;
        req.session.rId=RId;
        console.log('category: '+category);
        console.log('RId= '+RId);
        //chnage query to fetch from products of a category
        sql="select * from products where rId="+RId;
        flag=1;
        console.log('query to fetch restaurants menu for a particular restaurant : '+sql);
    }else{
        req.session.category=undefined;
        req.session.place=undefined;
        sql="select * from restaurants";
        console.log('query to fetch general restarants page : '+sql);
    }
    db.query(sql, (err, result)=>{
        if(err){
            console.log('error in fetching the restaurant page');
            res.render('index', {status: req.session.status});
        }else{
            console.log('fetching restaurants or products or categories: ');
            req.session.data=result;
            if(flag)
                res.render('products',{data: result, ProdCtgry:category, status: req.session.status});
            else
                res.render('restaurants',{data:result, ProdCtgry: category, status: req.session.status});
        }
    });
});
server.get('/cart', (req, res)=>{
    console.log('showing cart page for user_id : '+req.session.userId);
    const sql="select p.pImage, o.orderId, p.productName, p.price, o.Qty, o.Ostatus, r.rName from orders o "+
    "inner join products p on (o.Pid=p.productId) inner join restaurants r on (p.rId= r.restaurantId)"+
    "where o.CId="+req.session.userId;
    console.log('query to fetch cart: '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('showing the items in cart');
            req.session.data=result;
            res.render('cart',{data: result});
        }else{
            console.log('error while fetching the orders. Err : '+err);
            getProducts(req, res, req.session.rId);
        }
    })
});
server.post('/cart', urlEncodedParser, (req, res)=>{
    console.log('cart object: ',req.body );  
    console.log(req.body.Qty.length);
        for(var i=0; i<req.body.Qty.length; i++){
            const sql="update orders set Qty="+req.body.Qty[i]+" where orderId="+req.body.orderId[i];
            console.log('query to update the qty in cart = '+sql);
            db.query(sql,(err, result)=>{
                if(err){
                    console.log('could not update the order because of the following error: '+err);
                }else{
                    console.log('updated the qty of order id= '+req.body.orderId[i]);
                }
            });
            if(i==req.body.Qty.length-1){
                res.redirect('cart');
            }
        }
   
});
server.get('/deleteCart',(req,res)=>{
    console.log(' delete order from cart with order id= '+req.query.orderId);
    const sql="delete from orders where orderId="+req.query.orderId;
    console.log('query to dleete order from cart: '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('order deleted from cart');
            res.redirect('cart');
        }else{
            console.log('could not delete order from the cart : err: '+err);
            res.redirect('cart');
        }
    })
});

server.get('/products',(req, res)=>{
    req.session.rId=req.query.id;
    console.log('category session: '+req.session.category+'     :: place : '+req.session.place );
    req.session.category=undefined;
    req.session.place=undefined;
    console.log('restaurant id= '+req.session.rId);
    getProducts(req, res, req.query.id);
});

server.get('/addToCart', (req, res)=>{
    console.log("product id = "+req.query.id);
    let categoryPage;
    if(!req.session.userId){
        console.log('please login before you add order to your cart');
        res.redirect('login');
    }else{
        console.log('user is already logged in hence progressing with saving the order in cart');
                if(req.session.category!=null)
                categoryPage=true;
                //query to check if product already exists, if yes.. increment the quantity
                const sql="select * from orders where Pid="+req.query.id+" and CId="+req.session.userId;
                db.query(sql,(err, result)=>{
                    if(err){
                        console.log('error while fetching the records from order table. Error: '+err);
                    }else if(result.length>0){
                        console.log('order already exists in the order table hence increasing the quantity by 1');
                        const newQty=result[0].Qty+1 ;
                        const sql="update orders set Qty="+newQty+" where Pid="+req.query.id+" and CId="+req.session.userId;
                        db.query(sql,(err, result)=>{
                            if(!err){
                                console.log(req.session.category);
                                console.log('successfully updated the order');
                                if(req.session.category==undefined)
                                {
                                    console.log('products page');
                                    res.render('products',{data: req.session.data, status: req.session.status});
                                }else{
                                    console.log('products category page: ');
                                    res.render('prodCtgries',{data: req.session.data, status: req.session.status});   
                                }
                                
                            }else{
                                console.log('error while updating the order. Error: '+err);
                                if(req.session.category==undefined)
                                {
                                    console.log('products page');
                                    res.render('products',{data: req.session.data, status: req.session.status});
                                }else{
                                    console.log('products category page: ');
                                    res.render('prodCtgries',{data: req.session.data, status: req.session.status});   
                                }
                            }
                        })
                    }else{
                            const sql="insert into orders(`CId`,`Pid`,`Qty`,`Ostatus`) values ("+req.session.userId+","+req.query.id+",1, 'RECEIVED')";
                            console.log('query to insert order in table : '+sql);
                            db.query(sql, (err, result)=>{
                                if(!err){
                                    console.log('sucessfully inserted the order in cart');
                                    if(req.session.category==undefined)
                                    {
                                        console.log('products page');
                                        res.render('products',{data: req.session.data, status: req.session.status});
                                    }else{
                                        console.log('products category page: ');
                                        res.render('prodCtgries',{data: req.session.data, status: req.session.status});   
                                    }
                                }else{
                                    console.log('could not insert the order in table because of the following error: '+err);
                                    if(req.session.category==undefined)
                                    {
                                        console.log('products page');
                                        res.render('products',{data: req.session.data, status: req.session.status});
                                    }else{
                                        console.log('products category page: ');
                                        res.render('prodCtgries',{data: req.session.data, status: req.session.status});   
                                    }
                                    }
                            });
                        }
                 });
        }      
    });

server.get('/profile', (req, res)=>{
    console.log('Login User: '+req.session.userId);
    const sql="select * from users where userId="+req.session.userId;
    console.log('query to get profile : '+sql);
    db.query(sql, (err, result)=>{
        if(err){
            console.log('could not get the profile for user : '+req.session.userId);
            res.render('index', {status: req.session.status});
        }else{
            console.log('loading profile page: ');
            const sql="select o.*, u.*, p.*, r.* from orders o "+
            "inner join users u on(u.userId=o.CId) "+
            "inner join products p on (o.Pid= p.productId) "+
            "inner join restaurants r on(p.rId= r.restaurantId)"+
            "where CId="+req.session.userId+" and Ostatus!='delivered'";
            console.log('query to fetch active orders: '+sql);
            db.query(sql, (err, result)=>{
                if(err){
                    console.log('error in fetching orders');
                    res.render('profile',{data : 'error in fetching orders'});
                }else{
                    console.log('fetched acive orders: ');
                    res.render('profile',{data:result});
                }
            });
        }
    });
});

































server.get('/showProducts', (req,res)=>{
    console.log('show products for restaurant: '+req.session.rId);
    const sql="select * from products where rId="+req.session.rId;
    console.log('query to get menu = '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('getting product list');
            res.render('showProducts', {data: result});
        }else{
            console.log('could not get products');
            
        }
    }) 
});
server.post('/showProducts', urlEncodedParser, (req, res)=>{
    console.log('body = ',req.body);
    const sql='update products set price='+req.body.newPrice+" where productId= "+req.body.productId;
    console.log('sql to update price : '+sql);
    db.query(sql,(err, result)=>{
        if(!err){
            console.log('successfully updated the price');
        }
        else{
            console.log('could not update the price');
        }
    });
    res.redirect('/showProducts');
});


server.get('/rLogin', (req, res)=>{
    console.log('admin login page');
    res.render('rLogin');
});
server.post('/rLogin', urlEncodedParser ,(req, res)=>{
    console.log('body : ', req.body);
    const sql="select restaurantId from restaurants where ownerEmail='"+req.body.email+"' and ownerPassword='"+req.body.password+"'";
    console.log('query : '+sql);
    db.query(sql, (err, result)=>{
        console.log('query executed : '+sql);
    if(err){
        console.log('could not validate the user because of the following error: '+err);
        res.render('rLogin');
    }else if(result.length>0){
        console.log('login successfull');
        console.log("result : "+result[0].restaurantId);
        const sql="select o.orderId,u.firstName,u.lastName,p.productName, u.address, u.phone, o.Qty, o.Ostatus, o.CId  "+
        "from users u  join orders o  on u.userId = o.CId "+
        "inner join products p on o.Pid =p.productId where  o.Pid in (select p.productId from products p where p.rId = "+result[0].restaurantId+")";
        console.log("query to fetch orders: "+sql);
        req.session.rId=result[0].restaurantId;
        db.query(sql, (err, result)=>{
            if(err){
                    console.log('could not load orders page. Error : '+err);
                    res.redirect('rLogin');
            }else{
                console.log('redirecting to orders page');
                req.session.data=result;
                res.redirect('/orders');
                // res.render('orders', {data : result});
            } 
        });  
    }else{
        console.log('invalid user/password');
        res.render("rLogin");
    }
    });
});
server.get('/addRestaurant', (req,res)=>{
    console.log('add restaurant page');
    res.render('addRestaurant');
});

server.post('/addRestaurant', upload.single('image'),urlEncodedParser ,(req, res)=>{
    const file=req.file;
    console.log('body : ', req.body);
    console.log("image :"+file.filename);
    const sql = "INSERT INTO `restaurants`(`rName`,`ownerName`, `ownerLastName`, `ownerEmail`, `ownerPassword`, `rPhone`, `rAddress`, `rState`, `rImage`) "+
    "VALUES ('"+ req.body.rName+"','"+ req.body.firstName+"','"+req.body.lastName+"','"+ req.body.email+"','"+req.body.password+"','"+
    req.body.phone+"','"+req.body.address+"','"+req.body.state+"','"+file.filename+"')";

    console.log('sql to add restaurant = '+sql);
    db.query(sql, (err, result)=>{
        if(err){
                console.log('could not insert in DB. Error : '+err);
                res.render('addRestaurant');
        }else{
            console.log("restaurant data inserted successfully");
            res.redirect('rLogin');
        }
    });  
    
});


server.get('/orders', (req,res)=>{
    res.render('orders', {data: req.session.data});
});
server.post('/orders',urlEncodedParser , (req, res)=>{
    console.log('change startus body : ',req.body);
    const sql="update orders set Ostatus = '"+req.body.newStatus+"' where orderId= "+req.body.orderId;
    console.log('query fired : '+sql);
    db.query(sql, (err, result)=>{
        if(err){
            console.log('Error while updating the status of the order with order id = '+req.body.orderId+ 'error = '+err);
        }else{
            console.log('Successfully updated the status of the order with order id = '+req.body.orderId);
        }
    })
    getOrders(req, res);
})
server.get('/deleteOrder',(req, res)=>{
    console.log('deleteing order '+req.query.id);
    const sql="delete from orders where orderId="+req.query.id;

    console.log("query to delet the order: "+sql);
    db.query(sql, (err, result)=>{
        if(err){
            console.log("error while deleting the order with order id= "+req.query.id+" :: err = "+err);
        }
        else{
            console.log("successfully deleted the order with order id = "+req.query.id);
            const sql="select o.orderId,u.firstName,u.lastName,p.productName, u.address, u.phone, o.Qty, o.Ostatus, o.CId  "+
            "from users u  join orders o  on u.userId = o.CId "+
            "inner join products p on o.Pid =p.productId where  o.Pid in (select p.productId from products p where p.rId = "+req.session.rId+")";
            console.log("query to fetch orders: "+sql);
            db.query(sql, (err, result)=>{
                db.query(sql, (err, result)=>{
                    if(err){
                            console.log('could not load orders page. Error : '+err);
                            res.redirect('rLogin');
                    }else{
                        console.log('redirecting to orders page');
                        req.session.data=result;
                        res.redirect('/orders');
                    } 
                });  
            })
        }
    })
    
});



server.get('/deleteProduct', (req, res)=>{
    console.log('deleet product with id = '+req.query.id);
    const sql='delete from products where productId='+req.query.id;
    console.log('query to delete product = '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('deleting the product');
        }else{
            console.log('could not delete the product');
        }
    });
    res.redirect('/showProducts');
})

server.get('/addProduct', (req,res)=>{
    console.log('add restaurant page');
    res.render('addRestaurant');
});

server.listen(port, ()=>{
    console.log('server started at port 3000');
});

reload(server);