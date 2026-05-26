import express from 'express'
import { getAllUsageStatus, resolveUsageIdentity } from '../lib/usage.js'

export const usageRouter = express.Router()

usageRouter.get('/status', (req, res) => {
  const identity = resolveUsageIdentity(req, res, { ensureAnon: true })
  res.json({
    usage: getAllUsageStatus(identity)
  })
})
