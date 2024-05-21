import express from 'express'
import { createHash } from 'crypto'

const SIGNATURE_KEY = 'wsk_upsjOIYYLME2zLPaiDDe9BpXP2ZS8xnw' // Load this from your config
const STEPS = {
  step_a: (payload) => ({ exit_code: 'success' }),
  step_a: (payload) => ({ exit_code: 'success' }),
  step_c: (payload) => ({ exit_code: 'success', data: { myOutput: 'myValue' }}) // Return additional data optionally
}

function stepFactory (stepName) {
  const defaultHandler = (_) => {}
  return STEPS[stepName] || defaultHandler
}

function validateRequest(payload, signature) {
  const message = `${JSON.stringify(payload)}${SIGNATURE_KEY}`
  const hash = createHash('sha256').update(message, 'utf-8').digest('hex').toString('hex')
  return hash == signature
}

const app = express()
app.use(express.json())

// Webhook URL
app.post('/hook', async (req, res) => {
  const body = req.body
  const { payload, signature } = body

  if (!validateRequest(payload, signature)) {
    res.status(400).json({ error: 'Invalid input request, please verify the signature' })
    return
  }

  const { context } = payload
  const step = stepFactory(context.step_name)

  return res.json(step(payload))
})

app.listen(3000, () => console.log('Example app listening on port 3000'))
