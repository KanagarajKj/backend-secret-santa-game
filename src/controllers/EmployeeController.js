const csv = require('csvtojson');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const importEmployees = async (Employee, PreviousAssignment, req, res) => {
  try {
    const yearType = req.body.yearType || req.query.yearType;

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get file extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let jsonArray = [];

    // Parse file based on extension
    if (fileExtension === '.csv') {
      jsonArray = await csv().fromFile(req.file.path);
    } else if (fileExtension === '.xlsx') {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      jsonArray = sheetData;
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a CSV or XLSX file.' });
    }

    if (yearType === "current") {
      // Validate structure for current year (only two columns)
      if (
        !jsonArray.length || 
        Object.keys(jsonArray[0]).length !== 2 ||
        !jsonArray[0].hasOwnProperty('Employee_Name') || 
        !jsonArray[0].hasOwnProperty('Employee_EmailID')
      ) {
        return res.status(400).json({ 
          error: 'Invalid file format for current year. Ensure it contains Employee_Name and Employee_EmailID columns.' 
        });
      }

      // Filter out duplicates by Employee_EmailID
      const uniqueEmployees = Array.from(
        new Map(
          jsonArray.map(row => [row.Employee_EmailID, row]) // Use Employee_EmailID as the key
        ).values()
      );

      // Prepare employees for bulk insert
      const employees = uniqueEmployees.map(row => ({
        name: row.Employee_Name, 
        email: row.Employee_EmailID
      }));

      // Remove existing employees to avoid duplicates
      await Employee.deleteMany({});

      // Bulk insert
      const importedEmployees = await Employee.insertMany(employees);

      // Remove temporary file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }

      res.status(201).json({ message: `${importedEmployees.length} unique employees imported successfully for current year` });

    } else if (yearType === "previous") {
      // Validate structure for previous year
      if (
        !jsonArray.length || 
        !jsonArray[0].hasOwnProperty('Employee_Name') || 
        !jsonArray[0].hasOwnProperty('Employee_EmailID') || 
        !jsonArray[0].hasOwnProperty('Secret_Child_Name') || 
        !jsonArray[0].hasOwnProperty('Secret_Child_EmailID')
      ) {
        return res.status(400).json({ 
          error: 'Invalid file format for previous year. Ensure it contains Employee_Name, Employee_EmailID, Secret_Child_Name, and Secret_Child_EmailID columns.' 
        });
      }

      // Filter out duplicates by Employee_EmailID
      const uniqueEmployees = Array.from(
        new Map(
          jsonArray.map(row => [row.Employee_EmailID, row]) // Use Employee_EmailID as the key
        ).values()
      );

      // Prepare employees for bulk insert
      const employees = uniqueEmployees.map(row => ({
        name: row.Employee_Name,
        email: row.Employee_EmailID,
        secretName: row.Secret_Child_Name,
        secretEmail: row.Secret_Child_EmailID
      }));

      // Remove existing previous year employees to avoid duplicates
      await PreviousAssignment.deleteMany({});

      // Bulk insert
      const importedEmployees = await PreviousAssignment.insertMany(employees);

      // Remove temporary file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }

      res.status(201).json({ 
        message: `${importedEmployees.length} unique employees imported successfully for previous year` 
      });

    } else {
      return res.status(400).json({ 
        error: 'Invalid yearType. Must be "current" or "previous".' 
      });
    }

  } catch (error) {
    console.error("Error during import:", error);
    res.status(500).json({ 
      error: error.message || 'Failed to import employees' 
    });
  }
};

module.exports = { importEmployees };
