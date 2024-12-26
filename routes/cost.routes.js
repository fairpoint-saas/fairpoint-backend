const express = require('express');
const router = express.Router();
const Cost = require('../models/Cost.model.js');

const { isAuthenticated } = require('../middleware/jwt.middleware.js');

// Protect all routes using jwtMiddleware
router.use(isAuthenticated);

// GET: Retrieve all cost elements
router.get('/costs', (req, res, next) => {
  Cost.find()
    .then((costs) => {
      res.json(costs);
    })
    .catch(next); // Pass error to error handler
});

// GET: Check if a cost exists by name
router.get('/costs', (req, res, next) => {
  const { name } = req.query;
  Cost.findOne({ name })
    .then((cost) => {
      res.json({ exists: !!cost });
    })
    .catch(next);
});

// POST: Create a new cost element
router.post('/costs', (req, res, next) => {
  const { name, category, cost_type, value, unit, currency, imageUrl } = req.body;
  const cost= new Cost({ name, category, cost_type, value, unit, currency, imageUrl });

  cost
    .save()
    .then((savedCost) => {
      res.status(201).json(savedCost);
    })
    .catch(next);
});

// PUT: Update an existing cost element
router.put('/costs/:id', (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  Cost.findByIdAndUpdate(id, updates, { new: true })
    .then((updatedCost) => {
      if (!updatedCost) {
        return res.status(404).json({ message: 'Cost not found' });
      }
      res.json(updatedCost);
    })
    .catch(next);
});

// DELETE: Delete a specific cost element
router.delete('/costs/:id', (req, res, next) => {
  const { id } = req.params;

  Cost.findByIdAndDelete(id)
    .then((deletedCost) => {
      if (!deletedCost) {
        return res.status(404).json({ message: 'Cost not found' });
      }
      res.status(204).send();
    })
    .catch(next);
});

module.exports = router;