import { useFormContext } from 'react-hook-form'

function StepOne() {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  return (
    <div className="step-panel">
      <h2>Personal Info</h2>
      <label>
        First Name
        <input type="text" placeholder="Jane" {...register('firstName')} />
        {errors.firstName && <span className="error">{errors.firstName.message}</span>}
      </label>

      <label>
        Last Name
        <input type="text" placeholder="Doe" {...register('lastName')} />
        {errors.lastName && <span className="error">{errors.lastName.message}</span>}
      </label>

      <label>
        Date of Birth
        <input type="date" {...register('dob')} />
        {errors.dob && <span className="error">{errors.dob.message}</span>}
      </label>
    </div>
  )
}

export default StepOne
