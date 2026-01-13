/**
 * Voiceflow Custom Web Chat Extension: Dark Medical Form
 * Extension Name: ext_darkForm
 * 
 * This extension renders a professional dark-themed medical form
 * that captures patient information and health report file upload.
 */

(function() {
  'use strict';

  // Wait for Voiceflow to be available
  function initializeExtension() {
    if (!window.voiceflow || !window.voiceflow.chat) {
      setTimeout(initializeExtension, 100);
      return;
    }

    // Register the custom extension
    if (window.voiceflow.chat.register) {
      window.voiceflow.chat.register({
        name: 'ext_darkForm',
        render: renderDarkForm
      });
    } else {
      // Fallback: Listen for custom action events
      setupFormListener();
    }
  }

  /**
   * Setup listener for when Voiceflow requests the form
   */
  function setupFormListener() {
    // Listen for custom actions or messages that trigger the form
    document.addEventListener('voiceflow:action', function(event) {
      if (event.detail && event.detail.action === 'ext_darkForm') {
        renderDarkForm();
      }
    });

    // Also check for Voiceflow's custom component system
    if (window.voiceflow && window.voiceflow.chat && window.voiceflow.chat.on) {
      window.voiceflow.chat.on('action', function(action) {
        if (action.type === 'ext_darkForm' || action.name === 'ext_darkForm') {
          renderDarkForm();
        }
      });
    }
  }

  /**
   * Renders the dark-themed medical form
   */
  function renderDarkForm() {
    // Check if form already exists
    const existingForm = document.getElementById('vf-dark-medical-form');
    if (existingForm) {
      existingForm.style.display = 'block';
      return;
    }

    // Create form container
    const formContainer = document.createElement('div');
    formContainer.id = 'vf-dark-medical-form';
    formContainer.className = 'vf-dark-form-container';
    
    // Apply dark theme styles
    const styles = `
      <style>
        .vf-dark-form-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #e0e0e0;
          max-width: 600px;
          width: 100%;
        }

        .vf-dark-form-container h3 {
          color: #ffffff;
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 600;
          border-bottom: 2px solid rgba(59, 130, 246, 0.5);
          padding-bottom: 12px;
        }

        .vf-dark-form-group {
          margin-bottom: 20px;
        }

        .vf-dark-form-label {
          display: block;
          color: #b0b0b0;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .vf-dark-form-label .required {
          color: #ef4444;
          margin-left: 4px;
        }

        .vf-dark-form-input,
        .vf-dark-form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .vf-dark-form-input:focus,
        .vf-dark-form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .vf-dark-form-input::placeholder,
        .vf-dark-form-textarea::placeholder {
          color: #6b7280;
        }

        .vf-dark-form-textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
        }

        .vf-dark-form-file-wrapper {
          position: relative;
        }

        .vf-dark-form-file-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .vf-dark-form-file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 2px dashed rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #60a5fa;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .vf-dark-form-file-label:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .vf-dark-form-file-name {
          margin-top: 8px;
          font-size: 12px;
          color: #9ca3af;
          display: none;
        }

        .vf-dark-form-file-name.show {
          display: block;
        }

        .vf-dark-form-submit {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .vf-dark-form-submit:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          transform: translateY(-1px);
        }

        .vf-dark-form-submit:active {
          transform: translateY(0);
        }

        .vf-dark-form-submit:disabled {
          background: rgba(107, 114, 128, 0.5);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .vf-dark-form-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: none;
        }

        .vf-dark-form-error.show {
          display: block;
        }

        .vf-dark-form-loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    // Create form HTML
    formContainer.innerHTML = styles + `
      <h3>Patient Medical Information Form</h3>
      <form id="vf-dark-medical-form-element">
        <div class="vf-dark-form-group">
          <label class="vf-dark-form-label" for="patient_name">
            Patient Name <span class="required">*</span>
          </label>
          <input
            type="text"
            id="patient_name"
            name="patient_name"
            class="vf-dark-form-input"
            placeholder="Enter patient's full name"
            required
          />
          <div class="vf-dark-form-error" id="error_patient_name">Please enter patient name</div>
        </div>

        <div class="vf-dark-form-group">
          <label class="vf-dark-form-label" for="phone_number">
            Phone Number <span class="required">*</span>
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            class="vf-dark-form-input"
            placeholder="Enter phone number"
            required
          />
          <div class="vf-dark-form-error" id="error_phone_number">Please enter a valid phone number</div>
        </div>

        <div class="vf-dark-form-group">
          <label class="vf-dark-form-label" for="email">
            Email Address <span class="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            class="vf-dark-form-input"
            placeholder="Enter email address"
            required
          />
          <div class="vf-dark-form-error" id="error_email">Please enter a valid email address</div>
        </div>

        <div class="vf-dark-form-group">
          <label class="vf-dark-form-label" for="patient_symptoms">
            Patient Symptoms <span class="required">*</span>
          </label>
          <textarea
            id="patient_symptoms"
            name="patient_symptoms"
            class="vf-dark-form-textarea"
            placeholder="Describe the patient's symptoms in detail"
            required
          ></textarea>
          <div class="vf-dark-form-error" id="error_patient_symptoms">Please describe the patient's symptoms</div>
        </div>

        <div class="vf-dark-form-group">
          <label class="vf-dark-form-label" for="health_report">
            Health Report (File Upload) <span class="required">*</span>
          </label>
          <div class="vf-dark-form-file-wrapper">
            <input
              type="file"
              id="health_report"
              name="health_report"
              class="vf-dark-form-file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              required
            />
            <label for="health_report" class="vf-dark-form-file-label">
              📄 Click to upload or drag and drop
            </label>
            <div class="vf-dark-form-file-name" id="file_name"></div>
          </div>
          <div class="vf-dark-form-error" id="error_health_report">Please upload a health report file</div>
        </div>

        <button type="submit" class="vf-dark-form-submit" id="submit_btn">
          Submit Medical Information
        </button>
      </form>
    `;

    // Find Voiceflow chat container and append form
    const chatContainer = findVoiceflowContainer();
    if (chatContainer) {
      chatContainer.appendChild(formContainer);
    } else {
      // Fallback: append to body
      document.body.appendChild(formContainer);
    }

    // Setup form event listeners
    setupFormHandlers(formContainer);
  }

  /**
   * Find Voiceflow chat container
   */
  function findVoiceflowContainer() {
    // Common Voiceflow container selectors
    const selectors = [
      '[data-voiceflow-chat]',
      '.voiceflow-chat',
      '#voiceflow-chat',
      '.vf-chat-container',
      '.voiceflow-container'
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) return container;
    }

    // Try to find any container with voiceflow in class/id
    const allElements = document.querySelectorAll('[class*="voiceflow"], [id*="voiceflow"], [class*="vf-"], [id*="vf-"]');
    if (allElements.length > 0) {
      return allElements[0];
    }

    return null;
  }

  /**
   * Setup form event handlers
   */
  function setupFormHandlers(container) {
    const form = container.querySelector('#vf-dark-medical-form-element');
    const fileInput = container.querySelector('#health_report');
    const fileNameDisplay = container.querySelector('#file_name');
    const submitBtn = container.querySelector('#submit_btn');

    // File input change handler
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        fileNameDisplay.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
        fileNameDisplay.classList.add('show');
      } else {
        fileNameDisplay.classList.remove('show');
      }
    });

    // Form submission handler
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validate form
      if (!validateForm(container)) {
        return;
      }

      // Disable submit button and show loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="vf-dark-form-loading"></span>Submitting...';

      try {
        // Get form values
        const patientName = container.querySelector('#patient_name').value.trim();
        const phoneNumber = container.querySelector('#phone_number').value.trim();
        const email = container.querySelector('#email').value.trim();
        const symptoms = container.querySelector('#patient_symptoms').value.trim();
        const fileInput = container.querySelector('#health_report');
        const file = fileInput.files[0];

        // Convert file to Base64
        let reportFileBase64 = null;
        if (file) {
          reportFileBase64 = await convertFileToBase64(file);
        }

        // Prepare payload with correct keys
        const payload = {
          name: patientName,
          phone: phoneNumber,
          email: email,
          symptoms: symptoms,
          reportFile: reportFileBase64
        };

        // Send data to Voiceflow
        if (window.voiceflow && window.voiceflow.chat && window.voiceflow.chat.interact) {
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: payload
          });

          // Show success message
          submitBtn.innerHTML = '✓ Submitted Successfully!';
          submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          
          // Hide form after success
          setTimeout(() => {
            const formContainer = document.getElementById('vf-dark-medical-form');
            if (formContainer) {
              formContainer.style.display = 'none';
            }
          }, 2000);
        } else {
          throw new Error('Voiceflow chat API not available');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Medical Information';
        alert('Error submitting form. Please try again.');
      }
    });
  }

  /**
   * Validate form fields
   */
  function validateForm(container) {
    let isValid = true;

    // Validate patient name
    const patientName = container.querySelector('#patient_name').value.trim();
    if (!patientName) {
      showError(container, 'error_patient_name');
      isValid = false;
    } else {
      hideError(container, 'error_patient_name');
    }

    // Validate phone number
    const phoneNumber = container.querySelector('#phone_number').value.trim();
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      showError(container, 'error_phone_number');
      isValid = false;
    } else {
      hideError(container, 'error_phone_number');
    }

    // Validate email
    const email = container.querySelector('#email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showError(container, 'error_email');
      isValid = false;
    } else {
      hideError(container, 'error_email');
    }

    // Validate symptoms
    const symptoms = container.querySelector('#patient_symptoms').value.trim();
    if (!symptoms) {
      showError(container, 'error_patient_symptoms');
      isValid = false;
    } else {
      hideError(container, 'error_patient_symptoms');
    }

    // Validate file upload
    const fileInput = container.querySelector('#health_report');
    if (!fileInput.files || fileInput.files.length === 0) {
      showError(container, 'error_health_report');
      isValid = false;
    } else {
      hideError(container, 'error_health_report');
    }

    return isValid;
  }

  /**
   * Show error message
   */
  function showError(container, errorId) {
    const errorElement = container.querySelector('#' + errorId);
    if (errorElement) {
      errorElement.classList.add('show');
    }
  }

  /**
   * Hide error message
   */
  function hideError(container, errorId) {
    const errorElement = container.querySelector('#' + errorId);
    if (errorElement) {
      errorElement.classList.remove('show');
    }
  }

  /**
   * Convert file to Base64 string using FileReader API
   */
  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        // Get base64 string (remove data URL prefix if present)
        const base64String = e.target.result.split(',')[1] || e.target.result;
        resolve(base64String);
      };
      
      reader.onerror = function(error) {
        reject(new Error('Failed to read file: ' + error));
      };
      
      // Read file as data URL (base64)
      reader.readAsDataURL(file);
    });
  }

  /**
   * Format file size for display
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Expose render function globally for manual triggering
  window.renderDarkForm = renderDarkForm;
  window.ext_darkForm = {
    render: renderDarkForm,
    version: '1.0.0'
  };

  // Initialize extension when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }

  // Also try to initialize immediately
  initializeExtension();

})();

