var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var { Product } = require('../models/product')
var UserSchema = require('../models/user');


const stripe = require('stripe')('sk_test_51OCO9uDi30Ri12WZZEvz5qfJgL1ERRMEeetgsNQ7Vs5D9iQWNVpjAXj4Ej0766LxwNFRvrnSCIlN1MjslWWcCdF200xWkYc7XJ');

const User = mongoose.model('user', UserSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Backend app is up");
});

const YOUR_DOMAIN = 'http://35.222.250.96';

router.post('/create-checkout-session', async (req, res) => {
  const price = req.body.price;
  const names = req.body.name;
  console.log(JSON.stringify(req.body))
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price_data: {
          currency: 'USD',
          product_data: {
            name: names
          },
          unit_amount: Number(price) * 100
        },
        quantity: 1
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}/cart`,
  });

  res.redirect(303, session.url);
});

router.post('/user', async (req, res) => {
  const usr = await User.create({ 
    email: req.body.email,
    mfaEnrolled: false,
    phone: req.body.phone
  });
  res.json(usr);
});

router.get('/user', async (req, res) => {
  const usr = await User.create({ 
    email: req.body.email,
    mfaEnrolled: false,
    phone: req.body.phone
  });
  res.json(usr);
});

router.post('/mfaenrolled', async (req, res) => {
  User.findOneAndUpdate({ name: req.body.email}, {$set:{mfaEnrolled:true}}, 
      {returnDocument:'after'} , function (err, doc) { 
    if (err){ 
        console.log(err) 
    } 
    else{ 
        console.log("Original Doc : ", doc); 
    } 
    res.json({'success':true})
})});


router.get('/search', async function(req, res, next) {

  // const cursor = Product.find().cursor();
  // for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  //   const obj = ['name', 'category'].reduce((acc, attr) => ({ ...acc, [attr]: doc[attr] }), {});
  //   console.log(obj)
  //   await Product.findByIdAndUpdate(doc._id, obj);

  // const $unset = ['name', 'category'].reduce((acc, attr) => ({ ...acc, [`${attr}_fuzzy`]: 1 }), {});
  // console.log($unset)
  // await Product.findByIdAndUpdate(doc._id, { $unset }, { new: true, strict: false });
  // }

  const term = req.query.qry;
  const limit = req.query.limit;

  if (limit && !!!term) {
    const products = await Product.find({}).limit(Number(limit))
    res.json(products)
    return;
  }

  const products = await Product.fuzzySearch(term);

  filterdProducts = []

  products.forEach(val => {
    product = val.toObject()
    console.log(product.confidenceScore)
    const substr = product.category.some(item => {
      return item.indexOf(term) > -1
    });
    if (product.confidenceScore > 5 || substr) {
      filterdProducts.push(product)
    }
  })


  res.json(filterdProducts)


  // const keywords = term.split(" ").join("|")

  // const products = await Product.find(
  //   {name: {$regex: keywords, $options: 'i'}})
  //   .catch(next)

  // filterdProducts = []
  // items = 0;
  // products.forEach(val => {
  //   product = val.toObject()
  //   score = levenshtein.get(product.name, term, { useCollator: true})
  //   if (score < 10 || product.name.toLowerCase().indexOf(term) >= 0) {
  //     if (items < Number(limit)) {
  //       filterdProducts.push(val)
  //       items++;
  //     }
  //   }
  // })
 
  // res.json(filterdProducts)
});

module.exports = router;
