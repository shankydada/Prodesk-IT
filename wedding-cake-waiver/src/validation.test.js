import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidEmail, isValidPhone, sanitizeInput, validateStepData } from './validation.js'

const validForm = {
  clientName: 'Jordan Lee',
  eventDate: '2026-09-12',
  venue: 'The Atrium',
  guestCount: '120',
  contactName: 'Jordan Lee',
  phone: '+1 (555) 123-4567',
  email: 'jordan@example.com',
  cakeType: 'Buttercream cake',
  signature: 'Jordan Lee',
  waiverAccepted: true,
}

test('sanitizes markup and control characters before state storage', () => {
  assert.equal(sanitizeInput('  <script>alert(1)</script>\u0000  cake  '), 'scriptalert(1)/script cake')
})

test('accepts valid contact patterns and rejects malformed values', () => {
  assert.equal(isValidEmail('staff@example.com'), true)
  assert.equal(isValidEmail('staff@example'), false)
  assert.equal(isValidPhone('+1 (555) 123-4567'), true)
  assert.equal(isValidPhone('not-a-phone'), false)
})

test('returns no errors for a complete form', () => {
  assert.deepEqual(validateStepData(validForm, 1), {})
  assert.deepEqual(validateStepData(validForm, 2), {})
  assert.deepEqual(validateStepData(validForm, 3), {})
})

test('rejects invalid guest count and waiver acceptance', () => {
  assert.equal(validateStepData({ ...validForm, guestCount: '9' }, 1).guestCount, 'Guest count must be between 10 and 2000.')
  assert.equal(validateStepData({ ...validForm, waiverAccepted: false }, 3).waiverAccepted, 'Please accept the dietary waiver.')
})