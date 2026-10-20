function createEmptyGrid(workingDays, periodsPerDay) {
  const grid = {};
  for (const day of workingDays) {
    grid[day] = Array.from({ length: periodsPerDay }, () => null);
  }
  return grid;
}

function cloneGrid(grid) {
  const copy = {};
  for (const [day, periods] of Object.entries(grid)) {
    copy[day] = [...periods];
  }
  return copy;
}

function cloneTeacherBusy(teacherBusy) {
  const copy = {};
  for (const [teacherId, dayMap] of Object.entries(teacherBusy)) {
    copy[teacherId] = {};
    for (const [day, periods] of Object.entries(dayMap)) {
      copy[teacherId][day] = new Set(periods);
    }
  }
  return copy;
}

function placeSlot(grid, day, period, subjectId, teacherId, isLabBlock = false) {
  grid[day][period] = { subjectId, teacherId, isLabBlock };
}

function removeSlot(grid, day, period) {
  grid[day][period] = null;
}

function isSlotFree(grid, day, period) {
  return grid[day][period] === null || grid[day][period] === undefined;
}

function isTeacherFree(teacherBusy, teacherId, day, period) {
  return !teacherBusy[teacherId]?.[day]?.has(period);
}

function sortCandidates(candidates, dayCounts, subjectId) {
  return candidates.sort((a, b) => {
    const countA = dayCounts[subjectId]?.[a.day] || 0;
    const countB = dayCounts[subjectId]?.[b.day] || 0;
    if (countA !== countB) return countA - countB;
    return a.period - b.period;
  });
}

function buildTeacherBusy(teachers) {
  const teacherBusy = {};
  for (const teacher of teachers) {
    teacherBusy[teacher._id] = {};
  }
  return teacherBusy;
}

function generateTimetable(classes, teachers, subjects, config) {
  const workingDays = config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periodsPerDay = Number(config.periodsPerDay || 6);
  const classOrder = [...classes].sort((a, b) => a.name.localeCompare(b.name));
  const subjectMap = Object.fromEntries(subjects.map((subject) => [subject._id, subject]));
  const teacherBusy = buildTeacherBusy(teachers);

  const classGrids = {};
  const conflicts = [];

  for (const classEntry of classOrder) {
    classGrids[classEntry._id] = createEmptyGrid(workingDays, periodsPerDay);
  }

  for (const classEntry of classOrder) {
    const classGrid = classGrids[classEntry._id];
    for (const assignment of classEntry.subjects || []) {
      const subject = subjectMap[assignment.subjectId];
      if (!subject) continue;
      if (subject.isLab) {
        const sessions = Number(assignment.sessionsPerWeek || 1);
        for (let sessionIndex = 0; sessionIndex < sessions; sessionIndex += 1) {
          let placed = false;
          for (const day of workingDays) {
            const duration = Number(subject.labDurationInPeriods || 1);
            for (let start = 0; start <= periodsPerDay - duration; start += 1) {
              let canPlace = true;
              for (let offset = 0; offset < duration; offset += 1) {
                const period = start + offset;
                if (!isSlotFree(classGrid, day, period) || !isTeacherFree(teacherBusy, assignment.assignedTeacherId, day, period)) {
                  canPlace = false;
                  break;
                }
              }
              if (!canPlace) continue;
              for (let offset = 0; offset < duration; offset += 1) {
                const period = start + offset;
                placeSlot(classGrid, day, period, subject._id, assignment.assignedTeacherId, true);
                teacherBusy[assignment.assignedTeacherId][day] = teacherBusy[assignment.assignedTeacherId][day] || new Set();
                teacherBusy[assignment.assignedTeacherId][day].add(period);
              }
              placed = true;
              break;
            }
            if (placed) break;
          }
          if (!placed) {
            conflicts.push({
              class: classEntry.name,
              subject: subject.name,
              reason: `No common free contiguous slot for ${subject.name}`
            });
            break;
          }
        }
      }
    }
  }

  for (const classEntry of classOrder) {
    const classGrid = classGrids[classEntry._id];
    const regularAssignments = (classEntry.subjects || []).filter((assignment) => {
      const subject = subjectMap[assignment.subjectId];
      return subject && !subject.isLab;
    });

    const orderedAssignments = [...regularAssignments].sort((a, b) => {
      const subjectA = subjectMap[a.subjectId];
      const subjectB = subjectMap[b.subjectId];
      return (Number(b.periodsPerWeek || 0) - Number(a.periodsPerWeek || 0)) || (subjectA?.name || '').localeCompare(subjectB?.name || '');
    });

    const dayCounts = {};
    const success = placeRegularAssignments({
      assignments: orderedAssignments,
      classGrid,
      teacherBusy,
      subjectMap,
      dayCounts,
      workingDays,
      periodsPerDay,
      className: classEntry.name,
      conflicts
    });

    if (!success) {
      const pending = orderedAssignments.filter((assignment) => Number(assignment.periodsPerWeek || 0) > 0);
      if (pending.length) {
        conflicts.push({
          class: classEntry.name,
          subject: pending[0].subjectId,
          reason: 'Unable to place all regular periods without violating teacher availability'
        });
      }
    }
  }

  for (const classEntry of classOrder) {
    const classGrid = classGrids[classEntry._id];
    for (const day of workingDays) {
      for (let period = 0; period < periodsPerDay; period += 1) {
        if (classGrid[day][period] === null || classGrid[day][period] === undefined) {
          classGrid[day][period] = { subjectId: null, teacherId: null, isLabBlock: false, isFree: true, label: 'Free Period' };
        }
      }
    }
  }

  return {
    success: conflicts.length === 0,
    classGrids,
    teacherBusy,
    conflicts
  };
}

function placeRegularAssignments({ assignments, classGrid, teacherBusy, subjectMap, dayCounts, workingDays, periodsPerDay, className, conflicts }) {
  const assignmentQueue = [...assignments];

  function tryPlace(index, localGrid, localTeacherBusy, localDayCounts) {
    if (index >= assignmentQueue.length) return true;

    const assignment = assignmentQueue[index];
    const subject = subjectMap[assignment.subjectId];
    if (!subject) return tryPlace(index + 1, localGrid, localTeacherBusy, localDayCounts);

    const needed = Number(assignment.periodsPerWeek || 0);
    if (needed <= 0) return tryPlace(index + 1, localGrid, localTeacherBusy, localDayCounts);

    const candidateSlots = [];
    for (const day of workingDays) {
      for (let period = 0; period < periodsPerDay; period += 1) {
        if (!isSlotFree(localGrid, day, period)) continue;
        if (!isTeacherFree(localTeacherBusy, assignment.assignedTeacherId, day, period)) continue;
        candidateSlots.push({ day, period });
      }
    }

    if (candidateSlots.length < needed) {
      return false;
    }

    const sorted = sortCandidates(candidateSlots, localDayCounts, subject._id);
    return placeRemainingPeriods({
      index,
      remaining: needed,
      localGrid,
      localTeacherBusy,
      localDayCounts,
      subject,
      assignment,
      sorted,
      workingDays,
      periodsPerDay,
      className,
      conflicts
    });
  }

  function placeRemainingPeriods({ index, remaining, localGrid, localTeacherBusy, localDayCounts, subject, assignment, sorted, workingDays, periodsPerDay, className, conflicts }) {
    if (remaining === 0) {
      return tryPlace(index + 1, localGrid, localTeacherBusy, localDayCounts);
    }

    if (sorted.length === 0) {
      return false;
    }

    const [slot, ...rest] = sorted;
    const nextSorted = rest;
    const day = slot.day;
    const period = slot.period;

    localGrid[day][period] = { subjectId: subject._id, teacherId: assignment.assignedTeacherId, isLabBlock: false };
    localTeacherBusy[assignment.assignedTeacherId][day] = localTeacherBusy[assignment.assignedTeacherId][day] || new Set();
    localTeacherBusy[assignment.assignedTeacherId][day].add(period);
    localDayCounts[subject._id] = localDayCounts[subject._id] || {};
    localDayCounts[subject._id][day] = (localDayCounts[subject._id][day] || 0) + 1;

    const success = placeRemainingPeriods({
      index,
      remaining: remaining - 1,
      localGrid,
      localTeacherBusy,
      localDayCounts,
      subject,
      assignment,
      sorted: nextSorted,
      workingDays,
      periodsPerDay,
      className,
      conflicts
    });

    if (success) {
      return true;
    }

    localGrid[day][period] = null;
    localTeacherBusy[assignment.assignedTeacherId][day].delete(period);
    localDayCounts[subject._id][day] = Math.max((localDayCounts[subject._id][day] || 1) - 1, 0);
    if (localDayCounts[subject._id][day] === 0) delete localDayCounts[subject._id][day];

    return placeRemainingPeriods({
      index,
      remaining,
      localGrid,
      localTeacherBusy,
      localDayCounts,
      subject,
      assignment,
      sorted: rest,
      workingDays,
      periodsPerDay,
      className,
      conflicts
    });
  }

  const success = tryPlace(0, classGrid, teacherBusy, dayCounts);
  return success;
}

module.exports = {
  generateTimetable,
  createEmptyGrid
};
