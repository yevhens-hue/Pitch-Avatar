import { api, ApiError } from './api'

describe('api', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('api.get', () => {
    it('makes GET request', async () => {
      const mockData = { id: 1, name: 'test' }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await api.get('/test')

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
        headers: { 'Content-Type': 'application/json' },
      })
      expect(result).toEqual(mockData)
    })

    it('throws ApiError on failed request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(api.get('/test')).rejects.toThrow(ApiError)
      await expect(api.get('/test')).rejects.toThrow('API error: Not Found')
    })
  })

  describe('api.post', () => {
    it('makes POST request with body', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const body = { name: 'test' }
      const result = await api.post('/test', body)

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('api.put', () => {
    it('makes PUT request with body', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const body = { name: 'updated' }
      const result = await api.put('/test/1', body)

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test/1', {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('api.delete', () => {
    it('makes DELETE request', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await api.delete('/test/1')

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('ApiError', () => {
    it('has correct name', () => {
      const error = new ApiError(404, 'Not Found')
      expect(error.name).toBe('ApiError')
    })

    it('has correct message', () => {
      const error = new ApiError(404, 'Not Found')
      expect(error.message).toBe('Not Found')
    })

    it('has correct status', () => {
      const error = new ApiError(500, 'Server Error')
      expect(error.status).toBe(500)
    })

    it('is instance of Error', () => {
      const error = new ApiError(400, 'Bad Request')
      expect(error).toBeInstanceOf(Error)
    })
  })
})
