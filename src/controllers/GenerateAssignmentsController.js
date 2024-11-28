
const GenerateAssignmentsController  = async (Employee, PreviousAssignment, req, res) => {
  try {

    const generateAssignments = (employeeData, previousYearData) => {
      // Create a pool of available employees for assignment
      const availableEmployees = [...employeeData];
      const assignments = [];

      // Iterate through each employee to assign a secret child
      for (const currentEmployee of employeeData) {
        // Find previous year's assignment for current employee
        const previousYearAssignment = previousYearData?.find(
          prev => prev.email === currentEmployee.email
        );

        // Filter potential secret children
        const potentialSecretChildren = availableEmployees.filter(employee => {
          const constraints = [
            // Cannot choose themselves
            employee.email !== currentEmployee.email,
            
            // Cannot choose previous year's secret child
            employee.email !== previousYearAssignment?.secretEmail,
            
            // Cannot be already assigned
            !assignments.some(assignment => assignment.Secret_Child_EmailID === employee.email)
          ];

          return constraints.every(Boolean);
        });

        // If no valid secret child found, throw an error
        if (potentialSecretChildren.length === 0) {
          throw new Error(`No valid secret child found for ${currentEmployee.name}`);
        }

        // Randomly select a secret child
        const secretChildIndex = Math.floor(Math.random() * potentialSecretChildren.length);
        const selectedSecretChild = potentialSecretChildren[secretChildIndex];

        // Create assignment
        const assignment = {
          Employee_Name: currentEmployee.name,
          Employee_EmailID: currentEmployee.email,
          Secret_Child_Name: selectedSecretChild.name,
          Secret_Child_EmailID: selectedSecretChild.email
        };

        // Add to assignments
        assignments.push(assignment);

        // Remove selected secret child from available pool
        const indexToRemove = availableEmployees.findIndex(
          emp => emp.email === selectedSecretChild.email
        );
        availableEmployees.splice(indexToRemove, 1);
      }

      // Final validation
      // Ensure all employees are assigned
      if (assignments.length !== employeeData.length) {
        throw new Error("Failed to generate complete Secret Santa assignments");
      }

      // Ensure no duplicate secret children
      const uniqueSecretChildren = new Set(
        assignments.map(assignment => assignment.Secret_Child_EmailID)
      );
      if (uniqueSecretChildren.size !== assignments.length) {
        throw new Error("Duplicate secret child assignments detected");
      }

      return assignments;
    };

    const employeeData = await Employee.find();
    const previousYearEmployeeData = await PreviousAssignment.find();

    if(employeeData?.length > 0 && previousYearEmployeeData?.length > 0) {
      const assignmentsData = generateAssignments(employeeData, previousYearEmployeeData);
      res.status(201).json({assignmentsData, message: "Assignment generated successfully"});
    } else {
      res.status(404).json({assignmentsData: [], message: "Data not exist"});
    }

  } catch (error) {
    console.error("Error during generate assignment:", error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate assignment' 
    });
  }
};

module.exports = { GenerateAssignmentsController };
