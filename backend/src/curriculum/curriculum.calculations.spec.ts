import {
  buildUnlocksMap,
  computeCurriculumStats,
  computeUnlockState,
  wouldCreatePrerequisiteCycle,
} from './curriculum.calculations';

describe('Curriculum calculations', () => {
  it('detects prerequisite cycles', () => {
    const edges = [
      { courseId: 'B', prerequisiteId: 'A' },
    ];
    expect(wouldCreatePrerequisiteCycle('A', ['B'], edges)).toBe(true);
    expect(wouldCreatePrerequisiteCycle('C', ['A'], edges)).toBe(false);
  });

  it('computes unlock when all prerequisites approved', () => {
    const statusById = new Map([
      ['p1', 'approved' as const],
      ['p2', 'approved' as const],
    ]);
    expect(
      computeUnlockState('c1', 'pending', ['p1', 'p2'], statusById),
    ).toBe(true);
    statusById.set('p2', 'pending');
    expect(
      computeUnlockState('c1', 'pending', ['p1', 'p2'], statusById),
    ).toBe(false);
  });

  it('builds unlocks map', () => {
    const unlocks = buildUnlocksMap([
      { courseId: 'B', prerequisiteId: 'A' },
      { courseId: 'C', prerequisiteId: 'A' },
    ]);
    expect(unlocks.get('A')).toEqual(['B', 'C']);
  });

  it('computes curriculum stats', () => {
    const stats = computeCurriculumStats([
      { credits: 3, status: 'approved', cycleNumber: 1 },
      { credits: 4, status: 'pending', cycleNumber: 1 },
    ]);
    expect(stats.approvedCredits).toBe(3);
    expect(stats.totalCredits).toBe(7);
    expect(stats.progressPercent).toBe(43);
  });
});
