import React, { useState, useEffect } from "react";
import axios from "axios";
import JobForm from "./JobForm";
import Modal from "react-modal";
import "./AdminPanel.css";

// Set modal root for accessibility (required by react-modal)
Modal.setAppElement("#root");

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://todayjobsbackend.onrender.com/api/jobs");
      setJobs(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuccess = async (jobData) => {
    try {
      if (editingJob) {
        const response = await axios.put(
          `https://todayjobsbackend.onrender.com/api/jobs/${jobData._id}`,
          jobData
        );
        setJobs(
          jobs.map((job) => (job._id === jobData._id ? response.data : job))
        );
        setEditingJob(null);
        alert("Job updated successfully!");
      } else {
        const response = await axios.post(
          "https://todayjobsbackend.onrender.com/api/jobs",
          jobData
        );
        setJobs([response.data, ...jobs]);
        alert("Job created successfully!");
      }
    } catch (err) {
      console.error("Error saving job:", err);
      alert(err.response?.data?.message || "Failed to save job.");
    }
  };

  const handleEdit = (job) => {
    const jobToEdit = {
      ...job,
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : job.requirements || ""
    };
    setEditingJob(jobToEdit);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`https://todayjobsbackend.onrender.com/api/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job._id !== jobId));
      alert("Job deleted successfully!");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err.response?.data?.message || "Failed to delete job.");
    }
  };

  // Modal styles (customize as needed)
  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxWidth: "800px",
      maxHeight: "80vh",
      overflow: "auto",
      borderRadius: "8px",
      padding: "20px"
    }
  };

  return (
    <div className="admin-panel">
      <h1>Job Listings Admin Panel</h1>

      {/* Button to open modal */}
      <button className="view-jobs-btn" onClick={() => setIsModalOpen(true)}>
        View All Jobs ({jobs.length})
      </button>

      <div className="form-section">
        <JobForm
          onSubmit={handleSubmitSuccess}
          initialData={editingJob || {}}
          isEditMode={!!editingJob}
        />
      </div>

      {/* Modal for displaying jobs */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={modalStyles}
        contentLabel="Job Listings"
      >
        <div className="modal-header">
          <h2>Manage Job Listings ({jobs.length})</h2>
          <button
            className="close-modal-btn"
            onClick={() => setIsModalOpen(false)}
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">No jobs found.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>{job.type}</td>
                    <td>{job.category}</td>
                    <td className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          handleEdit(job);
                          setIsModalOpen(false); // Close modal when editing
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(job._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;
