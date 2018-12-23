CREATE OR REPLACE FUNCTION validate_session( p_token text
    )
  RETURNS json AS
$BODY$ 
DECLARE 
l_out json;
l_token text;
l_expire_time timestamp; 
l_user_id text;
l_enabled_flag text;
l_start_time timestamp;
text_var1 text;
text_var2 text;
text_var3 text;
l_detail text;
  BEGIN
  l_token := p_token;
  
if (l_token IS NULL OR l_token = '' ) THEN
l_out := '{ "status" : "E" , "message" : "SESSION_BAD_INPUT" }';
   RETURN l_out;

END IF;

RAISE INFO '1 ' ;

SELECT start_time , timeout_time , user_id
INTO l_start_time , l_expire_time , l_user_id
FROM tokens
WHERE token = l_token;

IF l_start_time IS NULL THEN
 l_out := '{ "status" : "E" ,   "message" : "SESSION_INVALID" }';
 RETURN l_out;
END IF;


IF l_expire_time < now() THEN
  l_out := '{ "status" : "E" ,   "message" : "SESSION_EXPIRED" }';
 RETURN l_out;

END IF;



SELECT enabled_flag 
INTO l_enabled_flag
FROM USERS
WHERE id = l_user_id;

IF l_enabled_flag IS NULL OR l_enabled_flag = 'N' THEN
   l_out := '{ "status" : "E" ,   "message" : "INVALID_USER" }';
 RETURN l_out;

END IF;


UPDATE tokens
SET timeout_time = NOW() + interval '1h' * 1
, updated = NOW()
WHERE token = l_token;
 
    l_out := '{ "status" : "SUCCESS" ,  "message" : "OK"}';
return l_out;  
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS text_var1 = MESSAGE_TEXT,
                          text_var2 = PG_EXCEPTION_DETAIL,
                          text_var3 = PG_EXCEPTION_HINT;
    l_out := '{ "status" : "ERROR" , "message" : "' || REPLACE(text_var1, '"', E'\\"') || '" }';
  return l_out;  
END
$BODY$
  LANGUAGE plpgsql;