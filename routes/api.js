'use strict';
const express = require("express");
const { 
  addNewIssues,
  getAllIssues,
  updateIssues,
  deleteIssues
} = require("../controllers");
const router = express.Router();

router.route("/:project")
  .get(getAllIssues)

  .post(addNewIssues)

  .put(updateIssues)

  .delete(deleteIssues);
 

module.exports = router;
