import React, { useState, useEffect } from "react";
import axios from "axios";
import JobForm from "./JobForm";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchJobs();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://todayjobsbackend.onrender.com/api/jobs"
      );
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
    setActiveTab("add-job");
    setShowMobileMenu(false);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(
        `https://todayjobsbackend.onrender.com/api/jobs/${jobId}`
      );
      setJobs(jobs.filter((job) => job._id !== jobId));
      alert("Job deleted successfully!");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err.response?.data?.message || "Failed to delete job.");
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="admin-dashboard">
      {/* Mobile Menu Toggle Button */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${!isMobile || showMobileMenu ? "show" : ""}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>

        <ul className="sidebar-menu">
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => {
              setActiveTab("dashboard");
              if (isMobile) setShowMobileMenu(false);
            }}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </li>
          <li
            className={activeTab === "add-job" ? "active" : ""}
            onClick={() => {
              setActiveTab("add-job");
              setEditingJob(null);
              if (isMobile) setShowMobileMenu(false);
            }}
          >
            <i className="fas fa-plus-circle"></i>
            <span>Add New Job</span>
          </li>
          <li
            className={activeTab === "view-jobs" ? "active" : ""}
            onClick={() => {
              setActiveTab("view-jobs");
              if (isMobile) setShowMobileMenu(false);
            }}
          >
            <i className="fas fa-briefcase"></i>
            <span>View All Jobs ({jobs.length})</span>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "dashboard" && (
          <div className="dashboard-overview">
            <h1>Dashboard Overview</h1>
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Total Jobs</h3>
                <p>{jobs.length}</p>
              </div>
              <div className="stat-card">
                <h3>IT Jobs</h3>
                <p>{jobs.filter((job) => job.category === "IT").length}</p>
              </div>
              <div className="stat-card">
                <h3>Govt Jobs</h3>
                <p>{jobs.filter((job) => job.category === "Govt").length}</p>
              </div>
            </div>

            <div className="recent-jobs">
              <h2>Recent Job Listings</h2>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 10).map((job) => (
                    <tr key={job._id}>
                      <td className="rjltd">{job.title}</td>
                      <td className="rjltd">{job.company}</td>
                      <td className="rjltd">{job.type}</td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(job)}
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
          </div>
        )}

        {activeTab === "add-job" && (
          <div className="form-section">
            <h1>{editingJob ? "Edit Job Listing" : "Add New Job Listing"}</h1>
            <JobForm
              onSubmit={handleSubmitSuccess}
              initialData={editingJob || {}}
              isEditMode={!!editingJob}
            />
          </div>
        )}

        {activeTab === "view-jobs" && (
          <div className="view-jobs-section">
            <h1>All Job Listings ({jobs.length})</h1>

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
                        <td data-label="Title">{job.title}</td>
                        <td data-label="Company">{job.company}</td>
                        <td data-label="Location">{job.location}</td>
                        <td data-label="Type">{job.type}</td>
                        <td data-label="Category">{job.category}</td>
                        <td className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(job)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
