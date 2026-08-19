// Hand-written types matching supabase/migrations/0001_initial_schema.sql.
// Regenerate with the Supabase CLI once available for full accuracy:
//   npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts

export type ContentStatus =
  | "draft"
  | "needs_review"
  | "verified"
  | "published"
  | "archived";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      countries: Table<
        { id: number; code: string; name: string },
        { id?: number; code: string; name: string }
      >;
      degree_levels: Table<
        { id: number; name: string },
        { id?: number; name: string }
      >;
      application_platforms: Table<
        { id: number; name: string; country_id: number | null },
        { id?: number; name: string; country_id?: number | null }
      >;
      deadline_types: Table<
        { id: number; name: string },
        { id?: number; name: string }
      >;
      authors: Table<
        {
          id: string;
          name: string;
          bio: string | null;
          credentials: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          bio?: string | null;
          credentials?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
        }
      >;
      universities: Table<
        {
          id: string;
          slug: string;
          name: string;
          country_id: number;
          city: string | null;
          region: string | null;
          institution_type: string | null;
          founded_year: number | null;
          website_url: string | null;
          acceptance_rate: number | null;
          required_tests: string[] | null;
          test_score_range: string | null;
          gpa_requirement: string | null;
          required_documents: string[] | null;
          application_platform_id: number | null;
          tuition_in_state: number | null;
          tuition_out_state: number | null;
          tuition_international: number | null;
          est_cost_of_attendance: number | null;
          popular_majors: string[] | null;
          student_faculty_ratio: string | null;
          distinctive_summary: string | null;
          international_student_notes: string | null;
          status: ContentStatus;
          author_id: string | null;
          reviewed_by_id: string | null;
          last_verified_at: string | null;
          source_urls: string[] | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          slug: string;
          name: string;
          country_id: number;
          city?: string | null;
          region?: string | null;
          institution_type?: string | null;
          founded_year?: number | null;
          website_url?: string | null;
          acceptance_rate?: number | null;
          required_tests?: string[] | null;
          test_score_range?: string | null;
          gpa_requirement?: string | null;
          required_documents?: string[] | null;
          application_platform_id?: number | null;
          tuition_in_state?: number | null;
          tuition_out_state?: number | null;
          tuition_international?: number | null;
          est_cost_of_attendance?: number | null;
          popular_majors?: string[] | null;
          student_faculty_ratio?: string | null;
          distinctive_summary?: string | null;
          international_student_notes?: string | null;
          status?: ContentStatus;
          author_id?: string | null;
          reviewed_by_id?: string | null;
          last_verified_at?: string | null;
          source_urls?: string[] | null;
        }
      >;
      university_degree_levels: Table<
        { university_id: string; degree_level_id: number },
        { university_id: string; degree_level_id: number }
      >;
      ranking_bodies: Table<
        { id: number; name: string; website_url: string | null },
        { id?: number; name: string; website_url?: string | null }
      >;
      rankings: Table<
        {
          id: string;
          university_id: string;
          ranking_body_id: number;
          rank: number;
          category: string | null;
          year: number;
          source_url: string;
          created_at: string;
        },
        {
          id?: string;
          university_id: string;
          ranking_body_id: number;
          rank: number;
          category?: string | null;
          year: number;
          source_url: string;
        }
      >;
      deadlines: Table<
        {
          id: string;
          university_id: string;
          degree_level_id: number;
          deadline_type_id: number;
          deadline_date: string;
          application_platform_id: number | null;
          notes: string | null;
          is_rolling: boolean;
          status: ContentStatus;
          last_verified_at: string | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          university_id: string;
          degree_level_id: number;
          deadline_type_id: number;
          deadline_date: string;
          application_platform_id?: number | null;
          notes?: string | null;
          is_rolling?: boolean;
          status?: ContentStatus;
          last_verified_at?: string | null;
          source_url?: string | null;
        }
      >;
      scholarships: Table<
        {
          id: string;
          name: string;
          scope: string;
          amount: string | null;
          eligibility: string | null;
          deadline_date: string | null;
          country_id: number | null;
          external_url: string | null;
          status: ContentStatus;
          last_verified_at: string | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          scope: string;
          amount?: string | null;
          eligibility?: string | null;
          deadline_date?: string | null;
          country_id?: number | null;
          external_url?: string | null;
          status?: ContentStatus;
          last_verified_at?: string | null;
          source_url?: string | null;
        }
      >;
      scholarship_universities: Table<
        { scholarship_id: string; university_id: string },
        { scholarship_id: string; university_id: string }
      >;
      guides: Table<
        {
          id: string;
          slug: string;
          title: string;
          category: string;
          country_id: number | null;
          content: string;
          excerpt: string | null;
          word_count: number | null;
          author_id: string | null;
          reviewed_by_id: string | null;
          status: ContentStatus;
          last_verified_at: string | null;
          source_urls: string[] | null;
          qa_facts_verified: boolean;
          qa_sentence_variation_checked: boolean;
          qa_firsthand_detail_added: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          category: string;
          country_id?: number | null;
          content: string;
          excerpt?: string | null;
          word_count?: number | null;
          author_id?: string | null;
          reviewed_by_id?: string | null;
          status?: ContentStatus;
          last_verified_at?: string | null;
          source_urls?: string[] | null;
          qa_facts_verified?: boolean;
          qa_sentence_variation_checked?: boolean;
          qa_firsthand_detail_added?: boolean;
        }
      >;
      guide_related_guides: Table<
        { guide_id: string; related_guide_id: string },
        { guide_id: string; related_guide_id: string }
      >;
      guide_related_universities: Table<
        { guide_id: string; related_university_id: string },
        { guide_id: string; related_university_id: string }
      >;
      activity_log: Table<
        {
          id: number;
          author_id: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          detail: string | null;
          created_at: string;
        },
        {
          id?: number;
          author_id?: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          detail?: string | null;
        }
      >;
    };
  };
}
