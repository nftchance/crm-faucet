import django
import requests

from django.db.models import Count

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util

from .models import Source, SourceHolding, SourceLabel

from web3 import Web3, HTTPProvider
from ens import ENS
from datetime import datetime, timedelta
from shroomdk import ShroomDK

shroom = ShroomDK("7736f412-5e7b-4c43-8360-3e2231a24e69")

NFTINSPECT_URLS = {
    "NFTINSPECT_COLLECTION_DETAILS": "https://www.nftinspect.xyz/api/collections/details/{0}",
    "NFTINSPECT_MEMBERS": "https://www.nftinspect.xyz/api/collections/members/{0}?limit={1}&onlyNewMembers=false&sortMode=FOLLOWED",
}

NFTINSPECT_CONTRACT_ADDRESSES = [
    "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",  # BAYC
    "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",  # CryptoPunks
    "0xed5af388653567af2f388e6224dc7c4b3241c544",  # Azuki
    "0x23581767a106ae21c074b2276d25e5c3e136a68b",  # Moonbirds
    "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",  # Doodles
    "0x60e4d786628fea6478f785a6d7e704777c86a7c6",  # MAYC
    "0x1a92f7381b9f03921564a437210bb9396471050c",  # mfers
    "0x79fcdef22feed20eddacbb2587640e45491b757f",  # CloneX
    "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b",  # LlamaVerse
    "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",  # Pudgy Penguins
    "0xbce3781ae7ca1a5e050bd9c4c77369867ebc307e",  # Goblin Town
    "0x75e95ba5997eb235f40ecf8347cdb11f18ff640b",  # Psychedelics Anonymous
    "0x80336ad7a747236ef41f47ed2c7641828a480baa",  # Chimpers
    "0x364c828ee171616a39897688a831c2499ad972ec",  # Sappy Seals
    "0xedb61f74b0d09b2558f1eeb79b247c1f363ae452",  # Gutter Cat Gang
    "0x0c2e57efddba8c768147d1fdf9176a0a6ebd5d83",  # Kaiju Kingz
    "0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949",  # Beanz
    "0x19b86299c21505cdf59ce63740b240a9c822b5e4",  # Degen Toolz
    "0x57a204aa1042f6e66dd7730813f4024114d74f37",  # Cyberkongz
    "0x2acab3dea77832c09420663b0e1cb386031ba17b",  # DeadFellaz
    "0xd1258db6ac08eb0e625b75b371c023da478e94a9",  # DigiDaiku
    "0x59468516a8259058bad1ca5f8f4bff190d30e066",  # Invisible Friends
]

NAMETAG_URLS = {
    "NAMETAG_ALL_SPACES": "https://nametag.org/api/v2/spaces",
    "NAMETAG_SPACE_MEMBERS": "https://nametag.org/api/v2/spaces/{0}/holders?spaceId={0}",
    "NAMETAG_MEMBER_BY_ADDRESS": "https://nametag.org/api/v1/nametags/get-by-address?publicAddress={0}",
    "NAMETAG_ALL_MEMBERS": "https://nametag.org/api/v2/profiles?offset={0}&limit={1}&inventoryLimit=0"
}

BALANCES_QUERY = """
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

LENS_QUERY = """
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

ENS_QUERY = """
    SELECT
    OWNER,
    REPLACE(EMAIL,
        chr(0), '') as EMAIL,
    ENS_NAME,
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(GITHUB, 
        'https', ''), 
        'http', ''), 
        'github.com', ''),
        ':', ''), 
        '/', ''), 
        '@', ''),   
        chr(0), '') as GITHUB,
    REPLACE(REDDIT,
        chr(0), '') as REDDIT,
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TELEGRAM, 
        'https', ''), 
        'http', ''), 
        't.me', ''),
        ':', ''), 
        '/', ''), 
        '@', ''), 
        '#', ''), 
        chr(0), '') as TELEGRAM,
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TWITTER, 
        'https', ''), 
        'http', ''), 
        'twitter.com', ''),
        ':', ''), 
        '/', ''), 
        '@', ''), 
        chr(0), '') as TWITTER,
    TOKENID
    FROM
    crosschain.core.ez_ens
    WHERE
    (
        GITHUB IS NOT NULL
        OR TWITTER IS NOT NULL
        OR TELEGRAM IS NOT NULL
    )
"""

ENS_COLUMNS_TO_IDENTIFIERS = {
    "email": "email",
    "ens_name": "ens_name",
    "github": "github_username",
    "reddit": "reddit_username",
    "telegram": "telegram_username",
    "twitter": "twitter_handle",
}

scheduler = BackgroundScheduler()

provider = Web3(
    HTTPProvider(
        f"https://eth-mainnet.g.alchemy.com/v2/LrOnpxvPgi2TEiVVpH0G-QgkhYG-ygPr"
    )
)
ns = ENS.fromWeb3(provider)

def get_confident_source(wallet_address):
    sources = Source.objects.filter(
        holdings__wallet_address=wallet_address,
    )

    # Get the source with the most references to the address if there are multiple.
    if len(set(sources.values_list("holdings__wallet_address", flat=True))) > 1:
        sources = (
            sources.filter(
                holdings__wallet_address=wallet_address,
            )
            .annotate(wallet_address_count=Count("holdings__wallet_address"))
            .order_by("-wallet_address_count")
        )

    source = sources.first()

    return source

def get_or_create_source(source_type, identifier):
    created = False
    if Source.objects.filter(
        identifiers__source_type=source_type,
        identifiers__identifier=identifier,
    ).exists():
        source = Source.objects.filter(
            identifiers__source_type=source_type,
            identifiers__identifier=identifier,
        ).first()
    else:
        source = Source.objects.create()
        source.identifiers.get_or_create(
            source_type=source_type,
            identifier=identifier,
        )

        created = True

    return source, created

def update_source_identifier(source, source_type, identifier):
    if (
        source.identifiers.filter(source_type=source_type)
        .exclude(identifier=identifier)
        .exists()
    ):
        source.identifiers.filter(source_type=source_type).delete()

    identifier, created = source.identifiers.get_or_create(
        source_type="twitter_handle",
        identifier=identifier,
    )

    return identifier, created

@util.close_old_connections
def get_nftinspect_collection_members(contract_address):
    # Trimmed to the first 5000 results as everything past that appears to be a scam / very low accuracy rates
    response = requests.get(
        NFTINSPECT_URLS["NFTINSPECT_MEMBERS"].format(contract_address, 5000)
    )

    if response.status_code == 200:
        response_data = response.json()
        members = response_data["members"]

        for member in members:
            if "twitter_id" not in member:
                continue

            source, created = get_or_create_source("twitter_id", member["id"])

            if (
                not created
                and source.updated
                > django.utils.timezone.now() - timedelta(days=7)
            ):
                continue

            update_source_identifier(source, "twitter_username", member["name"])
            update_source_identifier(source, "twitter_handle", member["username"])
            
            # Assign the holdings to the source if they have one
            # Not all members will have a token.
            if member["token"] is not None:
                pieces = member["token"].split(":")

                if "ETH" not in pieces:
                    continue

                source.holdings.get_or_create(
                    chain=pieces[0],
                    contract=pieces[1],
                    token_id=pieces[2],
                )

            # Add the contract_address_holder label to this source
            label, created = SourceLabel.objects.get_or_create(
                label=f"{contract_address}_holder",
            )

            source.labels.add(label)
            source.save()

@util.close_old_connections
def get_nametag_owners_twitter():
    offset = 0
    limit = 50
    total = 0

    while offset == 0 or offset + limit <= total:
        response = requests.get(
            NAMETAG_URLS["NAMETAG_ALL_MEMBERS"].format(offset, limit)
        )

        if not response.status_code == 200:
            return

        members = response.json()

        total = members["total"]

        for member in members['profiles']:
            ## if an obj in member credential array does not have a type of twitter, continue
            twitter = next((
                credential for credential 
                in member["credentials"] 
                if credential["type"] == "twitter"), None
            )

            if not twitter:
                continue
            
            source, created = get_or_create_source("twitter_id", twitter["value"])

            if (
                not created
                and source.updated
                > django.utils.timezone.now() - timedelta(days=7)
            ):
                continue

            update_source_identifier(source, "twitter_handle", twitter["username"])

            label, created = SourceLabel.objects.get_or_create(
                label=f"nametag_holder",
            )

            source.labels.add(label)
            source.save()
        
        offset += limit

@util.close_old_connections
def get_wallet_address_eth_balance():
    # Get the balance of all the wallets that have a holding in the database.
    addresses = (
        SourceHolding.objects
        .filter(updated__lte=django.utils.timezone.now() - timedelta(days=7))
        .values_list("wallet_address", flat=True)
        .distinct()
    )

    # Work in batches of 5000
    for i in range(0, len(addresses), 5000):
        batch = addresses[i : i + 5000]

        addresses_tuple = tuple(batch)

        query_string = BALANCES_QUERY.format(
            f"""
            {','.join([f"'{address}'" for address in addresses_tuple])
            }"""
        )

        query_results = shroom.query(query_string)

        for record in query_results.records:
            # Get the source based on the address that was provided.
            source = get_confident_source(record["address"])

            # Make sure the ETH holding has been created and is updated on the source.
            holding, created = source.holdings.get_or_create(
                chain="ETH",
                contract="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                token_id=None,
                wallet_address=record["address"],
            )
            holding.balance = record["balance"]
            holding.save()

@util.close_old_connections
def get_ens_query():
    query_result = shroom.query(ENS_QUERY)

    for record in query_result.records:
        if not record["twitter"]:
            continue

        if Source.objects.filter(
            identifiers__source_type="twitter_handle",
            identifiers__identifier=record["twitter"],
        ).exists():
            source = Source.objects.get(
                identifiers__source_type="twitter_handle",
                identifiers__identifier=record["twitter"],
            )
        else:
            source = Source.objects.create()
            source.identifiers.get_or_create(
                source_type="twitter_handle",
                identifier=record["twitter"],
            )

        for key, value in list(filter(None, record.items()))[
            1 : len(ENS_COLUMNS_TO_IDENTIFIERS.keys())
        ]:
            if value is None:
                continue

            # If the source already has a value for this identifier, skip it as ENS is probably outdated
            if source.identifiers.filter(
                source_type=ENS_COLUMNS_TO_IDENTIFIERS[key]
            ).exists():
                continue

            source.identifiers.get_or_create(
                source_type=ENS_COLUMNS_TO_IDENTIFIERS[key],
                identifier=value,
            )

        source.holdings.get_or_create(
            chain="ETH",
            contract="0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
            token_id=record["tokenid"],
            wallet_address=record["owner"],
        )

@util.close_old_connections
def get_lens_handle():
    query_result = shroom.query(LENS_QUERY)

    for record in query_result.records:
        source, created = get_or_create_source("lens_handle", record["handle"])

        if (
            not created
            and source.updated
            > django.utils.timezone.now() - timedelta(days=7)
        ):
            continue

        update_source_identifier(source, "lens_handle", record["handle"])

        source.save()
        print('LENS CREATED. Source id:', source.id)

@util.close_old_connections
def delete_old_job_executions(max_age=60 * 60):
    DjangoJobExecution.objects.delete_old_job_executions(max_age)

class JobManager:
    def ready(self, *args, **options):
        scheduler.add_jobstore(DjangoJobStore(), "default")

        # Clean up the dead jobs at the end of every hour
        scheduler.add_job(
            delete_old_job_executions,
            trigger=CronTrigger(hour="*", minute="*/59"),
            id="delete_old_job_executions",
            max_instances=1,
            replace_existing=True,
        )
        print("Added: `delete_old_job_executions`")

        # Get the NFTInspect collection members once every 12 horus
        for contract_address in NFTINSPECT_CONTRACT_ADDRESSES:
            scheduler.add_job(
                get_nftinspect_collection_members,
                args=[contract_address],
                trigger=CronTrigger(hour="*/12"),
                id=f"get_nftinspect_collection_members_{contract_address}",
                max_instances=1,
                replace_existing=True,
            )
            print(f"Added: `get_nftinspect_collection_members_{contract_address}`")

        # Get the wallet address from the holdings once every 12 hours
        scheduler.add_job(
            get_wallet_address_eth_balance,
            trigger=CronTrigger(hour="*/12"),
            id="get_wallet_address_eth_balance",
            max_instances=1,
            replace_existing=True,
        )
        print(f"Added: `get_wallet_address_eth_balance`")

        # Get the ENS details once every 12 hours
        scheduler.add_job(
            get_ens_query,
            id="get_ens_query",
            trigger=CronTrigger(hour="*/12"),
            max_instances=1,
            replace_existing=True,
            next_run_time=datetime.now(),
        )
        print("Added: `get_ens_query`")

        # Get the linked twitter of Nametag owners once every 12 hours
        scheduler.add_job(
            get_nametag_owners_twitter,
            id="get_nametag_owners_twitter",
            trigger=CronTrigger(hour="*/12"),
            max_instances=1,
            replace_existing=True
        )
        print("Added: `get_nametag_owners_twitter`")

        # Get the lens handles once every 12 hours
        scheduler.add_job(
            get_lens_handle,
            id="get_lens_handle",
            trigger=CronTrigger(hour="*/12"),
            max_instances=1,
            replace_existing=True,
            next_run_time=datetime.now(),
        )
        print("Added: `get_lens_handle`")

        try:
            print("Starting scheduler...")
            scheduler.start()
        except KeyboardInterrupt:
            print("Stopping scheduler...")
            scheduler.shutdown()
            print("Scheduler shut down successfully!")
