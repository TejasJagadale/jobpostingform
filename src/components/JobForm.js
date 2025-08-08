import React, { useState, useEffect } from "react";
import "./JobForm.css";

const JobForm = ({ onSubmit, initialData = {}, isEditMode = false }) => {
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    category: "IT",
    type: "Full-time",
    description: "",
    requirements: "",
    applyLink: "",
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobCategories = ["IT", "Govt"];

  const getJobTypes = (category) => {
    return category === "Govt" 
      ? ["Government", "State Government", "Central Government", "Public Sector", "Municipal"]
      : ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
  };

  useEffect(() => {
    if (isEditMode && initialData) {
      const requirementsStr = Array.isArray(initialData.requirements)
        ? initialData.requirements.join("\n")
        : initialData.requirements || "";

      setJobData(prev => ({
        ...prev,
        ...initialData,
        requirements: requirementsStr
      }));
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setJobData(prev => {
      const newState = { ...prev, [name]: value };
      
      if (name === "category") {
        return {
          ...newState,
          type: getJobTypes(value)[0]
        };
      }
      return newState;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!jobData.title) newErrors.title = "Job title is required";
    if (!jobData.company) newErrors.company = "Company is required";
    if (!jobData.location) newErrors.location = "Location is required";
    if (!jobData.description) newErrors.description = "Description is required";
    if (!jobData.requirements) newErrors.requirements = "Requirements are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...jobData,
        requirements: jobData.requirements.split("\n").filter(item => item.trim() !== "")
      };
      
      onSubmit(formattedData);

      if (!isEditMode) {
        setJobData(prev => ({
          title: "",
          company: "",
          location: "",
          salary: "",
          category: prev.category,
          type: getJobTypes(prev.category)[0],
          description: "",
          requirements: "",
          applyLink: ""
        }));
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      alert(`Failed to ${isEditMode ? "update" : "add"} job: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentJobTypes = getJobTypes(jobData.category);

  return (
    <div className="job-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Job Category</label>
            <select
              id="category"
              name="category"
              value={jobData.category}
              onChange={handleChange}
            >
              {jobCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Job Title */}
          <div className="form-group">
            <label htmlFor="title">Job Title <span className="required">*</span></label>
            <input
              id="title"
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              className={errors.title ? "error" : ""}
              placeholder="Software Engineer"
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          {/* Company */}
          <div className="form-group">
            <label htmlFor="company">Company <span className="required">*</span></label>
            <input
              id="company"
              type="text"
              name="company"
              value={jobData.company}
              onChange={handleChange}
              className={errors.company ? "error" : ""}
              placeholder="Google, Amazon, etc."
            />
            {errors.company && <div className="error-message">{errors.company}</div>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location">Location <span className="required">*</span></label>
            <input
              id="location"
              type="text"
              name="location"
              value={jobData.location}
              onChange={handleChange}
              className={errors.location ? "error" : ""}
              placeholder="Bangalore, Remote, etc."
            />
            {errors.location && <div className="error-message">{errors.location}</div>}
          </div>

          {/* Salary */}
          <div className="form-group">
            <label htmlFor="salary">Salary Range</label>
            <input
              id="salary"
              type="text"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              placeholder="₹8,00,000 - ₹12,00,000 per year"
            />
          </div>

          {/* Job Type */}
          <div className="form-group">
            <label htmlFor="type">Job Type</label>
            <select
              id="type"
              name="type"
              value={jobData.type}
              onChange={handleChange}
            >
              {currentJobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description">Description <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
              className={errors.description ? "error" : ""}
              rows="5"
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          {/* Requirements */}
          <div className="form-group full-width">
            <label htmlFor="requirements">Requirements (one per line) <span className="required">*</span></label>
            <textarea
              id="requirements"
              name="requirements"
              value={jobData.requirements}
              onChange={handleChange}
              className={errors.requirements ? "error" : ""}
              rows="5"
              placeholder="Enter each requirement on a new line"
            />
            {errors.requirements && <div className="error-message">{errors.requirements}</div>}
          </div>

          {/* Application Link */}
          <div className="form-group full-width">
            <label htmlFor="applyLink">Application Link</label>
            <input
              id="applyLink"
              type="url"
              name="applyLink"
              value={jobData.applyLink}
              onChange={handleChange}
              placeholder="https://example.com/apply"
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="spinner"></span>
          ) : isEditMode ? (
            "Update Job"
          ) : (
            "Add Job"
          )}
        </button>
      </form>
    </div>
  );
};

export default JobForm;