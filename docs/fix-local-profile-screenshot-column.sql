alter table users drop column if exists profile_screenshot_url;
alter table users add column profile_screenshot_url text;
update users
set profile_screenshot_url = 'Profile screenshot not uploaded yet'
where profile_screenshot_url is null;
