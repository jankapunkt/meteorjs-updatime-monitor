import { fetch } from 'meteor/fetch'
import { AbortController } from 'node-abort-controller'
import { PerformanceObserver, performance } from 'node:perf_hooks'

export class UptimeRequest {
  constructor ({ name, method, url, timeout, response }) {
    // config
    this.name = name
    this.method = method
    this.url = url
    this.timeout = timeout
    this.expectedResponse = response
    this.actualResponse = null

    // results
    this.timestamp = null
    this.performance = null
    this.error = null
    this.hasTimedOut = null
    this.response = null
  }

  async fire () {
    this.timestamp = new Date()

    const observer = new PerformanceObserver((items) => {
      items.getEntries().forEach((entry) => {
        this.performance = entry
      })
    })
    observer.observe({ entryTypes: ["measure"], buffer: true })

    const start = `${this.name} - start`
    const ended = `${this.name} - ended`
    const controller = new AbortController()
    const options = {
      method: this.method,
      priority: 'high',
      redirect: 'error',
      signal: controller.signal,
    }

    const timeout = setTimeout(() => {
      this.hasTimedOut = true
      controller.abort()
    }, this.timeout)

    try {
      performance.mark(start)
      this.response = await fetch(this.url, options)
    } catch (error) {
      this.error = error
    } finally {
      performance.mark(ended)
      clearTimeout(timeout)
      performance.measure(this.url, start, ended)
      observer.disconnect()
    }

    this.actualResponse = this.response?.status

    if (!this.error && this.actualResponse !== this.expectedResponse) {
      this.error = new Error(`Response mismatch: ${this.actualResponse} / ${this.expectedResponse}`)
    }
  }

  toDocument() {
    return {
      name: this.name,
      response: {
        expected: this.expectedResponse,
        actual: this.actualResponse,
      },
      fired: this.timestamp,
      duration: this.performance?.duration ?? 0,
      hasTimedOut: !!this.hasTimedOut,
      error: this.error
    }
  }
}