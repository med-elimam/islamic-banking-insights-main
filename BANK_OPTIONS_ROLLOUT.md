# Bank option correction

Replace BPM with ABM and SGM with BII in Arabic, French and English survey options and admin filters.

Apply the replace_bank_options migration to Supabase project tizzikonuyvxnrbwxcjh before deploying this commit. The migration updates existing response bank codes, the bank constraint, insert policy, and survey submission validation together. Older open browser tabs remain supported through RPC normalization. No response or answer is deleted.

Verify both new banks can submit a complete questionnaire, existing response counts remain unchanged, and the admin filters and exports use the corrected codes. Production migration and submission checks are pending access to this Supabase project.
