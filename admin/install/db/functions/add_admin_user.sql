CREATE OR REPLACE FUNCTION add_admin_user( p_id text , p_hash text , p_password text)
  RETURNS json AS
$BODY$ 
DECLARE 
l_out json;
l_id text;
 BEGIN
  SELECT id
  INTO l_id
  FROM USERS
  WHERE username = 'admin';
  IF l_id IS NULL OR l_id = '' THEN
     INSERT INTO USERS
     ( id 
, username 
, password 
, enabled_flag
, created 
, updated
     )
     VALUES (
       p_id
    , 'admin'
    , p_password
    , 'Y'
    , now()
    , now()   
     );
  END IF;
  RETURN '{"status" : "SUCCESS" , "message" : "OK"}';
END
$BODY$
  LANGUAGE plpgsql;