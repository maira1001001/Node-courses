"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

const router = (0, _express.Router)();

const mockController = (req, res) => {
  res.send({
    message: 'my items!'
  });
};

router.route('/').get(mockController).post(mockController);
router.route('/:id').get(mockController).put(mockController).delete(mockController);
var _default = router;
exports.default = _default;