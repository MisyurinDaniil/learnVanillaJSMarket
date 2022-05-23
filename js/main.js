
document.querySelector('#cart-button').addEventListener('click', () => {
  document.querySelector('.product-cart').classList.toggle('d-none');
});  

const API = 'https://raw.githubusercontent.com/MisyurinDaniil/learnVanillaJSMarket/master/json/';

class List {
  constructor(container, url, classList) {
      this.container = container;
      this.url = API + url;
      this.classList = classList;
      this.recivedProductList = [];
      this.createdObjProducts = [];
      this._init();
  }
  _getList() {
      return fetch(this.url)
              .then(response => response.json())
  }
  _handleGetList(data) {
      this.recivedProductList = [...data];
  }
  _renderList() {
      const container = document.querySelector(this.container);
      for (let product of this.recivedProductList) {
          let objProduct = new this.classList[this.constructor.name](product);
          this.createdObjProducts.push(objProduct);
          container.insertAdjacentHTML('beforeend', objProduct.getHTMLItem());
      }
  }
  _setEventHandlers() {
      document.querySelector(this.container)
          .addEventListener('click', (event) => this._productButtonHandlers(event));
  }
  _productButtonHandlers(event) {
      if (event.target.tagName === 'BUTTON') {
          if (this.constructor.name === 'Cart') {
              this.changeCart(event.target);
          }
          else this.cart.changeCart(event.target);
      }
  }

  _init(){
      return false;
  }
}

class Item {
  constructor(item) {
      this.id = item.id_product;
      this.name = item.product_name;
      this.price = item.price;
      this.img = item.img ? item.img : 'img/image-holder.jpg';
      this.quantity = item.quantity ? item.quantity : null;
  }
  getHTMLItem() {
      return false;
  }
}

class ProductList extends List {
  constructor(container, url, classList, cart) {
      super(container, url, classList);
      this.cart = cart;
  }
  _init() {
      this._getList()
          .then(data => {
              this._handleGetList(data);
            //   console.log(data);
              this._renderList();
              this._setEventHandlers();
          });
      
  }
}

class ProuctItem extends Item {
  constructor(item) {
      super(item);
  }

  getHTMLItem() {
      return `
          <div class="product-item col flex-grow-0 mt-3 mb-3" data-id="${this.id}">
              <div class="product-item__block p-3">
                  <h3  class="product-item__title">${this.name}</h3>
                  <img class="product-item__img img-fluid img-thumbnail" src="${this.img}">
                  <p class="product-item__price">${this.price} руб.</p>
                  <button class="product-item__add-button btn btn-warning" data-id="${this.id}" data-name="${this.name}" data-img="${this.img}" data-price="${this.price}">Добавить</button>
              </div>
          </div>
      `;
  }
}

class Cart extends List {
  constructor(container, url, classList) {
      super(container, url, classList);
      this.amount = null;
      this.countGoods = null;
      this.pathDeleteCartItem = API + '/addToBasket.json';
      this.pathAddCartItem = API + '/deleteFromBasket.json';
  }
  _init() {
      this._getList()
          .then(data => {
              this._handleGetList(data.contents);
              this.amount = data.amount;
              this.countGoods = data.countGoods;
              this._renderList();
              this._setEventHandlers();
          });
  }
  changeCart(clickButton) {
      for (let cartItem of this.createdObjProducts) {
          if (clickButton.dataset.name === cartItem.name) {
              if (clickButton.classList.contains('product-item__add-button')) {
                  return this.sendCartToServer(this.pathAddCartItem)
                      .then(data => {
                          if (data.result === 1 ) {
                              console.log(data.result);
                              ++cartItem.quantity;
                              this.updateQuantity(cartItem);
                          } 
                          else new Error('Ошибка изменения корзины');
                      })
                      .catch(error => console.log(error));
              }
              else if (clickButton.classList.contains('cart-item__del-button')) {
                  if (--cartItem.quantity < 1) {
                      return this.sendCartToServer(this.pathDeleteCartItem)
                          .then(data => {
                              console.log(data.result);
                              if (data.result === 1) this.deleteCartItem(cartItem);
                              else new Error('Ошибка изменения корзины');
                          })
                          .catch(error => console.log(error));
                  }
                  else {
                      return this.sendCartToServer(this.pathAddCartItem)
                          .then(data => {
                              console.log(data.result);
                              if (data.result === 1 ) this.updateQuantity(cartItem);
                              else new Error('Ошибка изменения корзины');
                          })
                          .catch(error => console.log(error));;
                  }
              }
          }
      }
      this.addCartItem(clickButton);
  }
  updateQuantity(cartItem) {
      const cartItemHTML = document.querySelector(`.cart-item[data-id="${cartItem.id}"]`);
      cartItemHTML.querySelector('.cart-item__quantity').textContent = `Количество: ${cartItem.quantity}`;
      cartItemHTML.querySelector('.cart-item__total-amount').textContent = `${cartItem.price * cartItem.quantity} руб.`;
  }
  deleteCartItem(cartItem) {
      document.querySelector(`.cart-item[data-id="${cartItem.id}"]`).remove();
      this.createdObjProducts.splice(this.createdObjProducts.indexOf(cartItem), 1);
  }
  addCartItem(clickButton) {
      let objProduct = {
          id_product: clickButton.dataset.id,
          product_name: clickButton.dataset.name,
          price: clickButton.dataset.price,
          img: clickButton.dataset.img,
          quantity: 1,
      }
      this.recivedProductList = [objProduct];
      this._renderList();
  }
  sendCartToServer(url) {
      return fetch(url)
          .then(response => response.json());
  }
}

class CartItem extends Item {
  constructor(item) {
      super(item);
  }
  getHTMLItem() {
      return `
          <div class="cart-item d-flex mt-2 border p-2" data-id="${this.id}">
              <img class="cart-item__img d-block img-thumbnail" src="${this.img}">
              <div class="ms-2">
                  <h3 class="cart-item__title">${this.name}</h3>
                  <span class="cart-item__quantity" class="d-block">Количество: ${this.quantity}</span>
                  <br>
                  <span class="cart-item__price" class="d-block">${this.price} руб. за штуку</span>
              </div>
              <div class="d-flex flex-column justify-content-center ms-2">
                  <p class="cart-item__total-amount">${this.price * this.quantity} руб.</p>
                  <button class="cart-item__del-button btn btn-secondary" data-id="${this.id}" data-name="${this.name}" data-img="${this.img}" data-price="${this.price}" data-quantity="${this.quantity}">X</button>
              </div>
          </div>
      `;
  }
}

const classList = {
  'ProductList': ProuctItem,
  'Cart': CartItem,
}

const cart = new Cart('.product-cart', '/getBasketProducts.json', classList);
const productList = new ProductList('.products-list', '/getProducts.json', classList, cart);



let str = "1 индейка$123123стоит $31110";
// знак доллара экранируем \$, так как это специальный символ
console.log( str.match(/(?<=(\$))\d+/) ); // 30, одинокое число игнорируетс


