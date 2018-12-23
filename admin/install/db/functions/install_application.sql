CREATE OR REPLACE FUNCTION install_application(p_data json )
  RETURNS json AS
$BODY$ 
DECLARE 
l_out json;
l_message_text text;
l_exception_detail text;
l_exception_hint text;
l_connection_id text;
l_functions_json json;
l_routes_json json;

functions_c CURSOR FOR SELECT json_array_elements(p_data->'functions');
routes_c CURSOR(p_functions json) FOR SELECT json_array_elements(p_functions->'routes');
l_function_record json;
l_db_method text;
l_name text;
l_db_name text;
l_datatype text;
l_arguments text;
l_id uuid;
l_route_name text;
l_route_method text;
l_route_url text;
l_sample_request text;
l_sample_response text;
l_application json;
l_app_id text;
l_app_name text;
l_route_id uuid;
l_function_id uuid;

BEGIN
  SELECT id
  INTO l_connection_id
  FROM connections
  WHERE config_flag = 'Y'
  LIMIT 1;

  IF l_connection_id IS NULL OR l_connection_id = '' THEN
     RETURN '{"status":"E", "message" : "Unable to find default configuration"}';
  END IF;
  
  BEGIN
    l_functions_json :=   (p_data->>'functions')::json;
  EXCEPTION WHEN OTHERS THEN
    RETURN '{"status":"E", "message" : "Invalid json input for functions tag"}';
  END;

  BEGIN
    l_application :=  (p_data->>'application')::json;
  EXCEPTION WHEN OTHERS THEN
    RETURN '{"status":"E", "message" : "Invalid json input for application tag"}';
  END;  
  
  IF l_application IS NULL  THEN
     RETURN '{"status":"E", "message" : "Invalid Application File. Missing Application Info"}';
  END IF;
  
  BEGIN
    l_app_id := (l_application->>'identifier')::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN '{"status":"E", "message" : "Invalid uuid input for application identifier tag"}';
  END;  
  
  l_app_name := (l_application->>'name')::text;
    
  IF l_app_id IS NULL OR l_app_id = '' THEN
     RETURN '{"status" : "E" , "message" : "Invalid Application File. Missing Application Identifier"}';
  END IF;

  IF l_app_name IS NULL OR l_app_name = '' THEN
     RETURN '{"status" : "E" , "message" : "Invalid Application File. Missing Application Name"}';
  END IF;
  
  IF EXISTS ( SELECT 1 FROM applications WHERE id = l_app_id) THEN
     RETURN '{"status" : "E" , "message" : "This Application ['|| l_app_name|| '] is already installed. If you want to re-install please delete record from the table applications for this identifier to re install the application."}'; 
  END IF;
  
  IF l_functions_json IS NULL THEN
      RETURN '{"status" : "S" , "message" : "OK"}';
  END IF;
  
  OPEN functions_c;
 
   LOOP
    -- fetch row into the film
      FETCH functions_c INTO l_function_record;
    -- exit when no more row to fetch
      EXIT WHEN NOT FOUND;
 
      RAISE INFO '%',l_function_record;
      
      l_name := (l_function_record->>'name')::text;
      l_db_method := (l_function_record->>'db_method')::text;
      
      IF l_name IS NULL OR l_name = '' THEN
         RETURN '{"status" : "E" , "message" : "Function Name need to be provided"}';
      END IF;
      
      IF l_db_method IS NULL OR l_db_method = '' THEN
         RETURN '{"status" : "E" , "message" : "Database Function name need to be provided"}';
      END IF;
      
       SELECT  p.proname as name,  
       pg_catalog.pg_get_function_result(p.oid) as result_datatype,  
       pg_catalog.pg_get_function_arguments(p.oid) as arguments  
       INTO l_db_name , l_datatype , l_arguments 
       FROM pg_catalog.pg_proc p  
       LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace  
       WHERE pg_catalog.pg_function_is_visible(p.oid)  
       AND n.nspname <> 'pg_catalog'  
       AND n.nspname <> 'information_schema'   
       AND  LOWER(p.proname) = LOWER(l_db_method);
       
       IF l_db_name IS NULL OR l_db_name = '' THEN
         RETURN '{"status" : "E" , "message" : "Function ' ||l_db_method ||' does not exist"}';
       END IF;
       
       IF LOWER(l_datatype) <> 'json' THEN
          RETURN '{"status" : "E" , "message" : "Function Return Type must be json"}';
       END IF;
       
       IF l_arguments  LIKE '%,%' THEN
          RETURN '{"status" : "E" , "message" : "Function Argument must contain only one argument and the datatype must be json"}';
       END IF;
  
       OPEN routes_c(l_function_record);
 
	   LOOP
	      FETCH routes_c INTO l_routes_json;
	    -- exit when no more row to fetch
	      EXIT WHEN NOT FOUND;
	      
	      l_route_name := l_routes_json->>'name';
	      l_route_url := l_routes_json->>'route_url';
	      l_route_method := l_routes_json->>'route_method';
	      
	      IF l_route_name IS NULL OR l_route_name = '' THEN
	        RETURN '{"status" : "E" , "message" : "Route name must be provided"}';
	      END IF;
	
	      IF l_route_url IS NULL OR l_route_url = '' THEN
	        RETURN '{"status" : "E" , "message" : "Route url must be provided"}';
	      END IF;
	
	      IF l_route_method IS NULL OR l_route_method = '' THEN
	        RETURN '{"status" : "E" , "message" : "Route Method must be provided"}';
	      ELSE
	        IF l_route_method NOT IN ('GET','POST') THEN
	          RETURN '{"status" : "E" , "message" : "Invalid Route Method value. Only GET,POST is supported."}';
	        END IF;
	      END IF;      
	      
	      l_route_id := NULL;
	      
	      SELECT id 
	      INTO l_route_id
	      FROM routes
	      WHERE name = l_route_name;
	      
	      IF l_route_id IS NOT NULL THEN
	         RETURN '{"status" : "E" , "message" : "Route Name alread exist. Please use different route name ['||l_route_name||']"}';
	      END IF;
	      
	      l_route_id := NULL;
	      
	      SELECT id 
	      INTO l_route_id
	      FROM routes
	      WHERE route_method = l_route_method
	      AND route_url = l_route_url;
	      
	      IF l_route_id IS NOT NULL THEN
	         RETURN '{"status" : "E" , "message" : "Route Url and the Route Method alread exist. Please use different route url or route method  ['||l_route_url||','||l_route_method||']"}';
	      END IF;      
	       
	      END LOOP;
	      
	      -- Close the cursor
          CLOSE routes_c; 
                  
   END LOOP;
  
   -- Close the cursor
   CLOSE functions_c;
   
   OPEN functions_c;
 
   LOOP
    -- fetch row into the film
      FETCH functions_c INTO l_function_record;
    -- exit when no more row to fetch
      EXIT WHEN NOT FOUND;
 
      RAISE INFO '%',l_function_record;   
      
      l_function_id := md5(random()::text || clock_timestamp()::text)::uuid; 
      l_name := (l_function_record->>'name')::text;
      l_db_method := (l_function_record->>'db_method')::text;
  
      
      INSERT INTO functions
      ( id
      , name
      , connection_id
      , db_method
      , created
      , updated
      ) VALUES (
        l_function_id
      , l_name
      , l_connection_id
      , l_db_method
      , NOW()
      , NOW()  
      );
      
      OPEN routes_c(l_function_record);
 
	   LOOP
	      FETCH routes_c INTO l_routes_json;
	    -- exit when no more row to fetch
	      EXIT WHEN NOT FOUND;
	      
	   	  l_route_name := l_routes_json->>'name';
	      l_route_url := l_routes_json->>'route_url';
	      l_route_method := l_routes_json->>'route_method';   
	      l_route_id := md5(random()::text || clock_timestamp()::text)::uuid; 
	      l_sample_request := l_routes_json->>'sample_request';
        l_sample_response := l_routes_json->>'sample_response';  

	      INSERT INTO routes
	      ( id
	      , name
	      , function_id
	      , route_method
	      , route_url
	      , enabled_flag
        , sample_request
        , sample_response
	      , created
	      , updated
	      ) VALUES
	      ( 
	        l_route_id
	      , l_route_name
	      , l_function_id  
	      , l_route_method
	      , l_route_url
	      , 'Y'
        , l_sample_request
        , l_sample_response        
	      , NOW()
	      , NOW()
	      );
	   END LOOP;
	      
	      -- Close the cursor
       CLOSE routes_c;      
   
   END LOOP;
  
   -- Close the cursor
   CLOSE functions_c;
   
   INSERT INTO applications
   (
    id
  , name
  , created
  , updated
  ) VALUES (
    l_app_id
  , l_app_name
  , NOW()
  , NOW()  
  );  
   
 
  
  RETURN '{"status" : "S" , "message" : "OK"}';
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                          l_exception_detail = PG_EXCEPTION_DETAIL,
                          l_exception_hint = PG_EXCEPTION_HINT;
  l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
  return l_out;    
END
$BODY$
  LANGUAGE plpgsql; 