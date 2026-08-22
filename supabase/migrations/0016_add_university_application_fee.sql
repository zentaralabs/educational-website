-- Application fee is a university-wide policy (same fee regardless of
-- which program you apply to), so it lives on universities rather than
-- programs — same reasoning as apply_url, which programs already fall
-- back to.

alter table universities add column application_fee numeric;

comment on column universities.application_fee is
  'Non-refundable fee charged per application, in the university''s `currency`. Same for all programs at this university.';
