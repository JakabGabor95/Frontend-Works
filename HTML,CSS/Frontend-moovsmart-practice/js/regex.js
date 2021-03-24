let propertyNameInput = document.form.propertyName;
let priceInput = document.form.price;
let imageInput = document.form.image;


let propertyIsValid = false;
let priceIsValid = false;
let imageIsValid = false;


propertyNameInput.onchange = () => {
    let propertyName = propertyNameInput.value;
    const patternPropName = /^[a-zA-Z]{7}[a-zA-ZáéíöüúóőúÉÖÜÍŐÚÁÉ\d]{0,93}$/; 
    let patternPropNameValid = propertyName.match(patternPropName);
    
    propertyIsValid = patternPropNameValid !== null ? true : false;
    
    document.querySelector('.error-property-name').style.display = patternPropNameValid ? 'none' : 'block';
    document.querySelector('button').disabled = allInputAreInValid();
}

priceInput.onchange = () => {
    let price = priceInput.value;
    const patternPrice = /^[0-9]{1,9999}$/; 
    let patternPriceIsValid = price.match(patternPrice);
    
    priceIsValid = patternPriceIsValid !== null ? true : false;

    document.querySelector('.error-price').style.display = patternPriceIsValid ? 'none' : 'block';
    document.querySelector('button').disabled = allInputAreInValid();
 }

 
 imageInput.onchange = () => {
    let image = imageInput.value;
    const patternImage = /^https?:\/\/{1,248}/;
    let patternImageIsValid = image.match(patternImage);

    imageIsValid = patternImageIsValid !== null ? true : false;
   
    document.querySelector('.error-image').style.display = patternImageIsValid ? 'none' : 'block';
    document.querySelector('button').disabled = allInputAreInValid();
}


function allInputAreInValid () {
    let allInValid = true;

    if(propertyIsValid && priceIsValid && imageIsValid) {
        allInValid = false;
    }
    return allInValid;
}



  // SERVER
  const subBtn = document.getElementById('submit-btn');
  const propertiesURL = "http://localhost:3000/properties";
  
  
  subBtn.addEventListener('click', function () {
      const property = {propertyName: propertyNameInput.value, price: priceInput.value, imegUrl: imageInput.value}
      
    
     const param = {
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
                 },
        body: JSON.stringify(property),         
        method: 'POST',
      }
    
     
    
      const response = fetch(propertiesURL, param);
      response
          .then(data => data.json())
          .then(resp => resp)
          .catch(error => console.log(error))
    
     
  });



