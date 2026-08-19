// Placeholder data standing in for the `activity_log` table until Supabase
// is provisioned. See supabase/migrations/0001_initial_schema.sql.

export type MockActivity = {
  id: number;
  author: string;
  entityType: "university" | "deadline" | "guide" | "scholarship";
  action: "created" | "updated" | "status_changed";
  detail: string;
  createdAt: string; // ISO datetime
};

export const MOCK_ACTIVITY: MockActivity[] = [
  {
    id: 1,
    author: "Priya Nair",
    entityType: "guide",
    action: "status_changed",
    detail: "Published \"How to write a personal statement…\"",
    createdAt: "2026-08-19T14:32:00Z",
  },
  {
    id: 2,
    author: "Marcus Webb",
    entityType: "deadline",
    action: "updated",
    detail: "Updated University of Toronto — Regular Decision date",
    createdAt: "2026-08-18T09:10:00Z",
  },
  {
    id: 3,
    author: "Priya Nair",
    entityType: "university",
    action: "updated",
    detail: "Verified University of Oxford admissions data",
    createdAt: "2026-08-17T16:45:00Z",
  },
  {
    id: 4,
    author: "Marcus Webb",
    entityType: "scholarship",
    action: "created",
    detail: "Added Australia Awards Scholarship (draft)",
    createdAt: "2026-08-15T11:20:00Z",
  },
  {
    id: 5,
    author: "Priya Nair",
    entityType: "guide",
    action: "created",
    detail: "Started \"US vs UK applications\" draft",
    createdAt: "2026-08-12T08:05:00Z",
  },
];
