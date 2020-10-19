const status=document.querySelectorAll(".changeStatus");
const restaurant=document.getElementsByClassName("restaurants")[0];
const orderId=document.querySelector('.orderId');
const productName=document.querySelector('.productName');
const currentPrice=document.querySelector('.currentPrice');
const changeStatusDiv=document.querySelector('.changeStatusDiv');
const selectedOrderId=document.querySelector('.selectedOrderId');
const cards=document.querySelector('.cards');
const close=document.querySelector('.close');


restaurant.addEventListener('click', e=>{
    if (e.target.getAttribute('class')==='modifyProduct'){
        console.log('ProductId = '+e.target.parentNode.parentNode.children[0].innerText);
        console.log('product Name = '+e.target.parentNode.parentNode.children[3].innerText);
        selectedOrderId.innerHTML='<input type="text" name="productId" value="'+e.target.parentNode.parentNode.children[0].innerText+'" readonly="readonly">';
        currentPrice.innerText=e.target.parentNode.parentNode.children[3].innerText;
        productName.innerText=e.target.parentNode.parentNode.children[2].innerText;
        changeStatusDiv.classList.remove('show');
        cards.classList.add('show');
    }
});

close.addEventListener('click', e=>{
    cards.classList.remove('show');
    changeStatusDiv.classList.add('show');
})
