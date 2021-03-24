const properties = [
    { propertyName: 'Napos lakás', price: 24500000, imegUrl:
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1506&q=80' },
    { propertyName: 'Eladó ház', price: 32700000, imegUrl:
    'https://images.unsplash.com/photo-1483097365279-e8acd3bf9f18?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=999&q=80' },
    { propertyName: 'Vidéki ház', price: 15000000, imegUrl:
    'https://images.unsplash.com/photo-1472224371017-08207f84aaae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80' },
    { propertyName: 'Felújított lakás', price: 42700000, imegUrl:
    'https://images.unsplash.com/photo-1451153378752-16ef2b36ad05?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1347&q=80' },
    { propertyName: 'Panel lakás', price: 29900000, imegUrl:
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1506&q=80' },
    { propertyName: 'vidéki nyaraló', price: 120500000, imegUrl:
    'https://images.unsplash.com/photo-1483097365279-e8acd3bf9f18?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=999&q=80' },
    { propertyName: 'Kis ház', price: 107000000, imegUrl:
    'https://images.unsplash.com/photo-1472224371017-08207f84aaae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80' },
    ];

    const propertiesURL = "http://localhost:3000/properties";
    document.addEventListener('DOMContentLoaded', () => {

           
            
        const renderCard = ()  => {
            const cardWrapper = document.createElement('div');
            cardWrapper.setAttribute("id", "card-holder");
            for(let i = 0; i < properties.length; i++) {

                const div = document.createElement('div');
                div.setAttribute('class',"property-card second-property-card")
                const div2 = document.createElement('div');
                div2.setAttribute('class', 'property-img-wrapper');
                let property = properties[i];
                const img = document.createElement('img');
                img.src = properties[i].imegUrl;

                const section = document.createElement('section');
                const h2 = document.createElement('h2');
                h2.innerHTML = properties[i].propertyName;

                const p = document.createElement('p');
                p.innerHTML = `<strong>Ár: </strong> ${(properties[i].price / 1000000).toFixed(2)} M`;

                const main = document.getElementById('main');

                div.appendChild(div2);
                div2.appendChild(img);
                div.appendChild(section);
                section.appendChild(h2);
                section.appendChild(p);

                
                cardWrapper.appendChild(div);
               

                main.appendChild(cardWrapper);

               
    //     <!-- <div class="property-card second-property-card">
    //     <div class="property-img-wrapper ">
    //         <img src="https://images.unsplash.com/photo-1482867899247-e295efdd8c1a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80" alt="apartman kép">
    //     </div>
    //     <section>
    //         <h2>Felújított apartman</h2>
    //         <p><strong>Ár:</strong> 42.5 M huf</p>
    //     </section>
    // </div> -->

             


            }
        }   

            function getMethod() {
                
                const param = {
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                             },
                     method: 'GET',
                  }
                
                 
                
                  const response = fetch(propertiesURL, param);
                  response
                      .then(data => data.json())
                      .then(resp => {
                          const propertyList = resp
                          for(property of propertyList) {
                             properties.unshift({
                                 propertyName: property.propertyName,
                                 price: Number(property.price),
                                 imegUrl: property.imegUrl
                             },)
                             }
                             renderCard();
                      })
                      .catch(error => console.log(error))
            }
            // GET

            getMethod();
    });



