-- WJRFIN V9.1
-- Multi-company registration and idempotency security
--
-- Prerequisite:
-- The public.companies table must already exist.
--
-- IMPORTANT:
-- These changes were previously applied manually
-- to the development Supabase database.
-- Do not reapply the complete migration without
-- checking the migration history.

-- 1. Add a unique identifier for company creation requests.
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS creation_request_id uuid;

-- 2. Prevent duplicate creation request identifiers.
CREATE UNIQUE INDEX IF NOT EXISTS
  companies_creation_request_id_unique
ON public.companies (creation_request_id)
WHERE creation_request_id IS NOT NULL;

-- 3. Create company with idempotency protection.
CREATE OR REPLACE FUNCTION public.create_company(
  p_name text,
  p_industry text,
  p_company_size text,
  p_primary_currency text,
  p_creation_request_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_existing_company public.companies%ROWTYPE;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_creation_request_id IS NULL THEN
    RAISE EXCEPTION 'Creation request ID required';
  END IF;

  IF p_name IS NULL
     OR char_length(btrim(p_name)) NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION 'Invalid company name';
  END IF;

  INSERT INTO public.companies (
    name,
    industry,
    company_size,
    primary_currency,
    creation_request_id
  )
  VALUES (
    btrim(p_name),
    p_industry,
    p_company_size,
    p_primary_currency,
    p_creation_request_id
  )
  ON CONFLICT (creation_request_id)
    WHERE creation_request_id IS NOT NULL
  DO NOTHING
  RETURNING id INTO v_company_id;

  IF v_company_id IS NOT NULL THEN
    INSERT INTO public.company_members (
      company_id,
      user_id,
      role
    )
    VALUES (
      v_company_id,
      v_user_id,
      'owner'
    );

    RETURN v_company_id;
  END IF;

  SELECT c.*
  INTO v_existing_company
  FROM public.companies c
  WHERE c.creation_request_id = p_creation_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unable to resolve creation request';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = v_existing_company.id
      AND cm.user_id = v_user_id
      AND cm.role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Creation request ID already in use';
  END IF;

  IF v_existing_company.name IS DISTINCT FROM btrim(p_name)
     OR v_existing_company.industry IS DISTINCT FROM p_industry
     OR v_existing_company.company_size IS DISTINCT FROM p_company_size
     OR v_existing_company.primary_currency IS DISTINCT FROM p_primary_currency
  THEN
    RAISE EXCEPTION 'Creation request data mismatch';
  END IF;

  RETURN v_existing_company.id;
END;
$function$;

-- 4. Restrict function execution to authenticated users.
REVOKE EXECUTE ON FUNCTION public.create_company(
  text, text, text, text, uuid
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_company(
  text, text, text, text, uuid
) TO authenticated;

-- 5. Remove the obsolete four-argument function.
DROP FUNCTION IF EXISTS public.create_company(
  text, text, text, text
);
