import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

function StepTwo() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    watch,
    formState: { errors }
  } = useFormContext()

  const password = watch('password')

  return (
    <div className="step-panel">
      <h2>Account Details</h2>

      <label>
        Email
        <input type="email" placeholder="jane@example.com" {...register('email')} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </label>

      <label>
        Password
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            {...register('password')}
          />
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <span className="error">{errors.password.message}</span>}
      </label>

      <label>
        Confirm Password
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </label>

      {password && password.length < 8 && !errors.password && (
        <span className="hint">Password must be at least 8 characters.</span>
      )}
    </div>
  )
}

export default StepTwo
