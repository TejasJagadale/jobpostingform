import React, { useState, useEffect } from "react";
import axios from "axios";
import "./JobForm.css";

const JobForm = ({ onSubmit, initialData = {}, isEditMode = false }) => {
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    category: "IT", // New field for IT/Govt category
    type: "Full-time",
    description: "",
    requirements: "",
    applyLink: "",
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Job categories (IT or Govt)
  const jobCategories = ["IT", "Govt"];

  // Job types based on category
  const getJobTypes = (category) => {
    const itTypes = [
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
      "Freelance"
    ];
    const govtTypes = [
      "Government",
      "State Government",
      "Central Government",
      "Public Sector",
      "Municipal"
    ];

    return category === "Govt" ? govtTypes : itTypes;
  };

  // Job titles based on category
  const getJobTitles = (category) => {
    const itTitles = [
      "Software Engineer",
      "Data Analyst",
      "DevOps Engineer",
      "UI/UX Designer",
      "Product Manager",
      "QA Engineer",
      "Cloud Architect"
    ];

    const govtTitles = [
      "Administrative Officer",
      "Tax Inspector",
      "Banking Officer",
      "Police Constable",
      "Forest Officer",
      "Railway Engineer",
      "Public Health Specialist"
    ];

    return category === "Govt" ? govtTitles : itTitles;
  };

  // Companies based on category
  const getCompanies = (category) => {
    const itCompanies = [
      "TCS",
      "Infosys",
      "Wipro",
      "Google",
      "Amazon",
      "Microsoft",
      "Zoho",
      "HCL"
    ];

    const govtCompanies = [
      "UPSC",
      "State PSC",
      "RBI",
      "Indian Railways",
      "ISRO",
      "DRDO",
      "Municipal Corporation",
      "Public Sector Banks"
    ];

    return category === "Govt" ? govtCompanies : itCompanies;
  };

  const locations = [
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Pune",
    "Mumbai",
    "Delhi",
    "Coimbatore",
    "Remote"
  ];

  useEffect(() => {
    if (isEditMode && initialData) {
      const requirementsStr = Array.isArray(initialData.requirements)
        ? initialData.requirements.join("\n")
        : initialData.requirements || "";

      setJobData((prev) => ({
        ...prev,
        ...initialData,
        requirements: requirementsStr
      }));
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setJobData((prev) => {
      const newState = {
        ...prev,
        [name]: value
      };

      // If category changes, reset dependent fields
      if (name === "category") {
        const newTypes = getJobTypes(value);
        const newTitles = getJobTitles(value);
        const newCompanies = getCompanies(value);

        return {
          ...newState,
          type: newTypes[0],
          title: "",
          company: ""
          // Keep other fields as is
        };
      }

      return newState;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!jobData.title) newErrors.title = "Job title is required";
    if (!jobData.company) newErrors.company = "Company is required";
    if (!jobData.location) newErrors.location = "Location is required";
    if (!jobData.description) newErrors.description = "Description is required";
    if (!jobData.requirements)
      newErrors.requirements = "Requirements are required";

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
        requirements: jobData.requirements
          .split("\n")
          .filter((item) => item.trim() !== "")
      };

      // Call onSubmit with the data (let AdminPanel handle the API call)
      onSubmit(formattedData); // Pass raw data instead of making API call here

      if (!isEditMode) {
        // Reset form
        setJobData((prev) => ({
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
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Failed to ${isEditMode ? "update" : "add"} job: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current options based on selected category
  const currentJobTitles = getJobTitles(jobData.category);
  const currentCompanies = getCompanies(jobData.category);
  const currentJobTypes = getJobTypes(jobData.category);

  return (
    <div className="job-form-container">
      <h2>{isEditMode ? "Edit Job Listing" : "Add New Job Listing"}</h2>
      <form onSubmit={handleSubmit}>
        {/* Category Dropdown - IT or Govt */}
        <div className="form-group">
          <label>Job Category*</label>
          <select
            name="category"
            value={jobData.category}
            onChange={handleChange}
          >
            {jobCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Job Title*</label>
          <select
            name="title"
            value={jobData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
          >
            <option value="">Select Job Title</option>
            {currentJobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Company*</label>
            <select
              name="company"
              value={jobData.company}
              onChange={handleChange}
              className={errors.company ? "error" : ""}
            >
              <option value="">Select Company</option>
              {currentCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            {errors.company && (
              <span className="error-message">{errors.company}</span>
            )}
          </div>

          <div className="form-group">
            <label>Location*</label>
            <select
              name="location"
              value={jobData.location}
              onChange={handleChange}
              className={errors.location ? "error" : ""}
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.location && (
              <span className="error-message">{errors.location}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Salary Range</label>
            <input
              type="text"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              placeholder="e.g. ₹8,00,000 - ₹12,00,000 per year"
            />
          </div>

          <div className="form-group">
            <label>Job Type*</label>
            <select name="type" value={jobData.type} onChange={handleChange}>
              {currentJobTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description*</label>
          <textarea
            name="description"
            value={jobData.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
            rows="4"
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label>Requirements (one per line)*</label>
          <textarea
            name="requirements"
            value={jobData.requirements}
            onChange={handleChange}
            className={errors.requirements ? "error" : ""}
            rows="4"
            placeholder="Enter each requirement on a new line"
          />
          {errors.requirements && (
            <span className="error-message">{errors.requirements}</span>
          )}
        </div>

        <div className="form-group">
          <label>Application Link</label>
          <input
            type="url"
            name="applyLink"
            value={jobData.applyLink}
            onChange={handleChange}
            placeholder="https://example.com/apply"
          />
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
