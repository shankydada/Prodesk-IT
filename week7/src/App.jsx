import { useMemo, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationSchema } from './formSchema.js'
import StepOne from './StepOne.jsx'
import StepTwo from './StepTwo.jsx'
import StepThree from './StepThree.jsx'

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Account Details' },
  { id: 3, label: 'Review & Submit' }
]

function App() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const formMethods = useForm({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      dob: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const { handleSubmit, watch, formState } = formMethods
  const formData = watch()
  const stepCount = steps.length

  const isStepValid = useMemo(() => {
    if (step === 1) {
      return (
        !formState.errors.firstName &&
        !formState.errors.lastName &&
        !formState.errors.dob &&
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.dob.trim() !== ''
      )
    }

    if (step === 2) {
      return (
        !formState.errors.email &&
        !formState.errors.password &&
        !formState.errors.confirmPassword &&
        formData.email.trim() !== '' &&
        formData.password.trim() !== '' &&
        formData.confirmPassword.trim() !== ''
      )
    }

    return true
  }, [step, formState.errors, formData])

  const nextStep = () => {
    if (step < stepCount) {
      setStep((current) => current + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep((current) => current - 1)
    }
  }

  const onSubmit = (data) => {
    console.log('Final Payload:', data)
    setIsSubmitted(true)
  }

  return (
    <div className="wizard-shell">
      <div className="wizard-card">
        <header className="wizard-header">
          <h1>Registration Wizard</h1>
          <p>Step {step} of {stepCount}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / stepCount) * 100}%` }} />
          </div>
        </header>

        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 1 && <StepOne />}
            {step === 2 && <StepTwo />}
            {step === 3 && <StepThree formData={formData} />}

            <div className="wizard-actions">
              {step > 1 && (
                <button type="button" className="secondary" onClick={prevStep}>
                  Back
                </button>
              )}

              {step < stepCount && (
                <button type="button" className="primary" onClick={nextStep} disabled={!isStepValid}>
                  Next
                </button>
              )}

              {step === stepCount && (
                <button type="submit" className="primary">
                  Submit
                </button>
              )}
            </div>
          </form>
        </FormProvider>

        {isSubmitted && (
          <div className="success-message">
            <h2>Success!</h2>
            <p>Your registration payload has been submitted.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
