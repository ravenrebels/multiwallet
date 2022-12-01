fetch("/signin/publicprofiles")
  .then((response) => response.json())
  .then((data) => {
    data.map(createCustomElementAndAddToApp);
  });

function createCustomElementAndAddToApp(userData) {
  const dom = document.createElement("c-user");
  document.getElementById("app").appendChild(dom);
  dom.setData(userData);
}
/*
 Define a custom element, a web standard for encapsulated custom DOM elements
 
*/
class User extends HTMLElement {
  data = null;
  setData(newData) {
    this.data = newData;
    this.myRender();
  }
  myRender() {
    if (!this.data) {
      return;
    }
    this.innerHTML = `
        <div class="plate card" style="width: 18rem;">
        <img class="card-img-top" 
        style="height: 100px; object-fit: cover  ;"
        src="${this.data.profileImageURL}" 
      
        alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title">${this.data.displayName}</h5>
           <a href="#" class="btn btn-primary">Sign in</a>
        </div>
      </div>`;

    this.querySelector("a").addEventListener("click", (event) => {
      postData("/signin/setupsession", { userId: this.data.id }).then(
        (data) => {
          window.location.href = "/"; // JSON data parsed by `data.json()` call
        }
      );
    });
  }
}
customElements.define("c-user", User);

// Example POST method implementation:
async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
