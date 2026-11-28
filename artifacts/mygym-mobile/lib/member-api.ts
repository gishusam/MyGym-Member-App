export type MemberMembership = {
  id: string;
  planName: string;
  monthlyPriceKes: number;
  startsOn: string;
  expiresOn: string;
  status: 'active' | 'scheduled' | 'expired' | 'cancelled';
};

export type MemberProfile = {
  id: string;
  memberNumber: string;
  fullName: string;
  email: string | null;
  phone: string;
  status: string;
  registeredAt: string;
  qrToken: string;
  membership: MemberMembership | null;
  checkInsThisMonth: number;
};

export type WorkoutExercise = {
  id: string;
  position: number;
  name: string;
  sets: number;
  repetitions: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
};

export type WorkoutSessionExercise = {
  exerciseId: string;
  completed: boolean;
  weightKg: number | null;
  repsCompleted: number | null;
  durationSecondsCompleted: number | null;
};

export type WorkoutSession = {
  id: string;
  sessionDate: string;
  status: 'in_progress' | 'completed';
  exercises: WorkoutSessionExercise[];
  recordedAt: string;
  completedAt: string | null;
};

export type MemberWorkout = {
  id: string;
  programId: string;
  programName: string;
  goal: string;
  description: string | null;
  startsOn: string;
  status: 'assigned' | 'in_progress' | 'completed';
  notes: string | null;
  recommendedDaysPerWeek: number;
  expectedSessionMinutes: number;
  exercises: WorkoutExercise[];
  sessions: WorkoutSession[];
};

export type MemberEvent = {
  id: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  instructorStaffId: string | null;
  instructorName: string | null;
  status: string;
  registeredCount: number;
  remainingSlots: number;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
  registrationStatus: 'confirmed' | 'cancelled' | null;
};

export type MemberProgress = {
  assessments: {
    id: string;
    recordedAt: string;
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    bodyFatPercent: number | null;
    musclePercent: number | null;
    visceralFatLevel: number | null;
  }[];
  checkInsThisMonth: number;
  workoutsThisMonth: number;
};

export type EventRegistration = {
  id: string;
  eventId: string;
  memberId: string;
  memberNumber: string;
  memberName: string;
  status: 'confirmed' | 'cancelled';
  registeredAt: string;
};

type TokenGetter = () => Promise<string | null>;

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

export class MemberApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'MemberApiError';
    this.status = status;
    this.code = code;
  }
}

export async function memberRequest<T>(
  getToken: TokenGetter,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!apiBaseUrl) {
    throw new MemberApiError(
      'Set EXPO_PUBLIC_API_BASE_URL to the FastAPI server URL ending in /api.',
      0,
      'api_url_missing',
    );
  }
  const token = await getToken();
  if (!token) {
    throw new MemberApiError('Your sign-in session has expired. Sign in again.', 401);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    const message =
      (typeof detail === 'string' ? detail : detail?.error) ??
      payload?.message ??
      `MyGym server returned ${response.status}.`;
    throw new MemberApiError(message, response.status, detail?.code);
  }
  return payload as T;
}

export function memberRequestBody(value: unknown): string {
  return JSON.stringify(value);
}

export function formatMemberApiError(error: unknown): string {
  if (error instanceof MemberApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
