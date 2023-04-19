BALANCES = """
SELECT
USER_ADDRESS AS ADDRESS,
BALANCE,
BLOCK_TIMESTAMP
FROM
    ethereum.core.fact_eth_balances
    WHERE
    USER_ADDRESS IN ({0})
    QUALIFY ROW_NUMBER() OVER (PARTITION BY USER_ADDRESS ORDER BY BLOCK_TIMESTAMP DESC) = 1
"""

ENS = """
SELECT  OWNER
    ,REPLACE(EMAIL,chr(0),'')                                                                                                                    AS EMAIL
    ,ENS_NAME
    ,REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(GITHUB,'https',''),'http',''),'github.com',''),':',''),'/',''),'@',''),chr(0),'')   AS GITHUB
    ,REPLACE(REDDIT,chr(0),'')                                                                                                                   AS REDDIT
    ,REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TELEGRAM,'https',''),'http',''),'t.me',''),':',''),'/',''),'@',''),'#',''),chr(0),'') AS TELEGRAM
    ,REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TWITTER,'https',''),'http',''),'twitter.com',''),':',''),'/',''),'@',''),chr(0),'') AS TWITTER
    ,TOKENID
FROM crosschain.core.ez_ens
WHERE ( GITHUB IS NOT NULL OR TWITTER IS NOT NULL OR TELEGRAM IS NOT NULL )
AND ADDRESS IN ({0})
"""

LENS = """
WITH
  holders AS (
    SELECT
      EVENT_INPUTS:"to"::string AS holder,
      EVENT_INPUTS:"tokenId"::string AS tokenid,
      block_number,
      tx_hash
    FROM
      polygon.core.fact_event_logs
    WHERE
      block_timestamp::date > '2022-05-01'::date
      AND contract_address = lower('0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d')
      AND event_name = 'Transfer'
      -- and event_inputs:"tokenId"::string::int > 100000
      qualify rank() OVER (
        partition BY
          tokenid
        ORDER BY
          block_number DESC,
          event_index DESC
      ) = 1
    UNION ALL
    SELECT
      concat('0x', RIGHT(topics[2]::string, 40)) AS holder,
      ethereum.PUBLIC.udf_hex_to_int (RIGHT(topics[3]::string, 42))::string AS tokenid,
      block_number,
      tx_hash
    FROM
      polygon.core.fact_event_logs
    WHERE
      block_timestamp::date > '2022-05-01'::date
      AND contract_address = lower('0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d')
      AND origin_function_signature = '0x42842e0e'
      AND topics[0]::string = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      -- and ethereum.public.udf_hex_to_int(right(topics[3]::string,42))::int > 100000
      qualify rank() OVER (
        partition BY
          tokenid
        ORDER BY
          block_number DESC,
          event_index DESC
      ) = 1
  ),
  names AS (
    SELECT
      (
        ethereum.PUBLIC.udf_hex_to_int (topics[1]::string)
      )::string AS tokenid,
      regexp_substr_all(substr(data, 3, len(data)), '.{64}') AS segmented_data,
      try_hex_decode_string(
        (
          regexp_substr_all(substr(data, 3, len(data)), '.{64}')
        ) [7]::string
      ) AS handle
    FROM
      polygon.core.fact_event_logs
    WHERE
      block_timestamp::date > '2022-05-01'
      AND contract_address = lower('0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d')
      AND topics[0]::string = '0x4e14f57cff7910416f2ef43cf05019b5a97a313de71fec9344be11b9b88fed12'
      -- and (ethereum.public.udf_hex_to_int(topics[1]::string))::int > 100000
  )
SELECT
  holders.tokenid,
  replace(names.handle, chr(0), '') AS handle,
  holders.holder
FROM
  holders
  LEFT JOIN names ON holders.tokenid::string = names.tokenid::string qualify rank() OVER (
    partition BY
      holders.tokenid
    ORDER BY
      block_number DESC
  ) = 1
ORDER BY
  1 DESC
"""
