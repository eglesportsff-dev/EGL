-- Run this once in pgAdmin / Query Tool for your local esports_tournament database.
-- It fixes old databases where master QR images were created as varchar(255).

alter table master_controllers
    alter column qr_code_url type text;
