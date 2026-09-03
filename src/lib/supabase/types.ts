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
        { id: number; code: string; name: string; is_launched: boolean },
        { id?: number; code: string; name: string; is_launched?: boolean }
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
          selectivity_band: string | null;
          selectivity_note: string | null;
          required_tests: string[] | null;
          test_score_range: string | null;
          gpa_requirement: string | null;
          atar_requirement: string | null;
          academic_requirement: string | null;
          academic_requirement_domestic: string | null;
          ielts_overall: number | null;
          ielts_listening: number | null;
          ielts_reading: number | null;
          ielts_writing: number | null;
          ielts_speaking: number | null;
          pte_overall: number | null;
          pte_listening: number | null;
          pte_reading: number | null;
          pte_writing: number | null;
          pte_speaking: number | null;
          required_documents: string[] | null;
          application_platform_id: number | null;
          tuition_in_state: number | null;
          tuition_out_state: number | null;
          tuition_international: number | null;
          tuition_domestic: number | null;
          tuition_domestic_is_csp: boolean | null;
          currency: string;
          apply_url: string | null;
          application_fee: number | null;
          est_cost_of_attendance: number | null;
          popular_majors: string[] | null;
          student_faculty_ratio: string | null;
          distinctive_summary: string | null;
          international_student_notes: string | null;
          who_is_it_for: string | null;
          how_to_apply: string | null;
          living_cost_annual: number | null;
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
          selectivity_band?: string | null;
          selectivity_note?: string | null;
          required_tests?: string[] | null;
          test_score_range?: string | null;
          gpa_requirement?: string | null;
          atar_requirement?: string | null;
          academic_requirement?: string | null;
          academic_requirement_domestic?: string | null;
          ielts_overall?: number | null;
          ielts_listening?: number | null;
          ielts_reading?: number | null;
          ielts_writing?: number | null;
          ielts_speaking?: number | null;
          pte_overall?: number | null;
          pte_listening?: number | null;
          pte_reading?: number | null;
          pte_writing?: number | null;
          pte_speaking?: number | null;
          required_documents?: string[] | null;
          application_platform_id?: number | null;
          tuition_in_state?: number | null;
          tuition_out_state?: number | null;
          tuition_international?: number | null;
          tuition_domestic?: number | null;
          tuition_domestic_is_csp?: boolean | null;
          currency?: string;
          apply_url?: string | null;
          application_fee?: number | null;
          est_cost_of_attendance?: number | null;
          popular_majors?: string[] | null;
          student_faculty_ratio?: string | null;
          distinctive_summary?: string | null;
          international_student_notes?: string | null;
          who_is_it_for?: string | null;
          how_to_apply?: string | null;
          living_cost_annual?: number | null;
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
      programs: Table<
        {
          id: string;
          university_id: string;
          name: string;
          slug: string;
          degree_level_id: number;
          subject_id: number | null;
          duration_years: number | null;
          tuition_international: number | null;
          tuition_domestic: number | null;
          tuition_domestic_is_csp: boolean | null;
          currency: string | null;
          application_url: string | null;
          description: string | null;
          curriculum: string | null;
          admission_requirements: string | null;
          english_requirements: string | null;
          ielts_overall: number | null;
          ielts_listening: number | null;
          ielts_reading: number | null;
          ielts_writing: number | null;
          ielts_speaking: number | null;
          pte_overall: number | null;
          pte_listening: number | null;
          pte_reading: number | null;
          pte_writing: number | null;
          pte_speaking: number | null;
          status: ContentStatus;
          last_verified_at: string | null;
          source_url: string | null;
          /** Generated column (migration 0023): mirrors isProgramIndexable().
           * Read-only — never written. */
          content_indexable: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          university_id: string;
          name: string;
          slug?: string;
          degree_level_id: number;
          subject_id?: number | null;
          duration_years?: number | null;
          tuition_international?: number | null;
          tuition_domestic?: number | null;
          tuition_domestic_is_csp?: boolean | null;
          currency?: string | null;
          application_url?: string | null;
          description?: string | null;
          curriculum?: string | null;
          admission_requirements?: string | null;
          english_requirements?: string | null;
          ielts_overall?: number | null;
          ielts_listening?: number | null;
          ielts_reading?: number | null;
          ielts_writing?: number | null;
          ielts_speaking?: number | null;
          pte_overall?: number | null;
          pte_listening?: number | null;
          pte_reading?: number | null;
          pte_writing?: number | null;
          pte_speaking?: number | null;
          status?: ContentStatus;
          last_verified_at?: string | null;
          source_url?: string | null;
        }
      >;
      subjects: Table<
        { id: number; name: string; slug: string | null },
        { id?: number; name: string; slug?: string | null }
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
          slug: string | null;
          scope: string;
          amount: string | null;
          eligibility: string | null;
          description: string | null;
          study_level: string | null;
          separate_application: boolean | null;
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
          slug?: string | null;
          scope: string;
          amount?: string | null;
          eligibility?: string | null;
          description?: string | null;
          study_level?: string | null;
          separate_application?: boolean | null;
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
          /** Short <title> for search results; falls back to `title`. */
          meta_title: string | null;
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
          meta_title?: string | null;
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
      blog_posts: Table<
        {
          id: string;
          slug: string;
          title: string;
          /** Short <title> for search results; falls back to `title`. */
          meta_title: string | null;
          content: string;
          excerpt: string | null;
          tags: string[] | null;
          word_count: number | null;
          author_id: string | null;
          reviewed_by_id: string | null;
          status: ContentStatus;
          published_at: string | null;
          last_verified_at: string | null;
          source_urls: string[] | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          meta_title?: string | null;
          content: string;
          excerpt?: string | null;
          tags?: string[] | null;
          word_count?: number | null;
          author_id?: string | null;
          reviewed_by_id?: string | null;
          status?: ContentStatus;
          published_at?: string | null;
          last_verified_at?: string | null;
          source_urls?: string[] | null;
        }
      >;
      visa_subclasses: Table<
        {
          id: string;
          slug: string;
          code: string;
          name: string;
          category: string;
          stream: string | null;
          short_description: string | null;
          summary: string | null;
          is_points_tested: boolean;
          min_points: number | null;
          stay_period: string | null;
          leads_to_pr: boolean;
          pr_pathway: string | null;
          base_application_charge: string | null;
          processing_time: string | null;
          age_limit: string | null;
          english_requirement: string | null;
          work_experience_requirement: string | null;
          occupation_list: string | null;
          eligibility: string | null;
          conditions: string | null;
          content: string | null;
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
          code: string;
          name: string;
          category: string;
          stream?: string | null;
          short_description?: string | null;
          summary?: string | null;
          is_points_tested?: boolean;
          min_points?: number | null;
          stay_period?: string | null;
          leads_to_pr?: boolean;
          pr_pathway?: string | null;
          base_application_charge?: string | null;
          processing_time?: string | null;
          age_limit?: string | null;
          english_requirement?: string | null;
          work_experience_requirement?: string | null;
          occupation_list?: string | null;
          eligibility?: string | null;
          conditions?: string | null;
          content?: string | null;
          status?: ContentStatus;
          author_id?: string | null;
          reviewed_by_id?: string | null;
          last_verified_at?: string | null;
          source_urls?: string[] | null;
        }
      >;
      invitation_rounds: Table<
        {
          id: string;
          round_date: string;
          visa_code: string;
          visa_subclass_id: string | null;
          stream: string | null;
          invitations_issued: number | null;
          min_points: number | null;
          occupation_notes: string | null;
          program_year: string | null;
          notes: string | null;
          is_estimated: boolean;
          status: ContentStatus;
          last_verified_at: string | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          round_date: string;
          visa_code: string;
          visa_subclass_id?: string | null;
          stream?: string | null;
          invitations_issued?: number | null;
          min_points?: number | null;
          occupation_notes?: string | null;
          program_year?: string | null;
          notes?: string | null;
          is_estimated?: boolean;
          status?: ContentStatus;
          last_verified_at?: string | null;
          source_url?: string | null;
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
      university_redirects: Table<
        { old_slug: string; new_slug: string; created_at: string },
        { old_slug: string; new_slug: string }
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
