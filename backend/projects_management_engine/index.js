const express = require('express');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();
const port = 5003;

// Middleware to enable CORS
app.use(cors());  // Add this line

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB URI
const uri = "mongodb+srv://davidtgondo:david@iso.w99bqor.mongodb.net/?retryWrites=true&w=majority&appName=iso";

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(error => console.error('MongoDB connection error:', error));

// Define Project schema and model
const projectSchema = new Schema({
  user_id: String,
  project_name: String,
  reports: [String],
  months: [String] // New field to store month names
});

const Project = model('Project', projectSchema);


// Utility function to delete a folder recursively
const deleteFolderRecursive = function(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file, index) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) { // Recurse
        deleteFolderRecursive(curPath);
      } else { // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

// Route to delete a project by name
app.delete('/projects/name/:project_name', async (req, res) => {
  try {
    const result = await Project.findOneAndDelete({ project_name: req.params.project_name });
    if (result) {
      // Define the folder path
      const folderPath = path.join(__dirname, 's3', req.params.project_name);

      // Delete the folder
      deleteFolderRecursive(folderPath);

      res.status(200).json({ message: 'Project and folder deleted' });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Routes for CRUD operations

// Create a new project
app.post('/projects', async (req, res) => {
  try {
    const { user_id, project_name, reports, months } = req.body;


    const newProject = new Project({
      user_id,
      project_name,
      reports: reports || [],
      months: months || [] // Add months to the new project creation
    });
    const savedProject = await newProject.save();
    res.status(201).json({ project_id: savedProject._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Endpoint to delete a report and its folder
app.delete('/projects/name/:project_name/reports/:report_name', async (req, res) => {
  try {
    const project = await Project.findOne({ project_name: req.params.project_name });
    if (project) {
      const reportIndex = project.reports.indexOf(req.params.report_name);
      if (reportIndex > -1) {
        project.reports.splice(reportIndex, 1);
        await project.save();

        const reportFolderPath = path.join(__dirname, 's3', req.params.project_name, req.params.report_name);
        if (fs.existsSync(reportFolderPath)) {
          fs.rmdirSync(reportFolderPath, { recursive: true });
        }

        res.status(200).json({ message: 'Report deleted' });
      } else {
        res.status(404).json({ error: 'Report not found' });
      }
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Get all projects
app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
app.get('/projects/:project_id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.project_id);
    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get projects by user ID
app.get('/projects/user/:user_id', async (req, res) => {
  try {
    const projects = await Project.find({ user_id: req.params.user_id });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects by user ID' });
  }
});

// Get reports by project ID
app.get('/projects/:project_id/reports', async (req, res) => {
  try {
    const project = await Project.findById(req.params.project_id);
    if (project) {
      res.status(200).json({ reports: project.reports });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Add a report to a project
app.post('/projects/:project_id/reports', async (req, res) => {
  try {
    const project = await Project.findById(req.params.project_id);
    if (project) {
      project.reports.push(req.body.report_name);
      await project.save();
      res.status(200).json({ message: 'Report added' });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add report' });
  }
});

// Add a report to a project by project name
app.post('/projects/name/:project_name/reports', async (req, res) => {
  try {
    const project = await Project.findOne({ project_name: req.params.project_name });
    if (project) {
      project.reports.push(req.body.report_name);
      await project.save();
      res.status(200).json({ message: 'Report added' });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add report' });
  }
});


// Delete a report from a project
app.delete('/projects/:project_id/reports', async (req, res) => {
  try {
    const project = await Project.findById(req.params.project_id);
    if (project) {
      project.reports = project.reports.filter(report => report !== req.body.report_name);
      await project.save();
      res.status(200).json({ message: 'Report deleted' });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Delete a project by ID
app.delete('/projects/:project_id', async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.project_id);
    if (result) {
      res.status(200).json({ message: 'Project deleted' });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Handle creating a new project and running train_model
app.post('/create_project', async (req, res) => {
  try {
    const { project_name, salesFile, customerFile, dateColumn, quantityColumn, priceColumn } = req.body;

    // Example function call to train_model
    const [model, future, forecast, mape, month_names] = await train_model(data);

    // Save project in MongoDB with associated months
    const newProject = new Project({
      user_id: user.id, // Replace with actual user ID
      project_name,
      reports: [],
      months: month_names // Save month names associated with the project
    });

    const savedProject = await newProject.save();

    res.status(200).json({ message: 'Files uploaded and processed successfully.', folder: folder_name });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Failed to process data.' });
  }
});

// Get reports by project name
app.get('/projects/name/:project_name/reports', async (req, res) => {
  try {
    const project = await Project.findOne({ project_name: req.params.project_name });
    if (project) {
      res.status(200).json({ reports: project.reports });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports by project name' });
  }
});

// Get months by project name
app.get('/projects/name/:project_name/months', async (req, res) => {
  try {
    const project = await Project.findOne({ project_name: req.params.project_name });
    if (project) {
      res.status(200).json({ months: project.months });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch months by project name' });
  }
});


// Delete a project by name
// app.delete('/projects/name/:project_name', async (req, res) => {
//   try {
//     const result = await Project.findOneAndDelete({ project_name: req.params.project_name });
//     if (result) {
//       res.status(200).json({ message: 'Project deleted' });
//     } else {
//       res.status(404).json({ error: 'Project not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete project' });
//   }
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});






