'use strict';

const mongoose = require("mongoose");
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
  .get(async (req, res) => {
    let projectName = req.params.project;
    try {
      const project = await ProjectModel.findOne({ name: projectName });
      if (!project) {
        res.json({ error: 'project not found' });
        return;
      } else {
        const issues = await IssueModel.find({ projectId: project._id,
        ...req.query,
        });
        if (!issues) {
          res.json([{ error: "no issues found" }]);
          return;
        }
        res.json(issues);
        return;
      }
    } catch (err) {
      res.json({ error: "could not get", _id: _id} )

    }
  })
    
  .post(async (req, res) => {
      let projectName = req.params.project;
      const { 
        issue_title,
        issue_text, 
        created_by, 
        assigned_to, 
        status_text,
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        let projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          projectModel = new ProjectModel({ name: projectName });
          projectModel = await projectModel.save();
        }

        const newIssue = new IssueModel({
          projectId: projectModel._id,
          issue_title: issue_title || '',
          issue_text: issue_text || '',
          created_by: created_by || '',
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
        });

        await newIssue.save();
        res.json(newIssue);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the issue' });
      }
  })
    
  .put(async (req, res) => {
    let projectName = req.params.project;
    const {
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open,
    } = req.body;
  
    if (!_id) {
      res.json({ error: "missing _id" });
      return;
    }
  
    if (
      !issue_title &&
      !issue_text &&
      !created_by &&
      !assigned_to &&
      !status_text &&
      !open
    ) {
      res.json({ error: "no update field(s) sent", _id: _id });
      return;
    }
  
    try {
      const projectdata = await ProjectModel.findOne({ name: projectName });
      if (!projectdata) {
        res.json({ error: "could not update", _id: _id });
        
      }
      let issue = await IssueModel.findByIdAndUpdate(_id, {
        ...req.body,
        updated_on: new Date(),
      });
      await issue.save();
      res.json({ result: "successfully updated", _id: _id });
    } catch (err) {
      res.json({ error: "could not update", _id: _id });
    }
  })
  .delete(async (req, res) => {
    let projectName = req.params.project;
    const { _id } = req.body;

    if (!_id) {
        return res.json({ error: 'missing _id' });
    }

    try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
            return res.status(404).json({ error: 'project not found' });
        }

        const issue = await IssueModel.findOneAndDelete({ _id: _id, projectId: projectModel._id });

        if (!issue) {
            return res.json({ error: 'could not delete', '_id': _id });
        }

        res.json({ result: 'successfully deleted', '_id': _id });
    } catch (error) {
        res.status(500).json({ error: 'could not delete', '_id': _id });
    }
  });
};
