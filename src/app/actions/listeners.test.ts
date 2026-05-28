import {
  getListeners,
  createListener,
  updateListener,
  deleteListener
} from './listeners'
import { supabase } from '@/lib/supabase'

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

describe('Listeners Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getListeners', () => {
    it('queries listeners table with range and order', async () => {
      const mockResult = { data: [], total: 0 }
      const orMock = jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      })
      const orderMock = jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      })

      const selectMock = jest.fn().mockReturnValue({
        order: orderMock
      })

      const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
        select: selectMock
      } as any)

      await getListeners()

      expect(fromSpy).toHaveBeenCalledWith('listeners')
      expect(selectMock).toHaveBeenCalledWith('*', { count: 'exact' })
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('applies search filters using ilike or block when search string provided', async () => {
      const orMock = jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      })
      const orderMock = jest.fn().mockReturnValue({
        or: orMock
      })
      const selectMock = jest.fn().mockReturnValue({
        order: orderMock
      })
      jest.spyOn(supabase, 'from').mockReturnValue({
        select: selectMock
      } as any)

      await getListeners('Maria')

      expect(orMock).toHaveBeenCalledWith(
        'email.ilike.%Maria%,first_name.ilike.%Maria%,last_name.ilike.%Maria%,position.ilike.%Maria%'
      )
    })
  })

  describe('createListener', () => {
    it('inserts a listener record and returns the new data', async () => {
      const mockItem = { id: 'l-1', email: 'john.smith@acme.com', first_name: 'John' }
      const selectMock = jest.fn().mockResolvedValue({ data: [mockItem], error: null })
      const insertMock = jest.fn().mockReturnValue({
        select: selectMock
      })
      jest.spyOn(supabase, 'from').mockReturnValue({
        insert: insertMock
      } as any)

      const result = await createListener({
        email: 'john.smith@acme.com',
        firstName: 'John',
        lastName: 'Smith',
        company: 'Acme Corp',
        industry: 'Software',
        position: 'QA Engineer',
        linkedin: '',
        country: 'USA',
        department: 'Engineering',
        language: 'en',
        documents: [],
        userId: 'test-user-id'
      })

      expect(supabase.from).toHaveBeenCalledWith('listeners')
      expect(insertMock).toHaveBeenCalledWith([expect.objectContaining({
        email: 'john.smith@acme.com',
        first_name: 'John',
        user_id: 'test-user-id'
      })])
      expect(result).toEqual(mockItem)
    })
  })

  describe('updateListener', () => {
    it('updates a listener record by ID', async () => {
      const mockItem = { id: 'l-1', email: 'john.smith@acme.com', first_name: 'Johnathan' }
      const selectMock = jest.fn().mockResolvedValue({ data: [mockItem], error: null })
      const eqMock = jest.fn().mockReturnValue({
        select: selectMock
      })
      const updateMock = jest.fn().mockReturnValue({
        eq: eqMock
      })
      jest.spyOn(supabase, 'from').mockReturnValue({
        update: updateMock
      } as any)

      const result = await updateListener('l-1', {
        firstName: 'Johnathan'
      })

      expect(supabase.from).toHaveBeenCalledWith('listeners')
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        first_name: 'Johnathan'
      }))
      expect(eqMock).toHaveBeenCalledWith('id', 'l-1')
      expect(result).toEqual(mockItem)
    })
  })

  describe('deleteListener', () => {
    it('deletes a listener record by ID', async () => {
      const eqMock = jest.fn().mockResolvedValue({ error: null })
      const deleteMock = jest.fn().mockReturnValue({
        eq: eqMock
      })
      jest.spyOn(supabase, 'from').mockReturnValue({
        delete: deleteMock
      } as any)

      await deleteListener('l-1')

      expect(supabase.from).toHaveBeenCalledWith('listeners')
      expect(deleteMock).toHaveBeenCalled()
      expect(eqMock).toHaveBeenCalledWith('id', 'l-1')
    })
  })
})
