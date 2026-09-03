-- Not every deadline row means the same thing, but until now the UI could not
-- tell them apart. Four universities (Sydney, ANU, UWA, UTS) carry a real
-- closing date checked against their own key-dates page. Around forty-five
-- other institutions carry one of just four generic anchor dates lifted from
-- the INTAKES table in scripts/seed_deadlines.mjs, which the seed is explicit
-- about being a rule of thumb: "roughly three to four months before the
-- intake starts". Rendering that heuristic as a bold date with an UPCOMING
-- passport stamp gives it authority it has not earned, and every one of those
-- universities showing the same date is not credible to a reader.
--
-- date_kind: 'closing_date' = a date the university itself publishes, safe to
--   show to the day and to stamp OPEN/UPCOMING/CLOSED.
--   'recommended' = our own apply-by guidance, shown to the month and marked
--   as guidance rather than stamped.
--
-- The default is 'recommended' on purpose. An unmarked row is guidance, so a
-- row that slips through unset understates its date rather than inventing
-- authority for it.

alter table deadlines
  add column date_kind text not null default 'recommended'
    check (date_kind in ('closing_date', 'recommended'));

comment on column deadlines.date_kind is
  'Whether deadline_date is a university-published closing date or our own recommended apply-by guidance. Set by scripts/seed_deadlines.mjs.';
