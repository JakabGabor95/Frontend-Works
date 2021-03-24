let nameInput = document.form.username;
let emailInput = document.form.email;
let passwordInput = document.form.password;
let rePasswordInput = document.form.repassword;

let userNameIsValid = false;
let emailIsValid = false;
let passwordIsValid = false;
let passwordsAreSame = false;

(function checkLocalStorage() {
    let userAlreadySingIn = localStorage.getItem('user') ? true : false;
    if(userAlreadySingIn) {
        createSignOutLink()
    }
})();

nameInput.onchange = () => {
    let userName = nameInput.value;
    // console.log(userName);
    //  let userValid = false;
    //  if(userName.length > 5) {
    //      userValid = true;
    // }
    
    // userNameIsValid = userValid;
    
    userNameIsValid = userName.length > 5 ? true : false;
    document.querySelector('.error-username').style.display = userNameIsValid ? 'none' : 'block';

    document.querySelector('button').disabled = allInputAreInValid();
}

emailInput.onchange = () => {
let email = emailInput.value;
emailIsValid = email.length > 5 && email.includes('@') ? true : false;
document.querySelector('.error-email').style.display = emailIsValid ? 'none' : 'block';
document.querySelector('button').disabled = allInputAreInValid();
}

passwordInput.onchange = () => {
let password = passwordInput.value;
passwordIsValid = password.length > 5 ? true : false;
document.querySelector('.error-password').style.display = passwordIsValid ? 'none' : 'block';
document.querySelector('button').disabled = allInputAreInValid();
}

rePasswordInput.onchange = () => {
let rePassword = rePasswordInput.value;
let originPassword = passwordInput.value;

passwordsAreSame = rePassword.length > 5 && rePassword === originPassword ? true : false;
document.querySelector('.error-repassword').style.display = passwordsAreSame ? 'none' : 'block';
document.querySelector('button').disabled = allInputAreInValid();
}

//  document.querySelector('button').addEventListener('click', () => {
//     alert(document.form.userName.value);
//  });

function allInputAreInValid () {
    let allInValid = true;

    if(userNameIsValid && emailIsValid && passwordIsValid && passwordsAreSame) {
        allInValid = false;
    }
    return allInValid;
}

//Server

const submitBtn = document.getElementById('submit-btn');

submitBtn.addEventListener('click', () => {
    
    const user = {name: nameInput.value, email: emailInput.value};
    JSON.stringify(user);
    
    const httpClient = new XMLHttpRequest();
    const localURL = "http://localhost:3000/users";
    httpClient.open('POST',localURL);
   
    httpClient.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    
    httpClient.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 201) {
            const savedUser = JSON.parse(this.responseText);
            alert(savedUser.name + " saved");
            setLocalStorage(savedUser.name)
            
            console.log(savedUser.id);
            setCookie(savedUser.id);
        }
    }
  
    httpClient.send(JSON.stringify(user));

   
    
    // createSignOutLink()
    return user;

});

//COOKIES

function setLocalStorage() {
    localStorage.setItem('user',' signed in');
    // setTimeout(createSignOutLink,0);
    createSignOutLink();
}


function setCookie(userId) {
   let now = new Date();
   now.setTime(now.getTime()+ (1000 * 60 * 60));
   let utcString = now.toUTCString();

  

   document.cookie = `user_id=${userId}; expires=${utcString}; path=/;`
}




function createSignOutLink() {
    
    const wrapper = document.querySelector('.images-wrapper-right');
    const anchor = document.createElement('a');
    anchor.innerText = 'Kilépés';
    anchor.style.color = 'teal';
    anchor.style.fontSize = '1.3rem';
    anchor.style.marginLeft = '10px';
    anchor.style.cursor = 'pointer';
    anchor.style.fontWeight = '600';
   
    
 
    anchor.addEventListener('click', function () {
        localStorage.removeItem('user');
        document.cookie = `user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        anchor.style.display = 'none';
        

    });
    wrapper.appendChild(anchor);
}


