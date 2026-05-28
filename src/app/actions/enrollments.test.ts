import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  manualEnterResult,
  getSeatsQuota,
  updateSeatsQuota,
  getMailDomain,
  saveMailDomain
} from './enrollments'
import { supabase } from '@/lib/supabase'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

describe('Enrollments and Billing Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEnrollments', () => {
    it('fetches all enrollments from database', async () => {
      const mockList = [{ id: 'e-1', title: 'Enrollment 1', project_id: 'p-1', listener_id: 'l-1', status: 'Pending' }]
      const selectMock = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockList, error: null })
      })

      jest.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'enrollments') {
          return { select: selectMock } as any
        }
        return {
          select: jest.fn().mockResolvedValue({ data: [], error: null })
        } as any
      })

      const result = await getEnrollments()
      expect(supabase.from).toHaveBeenCalledWith('enrollments')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e-1')
      expect(result[0].projectTitle).toBe('Unknown Project') // Mock join fallback
    })
  })

  describe('createEnrollment', () => {
    it('inserts new enrollment record if under seat quota capacity', async () => {
      const mockResult = [{ id: 'e-1', title: 'Enrollment 1' }]
      const selectMock = jest.fn().mockResolvedValue({ data: mockResult, error: null })
      const insertMock = jest.fn().mockReturnValue({
        select: selectMock
      })

      jest.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'listener_seats') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { max_seats: 100 }, error: null })
              })
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null })
            })
          } as any
        }
        if (table === 'enrollments') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: [], error: null }) // no active seats
            }),
            insert: insertMock
          } as any
        }
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          })
        } as any
      })

      const res = await createEnrollment({
        title: 'New Onboarding Cohort',
        listenerId: 'l-2',
        projectId: 'p-1',
        status: 'Pending',
        startDate: new Date().toISOString(),
        emailSchedule: {}
      })

      expect(insertMock).toHaveBeenCalled()
      expect(res).toEqual(mockResult[0])
    })

    it('throws custom exception if active seats exceeds account purchased capacity', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'listener_seats') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { max_seats: 2 }, error: null })
              })
            })
          } as any
        }
        if (table === 'enrollments') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({
                data: [
                  { listener_id: 'l-10' },
                  { listener_id: 'l-11' }
                ],
                error: null
              }) // active count = 2
            })
          } as any
        }
        return {} as any
      })

      await expect(
        createEnrollment({
          title: 'Exceeding Cohort',
          listenerId: 'l-12', // l-12 is not in active pool
          projectId: 'p-1',
          status: 'Pending',
          startDate: new Date().toISOString(),
          emailSchedule: {}
        })
      ).rejects.toThrow(/QUOTA_EXCEEDED/)
    })
  })

  describe('updateEnrollment', () => {
    it('updates enrollment data', async () => {
      const selectMock = jest.fn().mockResolvedValue({ data: [{ id: 'e-1' }], error: null })
      const eqMock = jest.fn().mockReturnValue({
        select: selectMock
      })
      const updateMock = jest.fn().mockReturnValue({
        eq: eqMock
      })
      jest.spyOn(supabase, 'from').mockReturnValue({
        update: updateMock
      } as any)

      await updateEnrollment('e-1', { title: 'Updated Title' })
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Title' }))
    })
  })

  describe('manualEnterResult', () => {
    it('manually sets enrollment status and start_date override', async () => {
      const selectMock = jest.fn().mockResolvedValue({ data: [{ id: 'e-1' }], error: null })
      const eqMock = jest.fn().mockReturnValue({
        select: selectMock
      })
      const updateMock = jest.fn().mockReturnValue({
        eq: eqMock
      })
      jest.spyOn(supabase, 'from').mockReturnValue({
        update: updateMock
      } as any)

      await manualEnterResult('e-1', 'Completed', '2026-05-28')
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        status: 'Completed',
        start_date: '2026-05-28'
      }))
    })
  })

  describe('Seats and Mail Domains', () => {
    it('gets seat quota limit', async () => {
      const eqMock = jest.fn().mockResolvedValue({ data: [{ id: 's-1', max_seats: 120, active_count: 5 }], error: null })
      const selectMock = jest.fn().mockReturnValue({
        eq: eqMock
      })
      jest.spyOn(supabase, 'from').mockReturnValue({
        select: selectMock
      } as any)

      const result = await getSeatsQuota()
      expect(result.maxSeats).toBe(120)
    })

    it('saves custom email domains config', async () => {
      const selectMock = jest.fn().mockResolvedValue({ data: [{ id: 'm-1' }], error: null })
      const insertMock = jest.fn().mockReturnValue({
        select: selectMock
      })
      jest.spyOn(supabase, 'from').mockImplementation((table) => {
        if (table === 'mail_domains') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }) // no existing domain
            }),
            insert: insertMock
          } as any
        }
        return {} as any
      })

      const res = await saveMailDomain('acme.com', 'sender@acme.com')
      expect(insertMock).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({
        domain_name: 'acme.com',
        sender_email: 'sender@acme.com'
      })]))
    })
  })
})
