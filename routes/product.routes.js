const express = require('express');
const router = express.Router();
const Product = require('../models/Product.model.js');
const Cost = require('../models/Cost.model.js');

// ***** Require fileUploader in order to use it
const fileUploader = require('../config/cloudinary.config.js');

const { isAuthenticated } = require('../middleware/jwt.middleware.js');

// Protect all routes using jwtMiddleware
router.use(isAuthenticated);


// ***** modif For Cloudinary : POST "/api/upload" => Route that receives the image, sends it to Cloudinary via the fileUploader and returns the image URL
router.post('/upload', fileUploader.single('imageUrl'), (req, res, next) => {
 
  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }
 
  // Get the URL of the uploaded file and send it as a response.
  // 'fileUrl' can be any name, just make sure you remember to use the same when accessing it on the frontend
 
  res.json({ fileUrl: req.file.path });
});


// GET: Retrieve a product by ID
router.get('/products/:id', (req, res, next) => {
  const { id } = req.params;

  Product.findById(id)
    .populate('costs.cost')
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    })
    .catch((error) => {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// GET : retrieve all products
router.get('/products', (req, res, next) => {
  Product.find()
    .populate('costs.cost')
    .then((products) => {
      res.json(products);
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: 'Internal server error' });
    });
});


// POST: Create a new product modif*******
router.post('/products', (req, res, next) => {
  const { name, base_quantity, costs, unit_total_cost, unit_price, imageUrl } = req.body;
  const product = new Product({ name, base_quantity, costs, unit_total_cost, unit_price, imageUrl });

  product
    .save()
    .then((savedProduct) => {
      res.status(201).json({_id: savedProduct._id, savedProduct}); // don't work toget _id
    })
    .catch(next);
});

// PUT: Update an existing product
router.put('/products/:id', (req, res, next) => {
  const updates = { ...req.body };
  Product.findByIdAndUpdate(req.params.id, updates, { new: true })
    .then((updatedProduct) => {
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(updatedProduct);
    })
    .catch(next);
});

// DELETE: Delete a product
router.delete('/products/:id', (req, res, next) => {
  const { id } = req.params;

  Product.findByIdAndDelete(id)
    .then((deletedProduct) => {
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(204).send();
    })
    .catch(next);
});

// This is to manipulate costs for each product

// Middleware to find a product by ID
const findProductById = (req, res, next) => {
  Product.findById(req.params.productId)
    .populate("costs.cost")
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      req.product = product;
      next();
    })
    .catch((error) => next(error));
};

// GET: Retrieve a single cost from a product
router.get("/products/:productId/costs/:costId", findProductById, (req, res) => {
  const cost = req.product.costs.find(
    (c) => c.cost._id.toString() === req.params.costId
  );
  if (!cost) {
    return res.status(404).json({ message: "Cost not found in product" });
  }
  res.json(cost);
});

// POST: Add a new cost to a product
router.post("/products/:productId/costs", findProductById, (req, res, next) => {
  const { costId, quantity, unit } = req.body;

  if (!costId || !quantity || !unit) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  Cost.findById(costId)
    .then((cost) => {
      if (!cost) {
        return res.status(404).json({ message: "Cost not found" });
      }

      // Add the cost to the product
      req.product.costs.push({ cost: cost._id, quantity, unit });

      req.product
        .save()
        .then((updatedProduct) => res.status(201).json(updatedProduct))
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

// PUT: Update a single cost in a product
router.put("/products/:productId/costs/:costId", findProductById, (req, res, next) => {
  const { quantity, unit } = req.body;

  const cost = req.product.costs.find(
    (c) => c._id.toString() === req.params.costId
  );
  
  if (!cost) {
    return res.status(404).json({ message: "Cost not found in product" });
  }

  if (quantity !== undefined) cost.quantity = quantity;
  if (unit !== undefined) cost.unit = unit;

  req.product
    .save()
    .then((updatedProduct) => res.json(updatedProduct))
    .catch((error) => next(error));
});

// DELETE: Remove a cost from a product
router.delete("/products/:productId/costs/:costId", findProductById, (req, res, next) => {
  const costIndex = req.product.costs.findIndex(
    (c) => c._id.toString() === req.params.costId
  );

  if (costIndex === -1) {
    return res.status(404).json({ message: "Cost not found in product" });
  }

  req.product.costs.splice(costIndex, 1);

  req.product
    .save()
    .then((updatedProduct) => res.json(updatedProduct))
    .catch((error) => next(error));
});

// GET: Retrieve all products using a specific cost
router.get('/products/cost/:costId', (req, res, next) => {
  const { costId } = req.params;

  Product.find({ 'costs.cost': costId })
    .populate('costs.cost')
    .then((products) => {
      if (products.length === 0) {
        return [];
      }
      res.json(products);
    })
    .catch((error) => {
      console.error("Error fetching products by cost:", error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

module.exports = router;