var express = require('express');
var router = express.Router();
const path=require('path');
const mysql= require('mysql');
const bodyParser= require('body-parser');
const { urlencoded } = require('body-parser');
const session=require('express-session');
const multer = require('multer');
const dotenv=require('dotenv');

dotenv.config();
const server=express();
server.set('view engine', 'ejs');
module.exports = server ;
// router.use();

const publicDirectory=path.join(__dirname,'../public');
server.use(express.static(publicDirectory));

var urlEncodedParser= bodyParser.urlencoded({extended : false})

server.use(express.static(publicDirectory));
server.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));
server.use(router);
// server.use(fileUpload());
const db=mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    database:process.env.DATABASE,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASS
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

router.get('/', (req, res)=>{
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
});

server.get('/login', (req, res)=>{
    console.log('login page');
    res.render('login');
});

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
    const sql="select p.*, r.* from products p right join restaurants r on (p.rId=r.restaurantId) where rId="+rId;
    console.log('query to get menu = '+sql);

    db.query(sql, (err, result)=>{
        if(!err){
            console.log('fetching the menu for you');
            console.log(result[0]);
            req.session.data=result;
            req.session.product=req.query.id;
            console.log('status session = '+req.session.status);
            const sql="select distinct category from products where rId="+rId;
            db.query(sql, (err, result1)=>{
                if(!err)
                {
                    console.log('Fetched products and categories successfully');
                    res.render('products',{data: result, status: req.session.status, categories: result1});
                }else{
                    console.log('could not get the menu, because of error: '+err);
                    res.render('index',{status: req.session.status});
                }
            })
            // res.render('products', {data: result, message: req.session.message});
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
        req.session.userName=result[0].firstName;
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
    "VALUES (upper('"+ req.body.firstName+"'),upper('"+req.body.lastName+"'),'"+ req.body.email+"','"+req.body.password+"','"+
    req.body.phone+"',upper('"+req.body.address+"'),upper('"+req.body.state+"'),upper('"+req.body.country+"'))";

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
            res.render('index', {status: req.session.status});
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
        req.session.category=undefined;
        //chnage query to fetch from products of a category
        sql="select p.*, r.* from products p inner join restaurants r on (p.rId=r.restaurantId) where p.rId="+RId;
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
            console.log('error in fetching the restaurant page: err: '+err);
            res.render('index', {status: req.session.status});
        }else{
            console.log('fetching restaurants or products or categories: ');
            req.session.data=result;
            if(flag){
                const sql="select distinct category from products where rId="+req.query.rId;
                console.log('query to get distinct restaurants = '+sql);
                db.query(sql, (err, result2)=>{
                    if(!err){
                        console.log("got distict categories, products and restaurants info, rendering products page");
                        res.render('products',{data: result, ProdCtgry:category, status: req.session.status, categories: result2});
                    }else{
                        console.log("could not get distinct categories for products page rendering the index page because of ERR: "+err);
                        res.render('index', {status: req.session.status});
                    }
                })
                //  getProducts(req, res, req.session.RId);
            }else
                res.render('restaurants',{data:result, ProdCtgry: category, status: req.session.status});
        }
    });
});
server.get('/cart', (req, res)=>{
    console.log('showing cart page for user_id : '+req.session.userId);
    const sql="select p.pImage, o.orderId, p.productName, p.price, o.Qty, o.Ostatus, r.rName, o.CId from orders o "+
    "inner join products p on (o.Pid=p.productId) inner join restaurants r on (p.rId= r.restaurantId)"+
    "where o.CId="+req.session.userId +" and o.Ostatus='PLACED'";
    console.log('query to fetch cart: '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('showing the items in cart');
            req.session.data=result;
            res.render('cart',{data: result, user: req.session.userName});
        }else{
            console.log('error while fetching the orders. Err : '+err);
            getProducts(req, res, req.session.rId);
        }
    })
});
server.post('/cart', urlEncodedParser, (req, res)=>{
    console.log('cart object: ',req.body );  
    console.log('qty length: '+req.body.Qty.length);
    console.log('order id length: '+req.body.orderId.length);
        for(var i=0; i<req.body.Qty.length; i++){
            console.log('orderId: '+req.body.orderId[i]+" quantity : "+req.body.Qty[i]);
            if(req.body.Qty.length==1){
                console.log('only 1 elemt present to be updated in cart : ');
                console.log('order id='+req.body.orderId);
                var sql="update orders set Qty="+req.body.Qty[i]+" where orderId="+req.body.orderId;
            }else{
                console.log('more than 1 elemt present to be updated in cart : ');
                console.log('order id='+req.body.orderId[i]);
                var sql="update orders set Qty="+req.body.Qty[i]+" where orderId="+req.body.orderId[i];
            }
            console.log('query to update the qty in cart = '+sql);
            db.query(sql,(err, result)=>{
                if(err){
                    console.log('could not update the order because of the following error: '+err);
                }else{
                    console.log('updated the qty of order id= '+req.body.orderId[i]);
                }
            });
            if(i==req.body.Qty.length-1){
                console.log('i :' + i);
                res.redirect('cart');
            }
        }
});
server.get('/deleteCart',(req,res)=>{
    console.log(' delete order from cart with order id= '+req.query.id);
    const sql="delete from orders where orderId="+req.query.id;
    console.log('query to dleete order from cart: '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('order deleted from cart');
            // const sql="select p.pImage, o.orderId, p.productName, p.price, o.Qty, o.Ostatus, r.rName, o.CId from orders o "+
            // "inner join products p on (o.Pid=p.productId) inner join restaurants r on (p.rId= r.restaurantId)"+
            // "where o.CId="+req.session.userId +" and o.Ostatus='PLACED'";
            // console.log('query to get orders page after deletion of an order: '+sql);
            // db.query(sql,(err, result)=>{
            //     if(!err){
            //         console.log('displaying cart');
            //         req.session.data=result;
            //         res.render('cart',{data: req.session.data, user: req.session.userName});
            //     }else{
            //         console.log('error while getting the cart page:');
            //         res.render('index',{status:req.session.status});
            //     }
            // })
           res.redirect('cart');
        }else{
            console.log('could not delete order from the cart : err: '+err);
            res.redirect('cart',{data: req.session.data, user: req.session.userName});
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
                if(req.session.category!=undefined)
                categoryPage=true;
                //query to check if product already exists, if yes.. increment the quantity
                const sql="select * from orders where Pid="+req.query.id+" and CId="+req.session.userId+" and Ostatus='PLACED'";
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
                                    getProducts(req, res, req.session.rId);
                                    // res.render('products',{data: req.session.data, status: req.session.status});
                                }else{
                                    console.log('products category page: ');
                                    res.render('prodCtgries',{data: req.session.data, status: req.session.status});   
                                }
                                
                            }else{
                                console.log('error while updating the order. Error: '+err);
                                if(req.session.category==undefined)
                                {
                                    console.log('products page');
                                    getProducts(req, res, req.session.rId)
                                    // res.render('products',{data: req.session.data, status: req.session.status});
                                }else{
                                    console.log('products category page: ');
                                    res.render('prodCtgries',{data: req.session.data, status: req.session.status});   
                                }
                            }
                        })
                    }else{
                            const sql="insert into orders(`CId`,`Pid`,`Qty`,`Ostatus`) values ("+req.session.userId+","+req.query.id+",1, 'PLACED')";
                            console.log('query to insert order in table : '+sql);
                            db.query(sql, (err, result)=>{
                                if(!err){
                                    console.log('sucessfully inserted the order in cart');
                                    console.log('category: '+req.session.category)
                                    if(req.session.category==undefined)
                                    {
                                        console.log('products page');
                                        getProducts(req, res, req.session.rId);
                                        // res.render('products',{data: req.session.data, status: req.session.status});
                                    }else{
                                        console.log('products category page: ');
                                        res.render('prodCtgries',{data: req.session.data, status: req.session.status});   
                                    }
                                }else{
                                    console.log('could not insert the order in table because of the following error: '+err);
                                    if(req.session.category==undefined)
                                    {
                                        console.log('products page');
                                        getProducts(req, res, req.session.rId);
                                        // res.render('products',{data: req.session.data, status: req.session.status});
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

server.get('/placeOrder',(req, res)=>{
    console.log('placing the orders from cart for user = '+req.query.id);
    const sql="update orders set Ostatus='RECEIVED' where CId="+req.query.id+" and Ostatus='PLACED'";
    console.log('query to place the order = ' +sql);
    db.query(sql,(err, result)=>{
        if(!err){
            console.log('placed the order for user id: '+req.session.userId);
            const sql="select p.pImage, o.orderId, p.productName, p.price, o.Qty, o.Ostatus, r.rName,o.CId from orders o "+
            "inner join products p on (o.Pid=p.productId) inner join restaurants r on (p.rId= r.restaurantId)"+
            "where o.CId="+req.session.userId +" and o.Ostatus='PLACED'";
            console.log('query to get orders page after placing the order: '+sql);
            db.query(sql,(err, result)=>{
                if(!err){
                    console.log('displaying cart');
                    req.session.data=result;
                    res.render('cart',{data: req.session.data, user: req.session.userName});
                }else{
                    console.log('error while getting the cart page:');
                    res.render('index',{status:req.session.status});
                }
            })
        }else{
            console.log('could not place the order : err: '+err);
            res.redirect('cart',{data: req.session.data, user: req.session.userName});
        }
    })
})
    

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
            "where CId="+req.session.userId;
            console.log('query to fetch active orders: '+sql);
            db.query(sql, (err, result)=>{
                if(err){
                    console.log('error in fetching orders');
                    res.render('profile',{data : 'error in fetching orders'});
                }else{
                    console.log('fetched acive orders and user profile: ');
                    req.session.data=result;
                    // const sql="select o.Ostatus, p.*, r.rName, from products p inner join orders o on (o.Pid=p.produsctId)"
                    res.render('profile',{data:result});
                }
            });
        }
    });
});
server.post('/profile',urlEncodedParser, (req, res)=>{
    console.log('user id = '+req.session.userId);
    console.log('body : '+req.body.fname);
    const sql="update users set firstName = upper('"+req.body.fname+"'), lastName=upper('"+req.body.lname+"'), email= '"+req.body.email+"', phone='"+req.body.contact+
    "', address=upper('"+req.body.address+"') , state=upper('"+req.body.state+
    "') where userId="+req.session.userId;
    console.log(' query to edit personal info: '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('updated the personal info of user : '+req.session.userId);
            const sql="select o.*, u.*, p.*, r.* from orders o "+
            "inner join users u on(u.userId=o.CId) "+
            "inner join products p on (o.Pid= p.productId) "+
            "inner join restaurants r on(p.rId= r.restaurantId)"+
            "where CId="+req.session.userId;
            console.log('query to fetch active orders and profile of user after update: : '+sql);
            db.query(sql, (err, result)=>{
                if(!err){
                    console.log('fetched the profile of the user after update of profile info');
                    req.session.data=result;
                }else{
                    console.log(' could not fetch the profile page after update of profile info. ERR : '+err);
                }
                res.render('profile', {data: req.session.data})
            });
        }else{
            console.log('could not update the profile info for the user because of the following err. ERR :'+err);
            res.render('profile',{data:req.session.data});
        }
    })
})
server.get('/cancelOrder',(req, res)=>{
    console.log('cancel order with order id= '+req.query.id);
    const sql="update orders set Ostatus='CANCELLED' where orderId = "+req.query.id;
    console.log('query to cancel the order = '+sql);
    db.query(sql, (err, result)=>{
        if(!err){
            console.log('cancelled the order');
            const sql="select o.*, u.*, p.*, r.* from orders o "+
            "inner join users u on(u.userId=o.CId) "+
            "inner join products p on (o.Pid= p.productId) "+
            "inner join restaurants r on(p.rId= r.restaurantId)"+
            "where CId="+req.session.userId;
            console.log('query to fetch all orders and profile of user after cancelling the order: : '+sql);
            db.query(sql, (err, result)=>{
                if(!err){
                    console.log('fetched the profile of the user after update of profile info');
                    req.session.data=result;
                }else{
                    console.log(' could not fetch the profile page after update of profile info. ERR : '+err);
                }
                res.render('profile', {data: req.session.data})
            });
        }else{
            console.log('could not Cancel the order for the user because of the following err. ERR :'+err);
            res.render('profile',{data:req.session.data});
        }
    })
});