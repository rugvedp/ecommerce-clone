const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const profile = require('./schema/profileScheme')
const tshitSchema = require('./schema/tshirtSchema');
const UserModel = require('./schema/userSchema');
const ordersSchema = require('./schema/ordersSchema')
const emailsSchema = require('./schema/emailSchema')
const ordersItemsSchema = require('./schema/orderitemsSchema')
const app = express();
const port = 3000;


function isProductInCart(cart, id, size) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id == id) {
      {
        if (cart[i].size == size)
          return true;
      }
      return false
    }
  }
  return false;
}

function calculateTotal(cart, req) {
  total = 0;
  for (let i = 0; i < cart.length; i++) {
    total = total + (cart[i].price * cart[i].quantity);
  }
  req.session.total = total;
  return total;
}

const mongourl = process.env.MONGOURL;
const conneectdb = async () => {
  await mongoose.connect(mongourl);
  console.log('Connectedd to MongoDB');

}
conneectdb();

app.set('view engine', 'ejs');

app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: false,
}));


// Set the view engine to use EJS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define routes
app.get('/', (req, res) => {
  res.render('home', { subscribed: false });
});


app.get('/products', async (req, res) => {

  await tshitSchema.find().then((tees) => {
    res.render('products', { tees })
  }).catch((error) => {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  });

});


app.post('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/login');
  })
})

app.get('/home', async (req, res) => {

  tshitSchema.find().then((tees) => {
    res.render('home', { tees });
  }).catch((error) => {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  });


})


app.get('/products/:name', async (req, res) => {
  var name = req.params.name;
  let teedata = await tshitSchema.findOne({ name });
  if (!teedata) {
    return res.send(`No data available`)
  } else {
    await tshitSchema.findOneAndUpdate({ name: name }, { viewcount: teedata.viewcount + 1 })
    res.render('viewproduct', { teedata });
    return
  }
});


app.post('/viewproduct/:name', async (req, res) => {
  const productname = req.body.myValue;
  console.log(productname)

  let product = await tshitSchema.findOne({ name: productname })
  const productinfo = {
    teename: product.name,
    teeprice: product.price,
    teedesciption: product.description,
    teeimage: product.image,
    teecloth_type: product.cloth_type,
  }

  req.session.formData = productinfo;
  res.render('viewproduct');

})

app.post('/addtocart', function (req, res) {
  var id = req.body.id;
  var name = req.body.name;
  var price = req.body.price;
  var quantity = req.body.quantity;
  var image = req.body.image;
  var description = req.body.description;
  var size = req.body.selectedSize;
  console.log(size)
  var product = {
    id: id,
    name: name,
    price: price,
    quantity: quantity,
    image: image,
    description: description,
    size: size
  };
  console.log(product);

  if (req.session.cart) {
    var cart = req.session.cart;
    if (!isProductInCart(cart, id, size)) {
      cart.push(product);
    }
  } else {
    var cart = req.session.cart;
    const length = cart
    req.session.cart = [product];
    var cart = req.session.cart;
  }

  //calcultions
  calculateTotal(cart, req);
  res.redirect('/cart');

})

app.get('/cart', async (req, res) => {
  if (!req.session.cart && !req.session.total) {
    req.session.cart = [];
    req.session.total = 0;
  }
  var cart = req.session.cart;
  var total = req.session.total;
  console.log(cart)
  res.render('cart', {
    cart: cart,
    total: total
  })

})

app.post('/remove_product', function (req, res) {
  var id = req.body.id;
  var cart = req.session.cart;

  const indexToRemove = cart.findIndex(item => item.id === id);
  if (indexToRemove !== -1) {
    cart.splice(indexToRemove, 1);
  }

  calculateTotal(cart, req);
  res.redirect('/cart');

});

app.post('/edit_quantity', function (req, res) {
  var id = req.body.id;
  var decrese_quantitiy = req.body.decrese_quantitiy;
  var incerase_quantitiy = req.body.incerase_quantitiy;
  var quantity = req.body.quantity;
  var cart = req.session.cart;
  console.log(cart);
  if (incerase_quantitiy) {
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        if (cart[i].quantity > 0) {
          cart[i].quantity = parseInt(cart[i].quantity) + 1;
        }
      }
    }
  }

  if (decrese_quantitiy) {
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        if (cart[i].quantity > 1) {
          cart[i].quantity = parseInt(cart[i].quantity) - 1;
        }
      }
    }
  }

  calculateTotal(cart, req);
  res.redirect('/cart');
})


app.get('/checkout', function (req, res) {
  var cart = req.session.cart;
  var total = req.session.total;
  var todo = false;
  if (total > 50) {
    var todo = true;
  }
  res.render('checkout', {
    total: total,
    cart: cart,
    todo: todo
  });
})


app.post('/placeorder', async function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var phone_number = req.body.phone_number;
  var address = req.body.address;
  var city = req.body.city;
  var notes = req.body.note;
  var cost = req.session.total;
  var status = "Not Paid";
  var date = new Date();
  // var product_ids = [];

  var cart = req.session.cart;

  const neworder = new ordersSchema({
    name: name,
    email: email,
    phone_number: phone_number,
    address: address,
    city: city,
    cost: cost,
    status: status,
    date: date,
    notes: notes,
    product_ids: cart,
  });

  await neworder.save();
  res.redirect('/payment');

})

app.get('/payment', function (req, res) {
  res.render('payment');
})

app.listen(process.env.PORT(), () => {
  console.log(`Server is running on http://localhost:${port}`);
});
