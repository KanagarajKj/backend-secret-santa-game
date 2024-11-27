const express = require('express');
const multer = require('multer');
const { importEmployees } = require('../controllers/EmployeeController');
const { GenerateAssignmentsController } = require('../controllers/GenerateAssignmentsController');
const { createEmployeeModel } = require('../models/Employee');
const { createPreviousAssignmentModel } = require('../models/PreviousAssignment');

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Models
const Employee = createEmployeeModel();
const PreviousAssignment = createPreviousAssignmentModel();

// Employee import route
router.post('/employee/import', upload.single('file'), (req, res) => 
  importEmployees(Employee, PreviousAssignment, req, res)
);

// Generate assignments route
router.get('/generate-assignments', (req, res) => 
  GenerateAssignmentsController(Employee, PreviousAssignment, req, res)
);

module.exports = router;
