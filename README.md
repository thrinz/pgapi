# pgAPI - Database as a service

pgAPI is a "Database as a service" application that automatically creates the REST API endpoint for the given URL. The endpoint is designed to call a Postgres Database Function which is configured at the time of API endpoint creation. This application automates the URL routing while the developers must have to just focus on the database method creation. No Coding is required.

## Installation
***
### Using Docker

#### Prerequisites
* Must have  docker installed. https://docs.docker.com/install/
* Must have cURL installed or any other REST API Client like Postman 
#### Start the Postgres Container

> $ docker run --name postgres -p 5430:5432 -e   POSTGRES_DATABASE=pgapi -e POSTGRES_USER=pgapi -e POSTGRES_PASSWORD=pgapi -e POSTGRES_ROOT_PASSWORD=postgres -d postgres

#### Start the pgAPI Container 
> $ docker run --name pgapi --link postgres:postgres -p 5001:3000 -e PG_USER=pgapi -e PG_HOST=postgres -e PG_PASSWORD=pgapi -e PG_DATABASE=pgapi  -e PG_PORT=5432  pgapi


> Open the link in the Browser. http://localhost:5001/admin \
> **username**: admin\
> **password**: admin


### Using GIT
#### Prerequisites
* Must have node installed. https://nodejs.org/en/download/
* Must have cURL installed or any other REST API Client like Postman 
* Must have Postgres Database installed. You can install Postgres 
  * Locally - https://www.postgresql.org/download/
  * Subscription on AWS Cloud  - https://aws.amazon.com/rds/postgresql/
  * Subscription on Azure  Cloud - https://azure.microsoft.com/en-us/services/postgresql/
  * Subscription on GCP - https://cloud.google.com/sql/docs/postgres/quickstart
#### Start the Application
> $ git clone https://github.com/thrinz/pgapi-starter-template \
> $ cd pgapi-starter-template\
> $ vi config.env from the terminal (linux or Mac) or open the config.env in a text editor. Modify the config.env file with the postgres database Information\
> &nbsp;&nbsp;&nbsp;&nbsp;	**DB_HOST**=Postgres Hostname\
> &nbsp;&nbsp;&nbsp;&nbsp;	**DB_USER**=Postgres username\
> &nbsp;&nbsp;&nbsp;&nbsp;	**DB_PASSWORD**=Postgres Database Password\
> &nbsp;&nbsp;&nbsp;&nbsp;	**DB_NAME**=Postgres Database Name\
> &nbsp;&nbsp;&nbsp;&nbsp;	**DB_PORT**=Port Number\
> $ npm install\
> $ node index.js\
> &nbsp;&nbsp;&nbsp;&nbsp;The console must display log of the server to be running on port 5001\
> &nbsp;&nbsp;&nbsp;&nbsp;Open the link in the Browser. http://localhost:5001/admin \
> **username**: admin\
**password**: admin



### Login to the Admin Portal

Open the link in the Browser. http://localhost:5001/admin \
**username**: admin\
**password**: admin

![alt text](https://lh3.googleusercontent.com/4aADPnQuVzg48nFq6ugS304gpk2kdUZUn77qWN-5JnsiZMUUkYBIX8aJvz6j_Cn-BdYOX2g1d7QPp7n-ZT3aMI6LgwdoAZscX5MNll2gk2jYQfTdzo-dEKiZBy87WIxYKU446O9JDlhX8LQ8QzTf0nXPAySceUO0qUhO_6mW-sNhVDoyQCjwtxD7TPFtb62lerhtjcWiPCvq4AJx6SfBXv9KT14A6oyz6VXil5PRWtY90V3l7IgQ2njitRTeSiCM-r_AmZy7JP8hoUaKTnstGvViIZXW18pwvSI-2XElF2MtHB_18bZmMNMohtp8jA-56M4h7AOn01Q3KdKuigV_NX1SPhiGM1gJJb7NBYAfsDN7-0qhk_9_w0qqn6IfRy3xagK9nDc_f0UhP7IR_Vy7nslI0BZudULhzbgoMFfv5-rNa71ljyX6TINl8Q5XypshMKrZLKpNFMWCOIAGRjFXHa8y7Tq6CM1nhLCseSK7XO5MDIzCgPAE8yHVbNRf4tHLOEi9zT2Rago99BexJG3mCOLmkeb4APz4xGd1Ub7xrEdUbC8-qK3cs6mmD0u4dILScvMLIkUEac-Z2uOruX_IPKsUC2PWf6aZ43re6spDl3wzUP7hSeof3QaCaMEiY8ZuacsDOTarVV6wtvba8gyAnewJbR3Y7cS3DDnuR4QHmgmDuWbinpAYYVkvAZcNS_qtgigMxFM5ufuygn09WQ=w1514-h896-no)

## Getting Started
### Step 1: Create a Database Connection
You must already have a “default-connection” Connection entry. This connection can be used for the next steps. However, if you decide to use a different database connection, then follow the below instructions
* Navigate to the Connection menu
![alt text](https://lh3.googleusercontent.com/X5dY6gQh9-ml8KR_cqnGwCUtDLm6HTkd_SFJB6i4TvCDGec_6dXOiIu7Lyo8TJk41cGUqioAdVvlO8y6BvMIk7H88RFOonjGE-CdXs6ezZLzpZCVpMKZcViJUrnWPPNEUPPbxqWlpyn9jyciWoc7AtCOJGTbIMkxldBWIWvyozm9NKY8IejZ3WK6eZBrOiOMZieEWDNi1HDspPTF6p-RMgWfbsOXZMQYcGQ00stO1DdGOIQXqfj_X2Ul4Pzz-7Oi-5bpLSVfTz2imASCLas_mXgD4PlsEqbHoWsZP8O8e-WxOtBETdgR6IPT-Z2tD-Uvip_e-7FwVQTXHtBzg8zw_cvna72lUSfAn5xlCg2tpnikw_v7NTpQGB12J_FynudUVg3JD3Em8PfWKJ91gorvsV9hCpDkMaWJdf2p_SuC9xAUX5lh6Q6YhsE2jDMk9HiG6kmLiNVEu6bjm6ft2EpcJZwTABiFWAJlZZJlsyTULMNcjwBp4yLNuKfcE7SRgvCT_afuqAi7ewekmCpoJ8AdeOe_b15BdWKwVyrBZerjblU1ZM3IzCzjcyTwzlI_5etMjq_OcXjn-BtfVIcFTt1oKhwuyIyD0EgdAacnvr__vprdL8jLzQeJY0iMvLz_fqpNx6RRayPzwQz78Frwuje1JuZ_sjgXmsGzhDe5qJe7WEyUq7OIFiMIXLUurhOmfp7i-fNcnEOTzJrrNx31mA=w2560-h1036-no)
* Click on the + icon, a popup will appear
![alt text](https://lh3.googleusercontent.com/JpLgaVkIsTxRWlvDgQpEXTfo52WJed3lGtuF9TKlMMwkA3smE0yYAXZGrrInYnvzKu2J_C7mvHEwBnSTvNHIPSyz1R6xPnBz_4M8IiDd8EzSD8zJh7c98TPa7Bpf8pzTwxThNx4-AXYW9TrU4MqqpBa6eSlG_WiGEM6uGPdy90cr0UfZY_9Jf-cZk4lhfF3rWR6VmucQYHUdU-iqPIR7oH6jDPMn-7ffrNBaSZ7vqOnFWFeoplHYsKofaL684AGeO2XvQtP0uy2Ul2G7knzpsbYlmLt06D4qSRUxP6-lfCCyUH_-JU8XLHNOOpgom_8Dxbc-zUyRlwHIG4z5IkJcYl-a5CuMOiz2EhCfMK3uXQVFi3mUIOKSxIdO3PZsXJi7a44OXQv9ZBHNZ1JHZjjg7heq-zB8V_fJk488hUQFDJatkrfe7dAPy3RWUT6vxNNXOW2CZSv82NqD3N0zbcTeq7Tv_NmmtXkHtE7PqE4gYfTg_thtr9uwmBfq1uvb4zzAdZZht-_jbTUeNkYYPULOW1SpnUAhFmyHS_D87xY3R7JsaJNNIze4-tpJ5VRrVuHqMJVTDbzbV3eC3cPC3ixDGFUUeCuMa_-UhpW8ceKOMsNVXK5vmdoxdZY-CJ9czhvldroui4wfV8dm-ODk0CWWuWKhv8doaI-D5fO2mES8mqp3k5wFAZPp8Lu-P73qPETi39jjHVgqbA682IyFtg=w2560-h856-no)
![alt text](https://lh3.googleusercontent.com/QmEib9bQjwUrfzNWmMhguwQ7sNwtQtjwu264eZqotg7XNAxBlsDARFOr37DAUIfympnrU6NCXt1_UkLQh_P_yQNH2irs0ukrmtFQHWFUVTxl8ZBljzgxIYhw7x_9yod70WV7xRk19axS-UFtb6rC7QgJ4ocl8m8tA6-AAA9IF_vkR5mjLz23jDmXfwhAFvOsM5yZulcuwRgk8cbpbxHsS0ChX_NRR9WZM--Max5vBBxd_xllCISy35O-qOmAgXSyX0fRP43KgSyGIrq2pNRsWAZx-Rgm6dXzGmQZgaIZXH9ETewNeluXghpufcO4xUYcqYe6DCJLRUX6WXHTF2nqRj518GyVMx8aK7u7dkoQd9KNWTheeqaRThwZYI1qsZczzxH745vEy6SvWWB0AAKgUXcy-jVfbc2NCwFdNF0kMpf9HyR6-Rli4cbhyQniR5hKYBOHjqQFKgnt9rWMQ66jj8aIj-VofaoTUesbfTgr4_0AvaxrHsab-Nx6g3RcUmrjQdYo_gv00xnfVZ2DB5TfWdGRI38UyBDnUQNq4_QD2LLM4JWrdWALSbpwNUyAylIPgWFG7xF8fuEMIQwIvH7E-ou52jyTTGlFUbH0FsQl6fSiRQbbG3wrV_ybjjkydGqT7DOQ4ESHH5BBqkTXHLhD9-CNxBggpcGOUvmOwKx2P1y5ggZSjr7InRsS7-WkhInt4PGRVCcrwHIZJgjHSw=w1932-h1224-no)
* Fill the connection postgres connection information. If you do not have database connection then you can obtain the database connection by
  * Installing Postgres locally - https://www.postgresql.org/download/
  * Subscription on AWS Cloud  - https://aws.amazon.com/rds/postgresql/
  * Subscription on Azure  Cloud - https://azure.microsoft.com/en-us/services/postgresql/
  * Subscription on GCP - https://cloud.google.com/sql/docs/postgres/quickstart
* Click on Save. This action will validate the database connection information for connectivity. If there is an issue with connecting to the postgres database, you will see an error message. Otherwise you will see the new connection entry added.
![alt text](https://lh3.googleusercontent.com/pFpP2Sx4Y3RhsvIghqvuyKqndF3i_wWiOcieiYk5Y3e1cNIH4eddmXkMj_DjRYWgQEdKyQLY1CQsswD5uw7WttDboBtzgjlVnfaharwxWv5IBwxHZm2aurXftsSuRv3QQYhO06W2W9rVe_Zg3JwdJOFaQa-wKluN27NBcXoTz0W7KdRk7Oh4_snvMkt84I9oaxCVrUxWP1dIw1-bnO4wf7_PblHsMjowAuWLqewMe7TO5p69Y1ShE8BwtASFQ__ruv2c8fz65_sB3yN4iWyKY7doiebDB6EWx0Nm_9eg-Jjtb6-owVLfFCznXVtB3cCGumzk__5X6gKpfRmMfOOK-tLe9XXWTgp0Gio34J_HhZ6u7m6LtmLUzaoozrpcTNW_BUp5i-znacZ4LvJZ2WeqfMtQhKpE-mV5nt6lRVBiPgtwYRQeu7goN7FdlbmaaNIUlmJg5oUu8KZWbJQ5_Q94yhbCii1i5rhzkiifUjJCQtPBMnPwEklS_lfScTpnaBbUnE-jTC_EhSa3cKGUmFhwegNvqqY8OrfOvGPqjIWw8cA-0y7zyLXx3FcfLBw-6FO23d04n1cVG_-frBfD6g1Lo8gAGic-_QCdD65fo4Q7gdkR7fmk8z8z_l2k6Ayr08cxjiI6G3cVsp3Mym14DF3nwHuFMJWm3CsARFo1y_rpBTJrDdyyW4t7KxsVWduy2FyimkdwqejSSLbJlcwcDA=w2560-h842-no)

### Step 2: Create a Database Function
This step is not performed in this application. You would need a database client like pgAdmin to start developing the database function
> Note : the database function must have only one input parameter with datatype JSON and the return type must be a JSON datatype . See sample database function.

**Sample Database Function**
```sql
CREATE OR REPLACE FUNCTION create_task ( p_data json)
  RETURNS json AS
$BODY$ 
DECLARE 
  l_out json;
  l_message_text text;
  l_exception_detail text;
  l_exception_hint text;
  -- 
  l_id uuid;
  l_name text;
  l_description text;
  l_start_date timestamp;
  l_due_date timestamp;
  l_priority integer;
  
BEGIN
  l_id := md5(random()::text || clock_timestamp()::text)::uuid; 
  l_name := (p_data->>'name')::text;
  l_description := (p_data->>'description')::text;
  l_start_date := NOW();
  l_due_date := (p_data->>'due_date')::timestamp;
  l_priority := (p_data->>'priority')::integer;
  
  INSERT INTO tasks
  (
   id,
   name,
   description,
   start_date,
   due_date,
   priority,
   created,
   updated
   )
   VALUES
   (
   l_id,
   l_name,
   l_description,
   l_start_date,
   l_due_date,
   l_priority,
   NOW(),
   NOW()
   );
  
  l_out :=  '{"status" : "S" , "message" : "OK" , "id" : "' || l_id || '"}';
  RETURN l_out;
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                          l_exception_detail = PG_EXCEPTION_DETAIL,
                          l_exception_hint = PG_EXCEPTION_HINT;
  l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
  return l_out;  
END
$BODY$
  LANGUAGE plpgsql;
```

### Step 3: Create a Function

* Navigate to the Functions menu
![alt text](https://lh3.googleusercontent.com/MKMtu83DmToeQsrMXwr4KnvOD86tawMtAi91VX8tG_F68N_z9rd6gqVY6mHPZVcZ5YkCSda2xdSjku1EtRvEHcVZ1b1dCDKkOzN1WCVxUBsbHJmAOBUCyDbNQY3DgG7th2hf8XHK8JtFVdrYz2_wzz8njYlK7LDoNmqUXTDY2MQXrvDyXmKUc5M-MnHnaRjhgRmm7DIVwZArW3Z0ErOjPaU8pCVIgqmnK2es8OjmHTmqn1lI5VKAH8oUZuM_zoYNKJuzWn0_svatvywYQ2OflA94lCrOZ9XrdmH3kKxmYPil_L4QHw5lu_ckXIpt0OmIsXjM0d8OfsxbTaoCnEwCWvileZPuRgKTBueAgs-AWX8fvSJuDjqUnl1k1tRZdB6BzcCFDGZP5CgnMm4DTFIyXgA62ntEGpSJYXownB1PgjlvjhdoGgaBQMSGVhOZIqAGvBV5kTiNXdQVCRnIWUALLGPjh8hIaBDxTKuuFcHhM3HUQtEWrCWe8Yv4vVtrKWUf2Efut1YP7fRwVJGEuEdyWGWjBq1fG-PG32UewYuAwaboZSXCBJg5LRK2mJaRt-d7c5zmaBZGAnj5r2tyKaWYRe1Waly6t_q1RMr4jWxUm38Jo1LCsUOfrNR3gY03rnIIyMyzCnH7Xy-0GBhYfJyx7Yp74j1jtcnGhro5_C9ADnU7X1bwhSz6Q-uSQdwzdHnvJ7lJOrIDJynB18yglg=w2560-h872-no)
* Click on the + icon, a popup will appear
![alt text](https://lh3.googleusercontent.com/5K4mFgofU9Z_pqB3VXy766i8XCkoTAshd-bna5u-752dXm0aeMUy63o3iXJo268W-ntG9AEcodhZwHlg_AigkltDc2130PebtPP8qRbv_qo8jnxbgwm_EiXlMNUhC7J1fqlN_kImcVvDXWUT_CQQ_vn4ev2kVfGlYZCsOZ6ag_uTwzkLmjnObuOpwHzfUy4b9pYWyjjCWgQSEnIuJNgznYqxXFREDZFKjmczmbtDxVQ3JYZJxgyNUm0shv2GRtFg2nhAM9mCIlzjACnrBYo-3rxWmuZgupVhJWmUlDROYeUL6IGeZPyY03aucW58lIKQ3E-3rm_Du01r_AMUNwBvy3tTDPnepLFVfTgTaTB5hCRqsXlMnU4bQaiW6J59ZV_-LSMWKN3F6Hy6U-4PnA4tAG5nZUCpofTADXiTJe7sDaSsjGDAWrS_EKsAB_Ijz0ImqiUDA10FjIDKZ4afHO2RsxnVOhulkewvyoo8ENKX589oWw60q0ubDlFbnadUGqrP30Kcot2pGOj-WlglLY03uR5N-8CNBTT9HDRJg0JL-uwvME-jmvvjnvqCLfVwFk0Vwd_jEO_GVLrjZMQe2H7EOjhaaeP0zkEZzR7aHHMTsozjDZX625rf_772j4ccDa81MkbpU73txr-RJPz_BY_PNosPM487K3VNM2DgweGrlb-ByJeI2FMs95Rs-DKYR0TgGVaLHBE2W7Xp1vOaUw=w2560-h728-no)
![alt text](https://lh3.googleusercontent.com/uuyeU8A753CzXVKPBqylnG9lFqNU2Pm_lqQQiGx5FFUIhQvxeGx9wP9EWfyF6tHnfvJx8x-3emOfPB06d4_nozLyz_lRR2XpKt-3arC4BXr4NqeN-uxHpTEmQf0TEhE79WKwlOD2pjBqcbr79GAwun6zSbVNf0b0EXTSy6bjZnI_XF6yKnI-8lCIBm8llZExU-FGPeWEVvHCSpCgujAwoden7jemhbuepHG8xZvLhYhlUFtsz7RQ55CFOdjQVxtIkZWSf8K2IneS8eDA3GUwdoLx34DLdc1NXhBCx95uQ9c_LBOlmF1o1359w9SRM5CEbmwVlAMwexr7moVLPCMzgkWTP59P756EVVjtZYk_fulSExqrcFsaTMAAennvLaMwEDCHxj4HIFmVJR3mzVpKf1MBpScsRnsa4ve56IPYKBMwU_X_TFl1euvCrljGfUZNSHKkvdW1BTLZm42Adthl5B0CvJiFsI8Ed4w1wpr9blQ5E92VO_5WSrsA4gCo_7nqrGW21KWCLE3X5BZypBGEYDKOr2SIKohWNnqHL_MLmFiN7HqKY55lwBfoQC4OpE3c4nzM4l3m8OBJYTv19hztWafyVlHvsPjvlErIYbYosG56GVl-1BFIpYnPY8BKAgpFCGIH9ZcOwWY1aVQ2q25meQfih6ltSKApU3aKV7kvqaj-EBO1fOeJNHYb0Po8apJccF1PEDQbo99cYtdgBg=w2300-h1224-no)
* Fill the Function information
  * **Function Name** - Unique name 
  * **Connection Name** - Dropdown with the list of Connections created in Step 1
  * **DB Method** - Database Function created in Step 2
* Click on Save. This action will validate the DB Method. If there is an issue with validation then the error message will appear as a popup. Otherwise a new function entry is added
![alt text](https://lh3.googleusercontent.com/BMd4FozovY7fteEl1_bZICTAYkn1Fh03L0V6vlIyozHKWO4U1JEQmIb-W0J9j497Pu-zRm6_g9Vqi9IS6gbwjMlntCxoHX5hbGLMr5SlwJ2TG5BOG9TXFItnrFtU4i9gYqviq2YgxwWTaMZeABtsEVpx9AF4aWagWuefWeAgLXtxlRwgt9sCk0HcVT96720C3s7qxmi-MHGTgb0oKdxNpmT429t4MEpLCJTcKu45Ut2Tp8xH72LuHvSt1DyfBqVboeA_5WFG3q-4rJ4mpE5ulSQpu2T79wolT9JPCpndTcGU14OZyfQc_Bcjj8lk13rur1AT5sf4eTtpx1gF2WgI70nqqu_JCHhWWVLV_FqWXvyw1PgcZN0C9zBxKckAKz_kNlx_whtSd0gdQhuoZms7NedH4S5lXeesYsjQC6OuNOTtOMsrZxdAkxIXz1yzD6O5HjrFoL8Wipi9G8ugT_PORBeysY6m0sZ6mfLsTBbxLeyvPdpLiGv1MAuGBZ7GZW3NKCi7GLpOPuzcDvfRnA4FHXU1s58Bw1QGCJNM_bb1anHhMZaE9JzD4MzY-YRrxHjqUvzTJoXv7G4cSddwF2SuPPhB9U3ZUyZiqdKsCBovmnf1Qz4HBddfFb5uuIcHAsM0jvF4Py0HapkYSVHEyw2gvaKwJ-oOU6fUS5iAkh7btH1F-bJ0Qxxg_fsb2h5MSmueJ4pMqupYbdkb_i5O5w=w2560-h788-no)
### Step 4: Create a Route
* Navigate to the Routes menu
![alt text](https://lh3.googleusercontent.com/juiJ-koZSmYm9Lv07jgaMvu-iHTOJHCOoH0KTPaAPUF75JX2eySuJ1xTf8HMggAhcVwKCq2KCTUKPRkrhpIQNmtQq-cTnQymz62BDWF9N0Ch7iZJA5Ka8qBMtYh5DSD-e-gx9fLp2OthQBsegXIXVW5SULs9ZLREVEAHLSqW4ENs_C2zcPAjWvBOC4TFxG6wWCU-p7H5e7XxtsmSC2H_3pCVlTQQEBKYAUAG0YY5fMGGEItkYJjNSncCGTDlvdtNjb9nqJzaMBalk79qNOTIcFI1qpuM5rtzJ2fROyXf-udxUwBaY-hhemh49no8bp5nnXJRMYGzCYIWAxsnRJA3pme-FTZksRiks3kUXTBKr4ti8H87mbj3qoTapod3oSJgdZ4SfOGFwZVMH2xhAU8TaTGVZjj1D45iHXEYkUA2eMjmIl-Ehevuqo_4kD6dSbe0jWar3GJ8B3Lhwxe0-tpMFgmNNguWCVZDsBc0OWUXYxbnGAoD6dI4m6uprEh2FDULKBGZjtrGEOBPbK8vzRqd2Q9BjVGAkjhkGxCkSZmBwM8JO-JNnFsl9rL_xw0d6Qv5IIf4q2BkdCXsKpO0A69EyEMvv9tS6ZeoHapJS2kW2vx5lRlGJRRvVbBZn13WUX0aqQ7DHUI7mXgA3gVkO0479SUqzrcqE-RitVkkGbtlh73ilsXwq7ZjDHPX8ezRSlT5mvgh--ULYIpMYDNJnQ=w2556-h742-no)
* Click on the + icon, a popup will appear
![alt text](https://lh3.googleusercontent.com/xAfxXQ1l_TacnZ8Izy4dJmTGYWBCUtFPmORtWpHHgVX31NN10fGEKp0iN-KZmabL4eYlR5vH9yx4WRlMTE1_mXbqMI8jPkhDMgWAcPap5gtbrDcvwNJWvUKUIeIurNgfPJo0y3SBMAy928XOOPVHpvfcFdzLyPocPLaO9QyDMiN5ikl1UawnO2LttF0YHyhWIHqguPDPTAM9zCxldORsgCnAe7jjehvo9fVjf3CYcO47jqAZi6djhdxQhBLz0JihVI91Fjv3v_aUrOYsEGI5JDlq97QTKcQH6W3sRGiR1I_q50_yjffVxNRHAkhR2FvfFz_fU-N3fJmqG0cPwYNwoZ87asXSSm3oBrgHmnOo3v-XR9MkKshRJie8zqWfAR1FJzX_5kPAtLNVjtk1vX0l1txXDPvod8osJXQtefcOFxxL_fiT24LRtxKntFCblJQSVeckyQNpsxHqLdenFAo4ZpKv506QEAtkS1xZ9u-QHcRdP_4ux3MF3rIjSwOa7uqWBJtPv1YOXk1-GOieCmhoSP2aiJwHkA37x10AuI5Ygn_MoQc7nZw9hV_dXtr7vEmgX_cCx2DkAswb0bq164KiqPDSJdXdPY--ua_xjpkiuGwuMVXFeBT6AczADPaCUdLWtwc5Xwodx6nyCQpwy5JdzSbh=w2558-h744-no)
![alt text](https://lh3.googleusercontent.com/S6bk9v0b1FrmlVsN9SzFAVIq0KQX8u4vAKYfsb0FpK_zNvVkpYlNfXWM7lg5EsuzBK5RYKV7Tlai-lwOcV-NXwIL3gcjbtSMVXHMON5rTvbl8UmRCKXphvAfLKaxO_PJPbXYhDgAqoeYQyP0Eg1emMFCTM5V6-uLirKDFhIvgqI9MdWLbwBoH_A0x7JVsDSIxnufpbA8OEVL5DCFN6bVKSnVT_v5_ebkq-vgsVJwiAjNmySoQl5g1Qo8csZZ5O60UPQSSn9ihsSk84abZhsqMZ9-EdMkTf9NhtZ_5exJlKwGvYz8cYJl7L8EKzuQ9G4Gm63qBrGdJtxFay6HIkV5gsgUopUxX_ROjcAF3GBS7E8eAbB5j4n489HmhYv2liqu3h6AiCgIpAYtsMQjjcCqYMOvC7c17GwhYvMpjuOe0nTmgrQ787ZsFzhQ4nuCPfYMRORpFB32yxdMCZZ6QZknfoECdwpPucfnIQbzbBSjAabkqI9wTlPiP6pnQY6EFZTXYaFmC37YvR-GDqTb5-GE2N2vwOq2ln1CMp6rg6SS87m2gRdoGt0klo_FoIEuZoQyIWeMWia7wTgiyz17tthEhSJvGBF69UufpOyPtlLxVflwJjFOv2sf7Ffc46g2oEFx3w2T5-vyYUIG35zLd37__8wU3_pzEHybVYNlaD7XWtdiW8YuxcCly4nXUruAwXg3SwfJH1ve_wMj10XDIA=w1986-h1224-no)
* Fill the Routes information
  * **Route Name** - Unique Route Name
  * **Description** - Description of the route
  * **Route Method** - URL Route Method [GET,POST]
  * **Route URL** - Route URL [Ex. /api/tasks , /api/tasks/:id]
  * **Function Name** - Name of the function created in Step 3
  * **Sample Request (tab)(optional)** - Sample input JSON value
  * **Sample Response (tab)(optional)** - Sample response expected in JSON
* Click on Save. This action will validate the input values to the route form. If there is an issue with validation then the error message will appear as a popup. Otherwise a new route entry is added.
![alt text](https://lh3.googleusercontent.com/NPrelEh58UI5S0QwyS0Te103Am8ccNPrcxckEzd1l34UsZ7xD9TQWNy4rM2BATHWBtg2GKp5YrtdDQnTlywXHfbXTAFR4nXJoPHy50DDMrEj109MsqGveSnidCPUUTiAGLHl4kYVrqCyfZTHy72D4lI9JnHzZ1ENWAue5lGXnZUx_mhbV_ChTniyR7Ejbgoz4Ja_Ct6bM607Vt9Dw7MUBbUyaTavix0FtGlXHvorSiKYc3fJrbyM2a-m57FMdSL8BelpAhFMDJdzBpFahFiapd3w34ATnZUDFlb5_rMiIrtIIOGhtjHFp_iltz1T2OdDE4QxrzxTI02KoWnsPEi-oPJMTlWhPX5yAf6BEc9W4FD4nd3FFuYF58VEFVnKM6JJsj3XqE4LnzfkVQIvYcReRkxEtYXOD_LWHEkMhy5AczODmVPUklwBuenix_ra9e7d5C5I92o-zD31wsSHCQZZwIj7fpy2RdznztZDA-uq4n2_4z-XuBSuPNLsj89K_DN7oFLwFOE1lexZ1mI1BFDWKo1zDO8zMkJxxO4NOKeNp6e99Rp4BnLaE9w3Kr_Zg1xk4AxNiWqFEYEw-_dHFV5DR6_1XSlLtxcMAuPoKOShJhSvx6by0j6tB4RwiXwEQ8rU7oFPBh2ABnIgGpeqtvNYT-nRFStkktFIGI-ncYJRRPgHE2WqhtF0PRF3i_TCXMnIuCuBc-01MYbaUicrgw=w2560-h686-no)
### Step 5: Testing the Route
***For POST Routes:***
> curl --header "Content-Type: application/json"  --request POST --data '__JSON Data__'  http://localhost:5001/**route url created in Step 4** 

Example: 
> curl --header "Content-Type: application/json"  --request POST --data '{"name":"Task1" ,"description":"Task Description 1", "priority": 1, "start_date":"2018-12-08 02:41:17","due_date":"2018-12-12 01:31:10"}'  http://localhost:5001/api/task/create

***For GET Routes:***
> curl http://localhost:5001/**route url created in Step 4**

Example
> curl http://localhost:5001/api/tasks
## Sample Demo Application[Tasks]
Let us create a Tasks Demo Application
* Create a Connection – Instruction to Create Function is description in Step 3
  * _Connection Name_ – Unique Connection Name (Ex: default-connection) 
  * _Host(or ip address)_ - host or ip address of the database
  * _Port#_ - database port number
  * _Username_ - database username
  * _Password_ - database password
  * _Database_ - database name
* Create the Database Functions and Tables using Postgres Client like pgAdmin 4. Make sure to use the same database crendentials as mentioned in Step 1
  * Table Creation Script
    ```sql
      CREATE TABLE IF NOT EXISTS tasks (
      id uuid NOT NULL,
      name text NOT NULL,
      description text NOT NULL,
      start_date timestamp with time zone NOT NULL,
      due_date   timestamp with time zone NOT NULL,
      priority   integer NOT NULL,
      created timestamp with time zone NOT NULL,
      updated timestamp with time zone NOT NULL
      );
    ```

  * Create_Task
    ```sql
      CREATE OR REPLACE FUNCTION create_task ( p_data json)
      RETURNS json AS
      $BODY$ 
      DECLARE 
      l_out json;
      l_message_text text;
      l_exception_detail text;
      l_exception_hint text;
      l_id uuid;
      l_name text;
      l_description text;
      l_start_date timestamp;
      l_due_date timestamp;
      l_priority integer;
      
      BEGIN
      l_id := md5(random()::text || clock_timestamp()::text)::uuid; 
      l_name := (p_data->>'name')::text;
      l_description := (p_data->>'description')::text;
      l_start_date := NOW();
      l_due_date := (p_data->>'due_date')::timestamp;
      l_priority := (p_data->>'priority')::integer;
      
      INSERT INTO tasks
      (
       id,
       name,
       description,
       start_date,
       due_date,
       priority,
       created,
       updated
       )
       VALUES
       (
       l_id,
       l_name,
       l_description,
       l_start_date,
       l_due_date,
       l_priority,
       NOW(),
       NOW()
       );
      
      l_out :=  '{"status" : "S" , "message" : "OK" , "id" : "' || l_id || '"}';
      RETURN l_out;
      EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                              l_exception_detail = PG_EXCEPTION_DETAIL,
                              l_exception_hint = PG_EXCEPTION_HINT;
      l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
      return l_out;  
      END
      $BODY$
      LANGUAGE plpgsql;
    ```
  * Create_Bulk_Tasks
    ```sql
      CREATE OR REPLACE FUNCTION create_bulk_tasks ( p_data json)
      RETURNS json AS
      $BODY$ 
      DECLARE 
      l_out json;
      l_message_text text;
      l_exception_detail text;
      l_exception_hint text;
      -- 
      l_id uuid;
      l_name text;
      l_description text;
      l_start_date timestamp;
      l_due_date timestamp;
      l_priority integer;
      l_task_record json;
      l_tasks_c CURSOR FOR SELECT json_array_elements(p_data->'tasks');
    
      BEGIN
      
      OPEN l_tasks_c;
      LOOP
         FETCH l_tasks_c INTO l_task_record;
         EXIT WHEN NOT FOUND;
         
         l_id := md5(random()::text || clock_timestamp()::text)::uuid; 
         l_name := (l_task_record->>'name')::text;
         l_description := (l_task_record->>'description')::text;
         l_start_date := NOW();
         l_due_date := (l_task_record->>'due_date')::timestamp;
         l_priority := (l_task_record->>'priority')::integer;
         
         INSERT INTO tasks
         (
          id,
          name,
          description,
          start_date,
          due_date,
          priority,
          created,
          updated
          )
          VALUES
          (
          l_id,
          l_name,
          l_description,
          l_start_date,
          l_due_date,
          l_priority,
          NOW(),
          NOW()
          );
    
      
      END LOOP;
      CLOSE l_tasks_c;
      
      l_out :=  '{"status" : "S" , "message" : "OK" }';
      RETURN l_out;
    
      EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                              l_exception_detail = PG_EXCEPTION_DETAIL,
                              l_exception_hint = PG_EXCEPTION_HINT;
      l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
      return l_out;  
      END
      $BODY$
      LANGUAGE plpgsql;
    ```
  * Delete_Task
    ```sql
      CREATE OR REPLACE FUNCTION delete_task ( p_data json)
      RETURNS json AS
    $BODY$ 
    DECLARE 
      l_out json;
      l_message_text text;
      l_exception_detail text;
      l_exception_hint text;
      -- 
      l_id uuid;
      l_cnt int;
    BEGIN
      l_id := (p_data->>'id')::uuid; 
    
      DELETE FROM tasks
      WHERE id = l_id;
      
      GET DIAGNOSTICS l_cnt = row_count;  
      
      l_out :=  '{"status" : "S" , "message" : "OK" , "rows_affected" : "' || l_cnt || '"}';
      RETURN l_out;
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                              l_exception_detail = PG_EXCEPTION_DETAIL,
                              l_exception_hint = PG_EXCEPTION_HINT;
      l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
      return l_out;  
    END
    $BODY$
    LANGUAGE plpgsql; 
    ```
  * Select_Task
    ```sql
      CREATE OR REPLACE FUNCTION select_task ( p_data json)
      RETURNS json AS
      $BODY$ 
      DECLARE 
      l_out json;
      l_message_text text;
      l_exception_detail text;
      l_exception_hint text;
      -- 
      l_data text;
      l_id   uuid;
      l_params json;
      BEGIN 
      
      l_params := (p_data->>'urlparams')::json;
    
      IF l_params IS NOT NULL THEN
         l_id := (l_params->>'id')::uuid;
      END IF;
    
      IF l_id IS NULL THEN 
        SELECT array_to_json(array_agg(row_to_json(t.*))) INTO l_data 
        FROM (SELECT * FROM tasks) t;
      ELSE
        SELECT array_to_json(array_agg(row_to_json(t.*))) INTO l_data 
        FROM (SELECT * FROM tasks WHERE id = l_id) t;
      END IF;
       
      l_out :=  '{"status" : "S" , "message" : "OK" , "data" : ' || l_data || '}';
      RETURN l_out;
      EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                              l_exception_detail = PG_EXCEPTION_DETAIL,
                              l_exception_hint = PG_EXCEPTION_HINT;
      l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
      return l_out;  
      END
      $BODY$
      LANGUAGE plpgsql; 
    ```
  * Update_Task
    ```sql
      CREATE OR REPLACE FUNCTION update_task ( p_data json)
      RETURNS json AS
      $BODY$ 
      DECLARE 
      l_out json;
      l_message_text text;
      l_exception_detail text;
      l_exception_hint text;
      -- 
      l_id uuid;
      l_name text;
      l_description text;
      l_due_date timestamp;
      l_priority integer;
      l_cnt int;
      BEGIN
      l_id := (p_data->>'id')::uuid; 
      l_name := (p_data->>'name')::text;
      l_description := (p_data->>'description')::text;
      l_due_date := (p_data->>'due_date')::timestamp;
      l_priority := (p_data->>'priority')::integer;
      
      UPDATE tasks
      SET name = COALESCE(l_name,name)
        , description = COALESCE(l_description, description)
        , due_date = COALESCE(l_due_date, due_date)
        , priority = COALESCE(l_priority, priority)
        , updated = NOW()
      WHERE id = l_id;
      
      GET DIAGNOSTICS l_cnt = row_count;  
      
      l_out :=  '{"status" : "S" , "message" : "OK" , "rows_affected" : "' || l_cnt || '"}';
      RETURN l_out;
      EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS l_message_text = MESSAGE_TEXT,
                              l_exception_detail = PG_EXCEPTION_DETAIL,
                              l_exception_hint = PG_EXCEPTION_HINT;
      l_out := '{ "status" : "E" , "message" : "' || REPLACE(l_message_text, '"', E'\\"') || '" }';
      return l_out;  
      END
      $BODY$
      LANGUAGE plpgsql; 
    ```
 * Create Functions – Instruction to Create Function is description in Step 3
   * Create Task 
     * _Function Name_ – Create Task Function
     * _Connection Name_ – Default Connection 
     _(Or any other connection that has been created using Step 1 . Make sure to use the same database credentials as used in Step 2)_
     * _DB Method_ – create_task
   * Update Task
     * _Function Name_ – Update Task Function
     * _Connection Name_ – Same as used in Create Task Function (above step)
     * _DB Method_ – update_task
   * Delete Task
     * _Function Name_ – Delete Task Function
     * _Connection Name_ – Same as used in Create Task Function (above step)
     * _DB Method_ – delete_task
   * Create Bulk Tasks
     * _Function Name_ – Update Task Function
     * _Connection Name_ – Same as used in Create Task Function (above step)
     * _DB Method_ – create_bulk_tasks
   * Select All Tasks
     * _Function Name_ – Select All Tasks Function
     * _Connection Name_ – Same as used in Create Task Function (above step)
     * _DB Method_ – select_task
 > After setting up all the functions , the UI must look something like the below image. The green icon next to the Connection Name indicates that the connection is valid and the green icon next to the Function Name indicates that the database function is defined in the postgres database specified.

![alt text](https://lh3.googleusercontent.com/DLf3ydE0r859PwS8ualY0wJKcBnk_dzKQtAPrPOI0aOnSf8RVr_iIxWt8Y9PP5VLTbpMde-2V5Hr7sDgpoqCBQnHS2ZB8Ck9be9aE-DLPM927gLRMrXiEv6d_E6pln2zxiN7tR1p9Q0kzQsupHEP4QP0DBhgDtwd-Zgc4gx_kznlhZpD0js4KkjFFt248PI1q6Hv8Tp8tbi-QFeldFzWkpAuVHmqQgCO57-WlSo_YHxp_fafi9Pg_QMmzVLrk0qIHbP_TBEqbpPXJ_4DO_Mg5akW0gfRPQGk6wkGkrmb1NT6_kYFxZRKG1NWPsEUTFSJNQcQvK90g1EBUNHVFEQimXmEI5_Pn4d648tGR2_RnVY-ZTVpfyDo1Yms7K2wyncFOg0aw_aJ3rhbZUuyMxZTF2hFHM1ybzI5z9QOjb2aDYaHF1LxUefV7Ljsd7vOVpfrdZ66aldEajnPJtPhTXG2xsKflrJwdQYPRCqlWT5_xkUL3gQM-MbrvWiMssmgJ1nPKvJMDZHd9_p63sOGIsf9toG9Ge6e_Q4FkBGD-0W2MeLpDm5nH-rkfogQf_oOOIVQn7prHETI2F6w5Y2-v6I-QeQ04mhoB8oiyMOoWlyddG7hmVg67UIb6ONL4y75djfJbLoowJonFAOliBI_ibNDu5oHBMjg5H6uB1J2WZwqcqafgW7DarDn28ZL__cUvrBBuf31voShU3lQYVVQQw=w2730-h1208-no)
 * Create Routes – Instruction to Create Routes is description in Step 4 
   * Create Task 
     * _Route Name_ -  Create Task Route
     * _Description_ – API used to create Task
     * _Route Method_ – POST
     * _Route URL_ - /api/task/create
     * _Function Name_ – Create Task Function
   * Update Task
     * _Route Name_ -  Update Task Route
     * _Description_ – API used to update Task
     * _Route Method_ – POST
     * _Route URL_ - /api/task/update
     * _Function Name_ – Update Task Function
   * Delete Task
     * _Route Name_ -  Delete Task Route
     * _Description_ – API used to delete Task
     * _Route Method_ – POST
     * _Route URL_ - /api/task/delete
     * _Function Name_ – Delete Task Function
   * Create Bulk Tasks
     * _Route Name_ -  Create Bulk Tasks Route
     * _Description_ – API used to create Bulk Tasks
     * _Route Method_ – POST
     * _Route URL_ - /api/tasks/bulk/create
     * _Function Name_ – Create Bulk Tasks Function
   * Select All Tasks
     * _Route Name_ -  Select ALl Tasks Route
     * _Description_ – API used to fetch all tasks
     * _Route Method_ – GET
     * _Route URL_ - /api/tasks
     * _Function Name_ – Select Task Function
   * Select Task by Id
     * _Route Name_ -  Select Task Route
     * _Description_ – API used to fetch all task by Id
     * _Route Method_ – GET
     * _Route URL_ - /api/task/:id
     * _Function Name_ – Select Task Function
> After setting up all the routes , the UI must look something like the below image.

![alt text](https://lh3.googleusercontent.com/5j-Kb9KfToni64hphivDG1cz5LmQMRWRRmhuwAOPkBd55y5VEd9rNQqpyWcuJaWsaAQVIP63M6IH6ux78J3T5Hm-UN3C5zulSICbh8Rq02agz8lAeAtD1wanq5iGJqCbgWtQV0ssg0m1BeL2rLZ9uMCEDSlY6DVj1Nz2PapEIcf8Wo6JSUPXTfxM7Jb9W6yToRS2S24C7rH9M9eBKnsKFOUpkgbE71Ic_5y8ap0ieagQ9o67rcZcKo_DuEt92uo3d82LWto6SEYU0EGrdn3Jg67KPuxiVsRTD9S4ayxtqMEF02nVuF7oI8cdGBZg7yrCutHoDieIVbUNg4T3MjoqKru6QIn3sS_HEjX46-PNlzepmtW4hsnd4rwXRvm8Lwdxnwk1BKF0zdCi9a2hjqdSM_6oVIrzb_ruWjwUCIOX3mHPZ3CMGdtK9dA_xHaXMDyZovE6t3djl5LvvTqv3uOFdy9YkVfSs8vCdmQkrQIqEjhJmJtyeDs_zL6KNOnvpoOJ1YajH1VKfRDSHzp1IQ7eXKKSukiUDrA3nznlwSs2_TjOACFLcGOoOshSSoGO9H2BtfX-kfn3B8H1A1Rj9g8ezPsP0k1tTCh7slE21ZnFHSvelhajIYEz8MLY9FC0_OV4pOjNEY3Nrw6H0PL8aaRtW3ZX_ub7SEbyUV8ypqvkO45UDyG3PdSCKsZCb8WMxmWySZEBIhoTDKJ1GAaT1A=w2726-h1280-no)
 * Testing the Routes
   * Create Task 
     * Request
        ```
        curl --header "Content-Type: application/json" \ --request POST \ --data '{"name":"Task1" , "description":"Task Description 1", "priority": 1, "start_date":"2018-12-08 02:41:17", "due_date":"2018-12-12 01:31:10"}' \ http://localhost:5001/api/task/create
        ```
     * Response
       ```
       {"status":"S","message":"OK","result":[{"result":{"status":"S","message":"OK","id":"8003c392-d89a-e577-be11-5f42808cf28b"}}]}
       ```
   * Update Task
     * Request
       ```
       curl --header "Content-Type: application/json" \ --request POST \ --data '{"id":"8003c392-d89a-e577-be11-5f42808cf28b","name":"Task2"}'   \ http://localhost:5001/api/task/update
       ```
     * Response
       ```
       {"status":"S","message":"OK","result":[{"result":{"status":"S","message":"OK","rows_affected":"1"}}]}
       ```
   * Delete Task
     * Request
       ```
       curl --header "Content-Type: application/json" \ --request POST \ --data '{"id":"8003c392-d89a-e577-be11-5f42808cf28b"}' \ http://localhost:5001/api/task/delete
       ```
     * Response
       ```
       {"status":"S","message":"OK","result":[{"result":{"status":"S","message":"OK","rows_affected":"1"}}]}
       ```
   * Create Bulk Tasks
     * Request
       ```
       curl --header "Content-Type: application/json" \ --request POST \ --data '{"tasks": [{"name":"Task4" , "description":"Task Description 4", "priority": 2, "start_date":"2018-12-08 02:41:17", "due_date":"2018-12-12 01:31:10"}, {"name":"Task5" , "description":"Task Description 5", "priority": 2, "start_date":"2018-12-08 02:41:17", "due_date":"2018-12-12 01:31:10"}]}' \ http://localhost:5001/api/tasks/bulk/create
       ```
     * Response
       ```
       {"status":"S","message":"OK","result":[{"result":{"status":"S","message":"OK"}}]}
       ```
   * Select All Tasks
     * Request
       ```
       curl http://localhost:5001/api/tasks
       ```
     * Response
       ```
       {"status":"S","message":"OK","result":[{"result":{"status":"S","message":"OK","data":[{"id":"d716a072-be43-2301-1d9e-80998bb0c95e","name":"Task4","description":"Task Description 4","start_date":"2018-12-22T23:56:29.495069+05:30","due_date":"2018-12-12T01:31:10+05:30","priority":2,"created":"2018-12-22T23:56:29.495069+05:30","updated":"2018-12-22T23:56:29.495069+05:30"},{"id":"4ee0bec0-f5df-e75e-9180-25dc216bd021","name":"Task5","description":"Task Description 5","start_date":"2018-12-22T23:56:29.495069+05:30","due_date":"2018-12-12T01:31:10+05:30","priority":2,"created":"2018-12-22T23:56:29.495069+05:30","updated":"2018-12-22T23:56:29.495069+05:30"}]}}]}
       ```
   * Select Task by Id
     * Request
       ```
       curl http://localhost:5001/api/task/d716a072-be43-2301-1d9e-80998bb0c95e
       ```
     * Response
       ```
       {"status":"S","message":"OK","result":[{"result":{"status":"S","message":"OK","data	":[{"id":"d716a072-be43-2301-1d9e-	80998bb0c95e","name":"Task4","description":"Task Description 	4","start_date":"2018-12-22T23:56:29.495069+05:30","due_date":"2018-12-	12T01:31:10+05:30","priority":2,"created":"2018-12-	22T23:56:29.495069+05:30","updated":"2018-12-22T23:56:29.495069+05:30"}]}}]}
       ```

## Built With

* [vuejs](https://github.com/vuejs/vue) - JavaScript framework
* [vuetify](https://vuetifyjs.com/en/) - Material Component Framework for Vue.js
* [nodejs](https://nodejs.org/en/) - Server environment

## Authors

* **Praveen Muralidhar** - *Initial work* - [thrinz](https://github.com/thrinz)

## License

This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE) file for details

