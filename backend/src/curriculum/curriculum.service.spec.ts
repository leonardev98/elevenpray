import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CurriculumService } from './curriculum.service';
import { CurriculumCourse } from './entities/curriculum-course.entity';
import { CurriculumPrerequisite } from './entities/curriculum-prerequisite.entity';
import { Course } from '../study-university/entities/course.entity';
import { Semester } from '../study-university/entities/semester.entity';
import { StudyWorkspaceConfig } from '../study-university/entities/study-workspace-config.entity';
import { User } from '../users/entities/user.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';

describe('CurriculumService', () => {
  let service: CurriculumService;

  const curriculumRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    save: jest.fn(),
    create: jest.fn((x) => x),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const prereqRepo = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    create: jest.fn((x) => x),
    delete: jest.fn(),
  };
  const courseRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    save: jest.fn(),
    create: jest.fn((x) => x),
    update: jest.fn(),
  };
  const semesterRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((x) => x),
  };
  const configRepo = { findOne: jest.fn() };
  const workspacesService = {
    findAllByUserId: jest.fn().mockResolvedValue([
      { id: 'ws-1', workspaceType: 'study', userId: 'user-1' },
    ]),
    findOne: jest.fn(),
  };
  const userRepo = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-1', curriculumTotalCycles: 10 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CurriculumService,
        { provide: WorkspacesService, useValue: workspacesService },
        { provide: getRepositoryToken(CurriculumCourse), useValue: curriculumRepo },
        { provide: getRepositoryToken(CurriculumPrerequisite), useValue: prereqRepo },
        { provide: getRepositoryToken(Course), useValue: courseRepo },
        { provide: getRepositoryToken(Semester), useValue: semesterRepo },
        { provide: getRepositoryToken(StudyWorkspaceConfig), useValue: configRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();
    service = module.get(CurriculumService);
  });

  it('returns empty curriculum for new user', async () => {
    const result = await service.getCurriculum('user-1');
    expect(result.courses).toEqual([]);
    expect(result.stats.totalCourses).toBe(0);
    expect(result.totalCycles).toBe(10);
    expect(result.cycleNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
