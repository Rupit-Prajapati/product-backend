const express = require('express');
const app = express();
const User = require('./db/user');
const Product = require('./db/Products');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwtKey = 'e-comm'
const route = express.Router();
require('./db/config')

app.use(express.json());
app.use(cors());

function verifyToken(req, res, next) {
  let token = req.headers.authorization
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        res.send({ result: 'token is not valid' })
      } else {
        console.log(valid)
        next();
      }
    })
  } else {
    res.send({ result: 'please add a token' });
  }
}

route.use(verifyToken)

app.post('/register', async (req, res) => {
  let data = new User(req.body)
  let result = await data.save()
  result = result.toObject()
  delete result.password
  jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({ result: "something went wrong" })
    }
    res.send({ result, auth: token })
  })
})

app.post('/login', async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({ result: "something went wrong" })
        }
        res.send({ user, auth: token })
      })
    } else {
      res.send({ result: 'no user' })
    }
  } else {
    res.send({ result: 'no user' })
  }
})

route.post('/addproduct', async (req, res) => {
  let data = new Product(req.body);
  let result = await data.save();
  res.send(result);
})

route.get('/products', async (req, res) => {
  const data = await Product.find();
  if (data.length > 0) {
    res.send(data);
  } else {
    res.send({ result: 'no products' });
  }
})

route.delete('/products/:id', async (req, res) => {
  console.log(req.params);
  const data = await Product.deleteOne({ _id: req.params.id });
  res.send(data);
})

route.get('/products/:id', async (req, res) => {
  const data = await Product.findOne({ _id: req.params.id });
  if (data) {
    res.send(data);
  } else {
    res.send({ result: 'no products' });
  }
})

route.put('/products/:id', async (req, res) => {
  const data = await Product.updateOne({ _id: req.params.id }, { $set: req.body })
  res.send(data)
})

route.get('/search/:key', async (req, res) => {
  var data = await Product.find({
    "$or": [
      { name: { $regex: req.params.key, $options: 'i' } },
      { price: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { company: { $regex: req.params.key } }
    ]
  })
  res.send(data);
})

app.use('/', route)

app.get('/', async (req, res) => {
  res.send('working fine');
})

app.listen(5000);