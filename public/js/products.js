
window.onscroll=function(e){
    console.log('scroll : '+document.body.scrollTop);
    if(document.body.scrollTop>10 || document.documentElement.scrollTop>10){
        document.querySelector("#restaurantHeader").style.height="20px";
    }else{
        document.querySelector("#restaurantHeader").style.height="50px";
    }
};
