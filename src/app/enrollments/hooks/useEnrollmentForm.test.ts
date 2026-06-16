import { renderHook, act } from '@testing-library/react';
import { useEnrollmentForm } from './useEnrollmentForm';

describe('useEnrollmentForm', () => {
  it('initializes with all defaults', () => {
    const { result } = renderHook(() => useEnrollmentForm());
    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.targetType).toBe('listener');
    expect(result.current.formData.listenerId).toBe('');
    expect(result.current.formData.contentType).toBe('project');
    expect(result.current.formData.status).toBe('Not started');
    expect(result.current.activeTab).toBe('general');
    expect(result.current.showMetricDropdown).toBe(false);
    expect(result.current.enableReminders).toBe(false);
    expect(result.current.presenters).toEqual(['info@roi4cio.com']);
    expect(result.current.calendarUrl).toBe('https://meetings.hubspot.com/your-handle');
    expect(result.current.expirationDays).toBe(14);
  });

  it('setFormData updates form state', () => {
    const { result } = renderHook(() => useEnrollmentForm());
    act(() => result.current.setFormData({ ...result.current.formData, title: 'My Enrollment', status: 'In Progress' }));
    expect(result.current.formData.title).toBe('My Enrollment');
    expect(result.current.formData.status).toBe('In Progress');
  });

  it('setActiveTab switches tabs', () => {
    const { result } = renderHook(() => useEnrollmentForm());
    act(() => result.current.setActiveTab('invitations'));
    expect(result.current.activeTab).toBe('invitations');
  });

  it('presenters update', () => {
    const { result } = renderHook(() => useEnrollmentForm());
    act(() => result.current.setPresenters(['a@b.com']));
    expect(result.current.presenters).toEqual(['a@b.com']);
  });

  it('security settings toggle independently', () => {
    const { result } = renderHook(() => useEnrollmentForm());
    act(() => result.current.setSecurityHumanDetection(true));
    expect(result.current.securityHumanDetection).toBe(true);
  });

  it('results settings toggle independently', () => {
    const { result } = renderHook(() => useEnrollmentForm());
    act(() => result.current.setResultsRecording(true));
    expect(result.current.resultsRecording).toBe(true);
  });
});
