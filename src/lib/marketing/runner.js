// Agent runner abstraction. Today: Claude SDK with streaming.
// Tomorrow: swap implementation for Trigger.dev without changing callers.

import Anthropic from '@anthropic-ai/sdk'
import { costUsd } from './pricing.js'

const DEFAULT_MODEL = 'claude-sonnet-4-6'

export function createRunner({ apiKey }) {
  const client = new Anthropic({ apiKey })

  return {
    /**
     * Stream a skill execution.
     * @param {object} opts
     * @param {string} opts.system    System prompt
     * @param {string} opts.user      User content (rendered from inputs)
     * @param {string} [opts.model]
     * @param {(chunk:{type:string,text?:string,usage?:object}) => void} opts.onChunk
     * @returns {Promise<{text:string, usage:object, model:string, cost_usd:number, duration_ms:number}>}
     */
    async run({ system, user, model = DEFAULT_MODEL, onChunk = () => {} }) {
      const started = Date.now()
      let fullText = ''
      let usage = { input_tokens: 0, output_tokens: 0 }
      let usedModel = model

      const stream = await client.messages.stream({
        model,
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: user }],
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          const text = event.delta.text || ''
          fullText += text
          onChunk({ type: 'text', text })
        } else if (event.type === 'message_delta' && event.usage) {
          usage = { ...usage, ...event.usage }
        } else if (event.type === 'message_start' && event.message) {
          if (event.message.usage) usage = { ...usage, ...event.message.usage }
          if (event.message.model) usedModel = event.message.model
        }
      }

      const final = await stream.finalMessage()
      if (final?.usage) usage = final.usage
      if (final?.model) usedModel = final.model

      const cost_usd = costUsd({
        model: usedModel,
        tokens_in: usage.input_tokens || 0,
        tokens_out: usage.output_tokens || 0,
      })
      const duration_ms = Date.now() - started

      const result = { text: fullText, usage, model: usedModel, cost_usd, duration_ms }
      onChunk({ type: 'done', ...result })
      return result
    },
  }
}
