import {
  attendancePercent,
  detectConflicts,
  hasTimeOverlap,
  weightedAverageInPercent,
} from './study-university.calculations';

describe('StudyUniversity calculations', () => {
  it('detects overlap with canonical formula', () => {
    expect(hasTimeOverlap('09:00', '10:30', '10:00', '11:00')).toBe(true);
    expect(hasTimeOverlap('09:00', '10:00', '10:00', '11:00')).toBe(false);
  });

  it('detects schedule conflicts on same weekday', () => {
    const conflicts = detectConflicts(
      [
        { id: 'c1', name: 'Math' },
        { id: 'c2', name: 'Physics' },
      ],
      [
        { courseId: 'c1', weekday: 'monday', startTime: '09:00', endTime: '10:30' },
        { courseId: 'c2', weekday: 'monday', startTime: '10:00', endTime: '11:30' },
      ],
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].courseName).toBe('Math');
    expect(conflicts[0].conflictingCourseName).toBe('Physics');
  });

  it('computes weighted average in percent', () => {
    const avg = weightedAverageInPercent([
      { weight: 40, score: 8, maxScore: 10 },
      { weight: 60, score: 16, maxScore: 20 },
    ]);
    expect(avg).toBe(80);
  });

  it('computes attendance percentage', () => {
    const value = attendancePercent([
      { status: 'present' },
      { status: 'late' },
      { status: 'absent' },
      { status: 'justified' },
    ]);
    expect(value).toBe(75);
  });
});
