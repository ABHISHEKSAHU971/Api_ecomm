const express = require("express");
const cors = require("cors");
require("./db/config");
const UserModel = require("./db/User");
const productSchema = require("./db/products");
const Jwt = require("jsonwebtoken")
const Jwtkey = "E-comm"
const app = express();
app.use(express.json());

app.use(cors());

app.post("/register", async (req, res) => {
  let data = new UserModel(req.body);
  console.log(req.body);
  let result = await data.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ data }, Jwtkey, { expiresIn: '2h' }, (err, token) => {
    if (err) {
      res.send({ result:"Something Want Wrong" })
    }
    res.send({data,auth:token});
  })  
});


app.post("/login", async (req, res) => {
  let data = await UserModel.findOne(req.body).select("-password");
  if (req.body.password && req.body.email) {
    if (data) {
      Jwt.sign({ data }, Jwtkey, { expiresIn: '2h' }, (err, token) => {
        if (err) {
          res.send({ result:"Something Want Wrong" })
        }
        res.send({data,auth:token});
      })
    } else {
      // console.log("user not Found");
      res.send("user not Found");
    }
  } else {
    res.send("no user Found");
  }
});

app.post("/add-product", middleware,async (req, res) => {
  const item = new productSchema(req.body);
  let result = await item.save();
  res.send(result);
});

app.get("/products", middleware,async (req, res) => {
  let products = await productSchema.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send("No product");
  }
});

app.delete("/delete/:id", middleware,async (req, res) => {
  let result = await productSchema.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/update/:id",middleware ,async (req, res) => {
  let result = await productSchema.findOne({ _id: req.params.id });
  if (result) {
    res.send(result)
  }
});

app.put('/update/:id',middleware, async (req, res) => {
  let result = await productSchema.updateOne(
    {
      _id:req.params.id
  }, {
    $set:req.body
  })
  res.send(result)
})

app.get("/search/:key", middleware, async (req,res) => {
  let result = await productSchema.find({
    "$or": [
      {ptname:{$regex:req.params.key}},
      {company:{$regex:req.params.key}},
      {category:{$regex:req.params.key}}
    ]
  })
  res.send(result)
})


function middleware(req,res,next) {
  let token = req.headers['authorization']
  if (token) {
    token = token.split(" ")[1]
    Jwt.verify(token, Jwtkey, (err,valid) => {
      if (err) {
        res.status(401).send("Please provide Valid token ")
      } else {
        next()
      }
    })
    
  } else {
    res.status(403).send("Please add token with header ")
  }
 
  // console.log("middleware", token)
  
}

app.listen(5000);
