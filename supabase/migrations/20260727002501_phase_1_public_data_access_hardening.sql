-- Phase 1 keeps the existing base-table access unchanged so the deployed
-- frontend remains compatible while the public read endpoints are introduced.

CREATE VIEW "public"."public_professional_directory" (
    "id",
    "name",
    "phone",
    "city",
    "skills",
    "availability",
    "experience",
    "created_at"
)
WITH ("security_invoker" = true)
AS
SELECT
    "professional_profiles"."id",
    "professional_profiles"."name",
    "professional_profiles"."phone",
    "professional_profiles"."city",
    "professional_profiles"."skills",
    "professional_profiles"."availability",
    "professional_profiles"."experience",
    "professional_profiles"."created_at"
FROM "public"."professional_profiles";

ALTER VIEW "public"."public_professional_directory" OWNER TO "postgres";

COMMENT ON VIEW "public"."public_professional_directory" IS
    'Projeção pública restrita para busca de profissionais no MVP, incluindo o contato intencional por WhatsApp.';

REVOKE ALL PRIVILEGES ON TABLE "public"."public_professional_directory"
    FROM PUBLIC, "anon", "authenticated", "service_role";
GRANT SELECT ON TABLE "public"."public_professional_directory"
    TO "anon", "authenticated";

CREATE VIEW "public"."public_job_board" (
    "id",
    "company_id",
    "title",
    "city",
    "skill",
    "deadline",
    "description",
    "created_at",
    "company_name",
    "company_phone"
)
WITH ("security_invoker" = true)
AS
SELECT
    "jobs"."id",
    "jobs"."company_id",
    "jobs"."title",
    "jobs"."city",
    "jobs"."skill",
    "jobs"."deadline",
    "jobs"."description",
    "jobs"."created_at",
    "company_profiles"."name" AS "company_name",
    "company_profiles"."phone" AS "company_phone"
FROM "public"."jobs"
LEFT JOIN "public"."company_profiles"
    ON "company_profiles"."id" = "jobs"."company_id";

ALTER VIEW "public"."public_job_board" OWNER TO "postgres";

COMMENT ON VIEW "public"."public_job_board" IS
    'Projeção pública restrita para consulta de vagas no MVP, incluindo o contato intencional da empresa por WhatsApp.';

REVOKE ALL PRIVILEGES ON TABLE "public"."public_job_board"
    FROM PUBLIC, "anon", "authenticated", "service_role";
GRANT SELECT ON TABLE "public"."public_job_board"
    TO "anon", "authenticated";
