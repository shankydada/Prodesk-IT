function StepThree({ formData }) {
  return (
    <div className="step-panel">
      <h2>Review & Submit</h2>
      <div className="review-row">
        <span>First Name:</span>
        <strong>{formData.firstName}</strong>
      </div>
      <div className="review-row">
        <span>Last Name:</span>
        <strong>{formData.lastName}</strong>
      </div>
      <div className="review-row">
        <span>Date of Birth:</span>
        <strong>{formData.dob}</strong>
      </div>
      <div className="review-row">
        <span>Email:</span>
        <strong>{formData.email}</strong>
      </div>
      <div className="review-note">
        <p>Please confirm all details before submission.</p>
      </div>
    </div>
  )
}

export default StepThree
