const status=document.querySelectorAll(".changeStatus");
const restaurant=document.getElementsByClassName("restaurants")[0];
const orderId=document.querySelector('.orderId');
const currentStatus=document.querySelector('.currentStatus');
const changeStatusDiv=document.querySelector('.changeStatusDiv');
const selectedOrderId=document.querySelector('.selectedOrderId');
const cards=document.querySelector('.cards');
const close=document.querySelector('.close');


restaurant.addEventListener('click', e=>{
    if (e.target.getAttribute('class')==='changeStatus'){
        console.log('orderId = '+e.target.parentNode.parentNode.children[0].innerText);
        console.log('currentStatus = '+e.target.parentNode.parentNode.children[3].children[1].innerText);
        selectedOrderId.innerHTML='<input type="text" name="orderId" value="'+e.target.parentNode.parentNode.children[0].innerText+'" readonly="readonly">';
        currentStatus.innerText=e.target.parentNode.parentNode.children[3].children[1].innerText;
        changeStatusDiv.classList.remove('show');
        cards.classList.add('show');
    }
});

close.addEventListener('click', e=>{
    cards.classList.remove('show');
    changeStatusDiv.classList.add('show');
})
