//Get meta data info
fetch("/settings")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("headline").innerText = data.headline;
    document.getElementById("tagline").innerText = data.tagline;
  });

fetch("/signin/publicprofiles")
  .then((response) => response.json())
  .then((data) => {
    // add the annon first
    const dom = document.createElement("c-annon");
    document.getElementById("app").appendChild(dom);

    //Now add each public profile
    data.map(addProfile);


  });

function addProfile(userData) {
  const dom = document.createElement("c-user");
  document.getElementById("app").appendChild(dom);
  dom.setData(userData);
}

class Annon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="paper card">
        <div class="card-body">
          <h5 class="card-title">Enter any name</h5> 
           
          <p>
              If you for example enter <em>Elvis25</em> a new account for <em>Elvis25</em> will be created.
          </p>
          <form>
            <input type="text" class="form-control"/>
            <button class="btn btn-primary mt-3" type="submit"> 
              <i class="fa-solid fa-house" style="margin-right: 5px"></i>  Enter
            </button>
          </form>
        </div>
    </div>`;

    const input = this.querySelector("input");
    const button = this.querySelector("button");
    function submit(event) {
      if (!input.value) {
        return;
      }
      if (input.value.length < 3) {
        alert("Enter more than 3 characters please");
        return;
      }

      button.disabled = true;
      const promise = signIn(input.value);
      promise.catch((e) => {
        alert(e);
        button.disabled = false;
      });
      event.preventDefault();
      return false;
    }
    this.querySelector("form").addEventListener("submit", submit);
  }
}
customElements.define("c-annon", Annon);
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
    <div class="paper">
      <div class="card" style="width: 18rem;">
        <img class="card-img-top" 
          src="${this.data.profileImageURL}"

          alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">${this.data.displayName}</h5>
            <form>
              <button class="btn btn-primary">
                <i class="fa-solid fa-house" style="margin-right: 5px"></i>  Enter
              </button>
            </form>
          </div>
        </div>
      </div>`;

    const button = this.querySelector("button");
    this.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();

      //Disable the button when we click it
      button.disabled = true;

      signIn(this.data.id);
      return false;
    });
  }
}

function signIn(id) {
  const promise = new Promise((resolve, reject) => {
    const URL = "/signin/setupsession?cacheBusting=" + new Date().toISOString();
    postData(URL, { userId: id }).then((data) => {
      if (data.error) {
        reject(data.error);
        return;
      }
      //Seems like we have to wait a split second after getting the new session
      const SOME_TIME = 1 * 500;
      setTimeout(() => {
        window.location.href =
          "/index.html?cacheBusting=" + new Date().toISOString();
      }, SOME_TIME);
      resolve("success");
    });
  });
  return promise;
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

//At startup make sure we clear the current session and sign out.
//This mean that we can redirect here for sign out.

const p = postData("/signout", {});
console.log("P", p);
p.then((data) => {
  console.log("klart", data);
});
p.catch((data) => {
  console.log(data);
});
