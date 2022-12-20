import django
import requests

from django.db.models import Q, Count

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util

from .models import Source, SourceHolding, SourceLabel

from web3 import Web3, HTTPProvider
from ens import ENS
from datetime import datetime
from shroomdk import ShroomDK

shroom = ShroomDK('7736f412-5e7b-4c43-8360-3e2231a24e69')

NFTINSPECT_URLS = {
    "NFTINSPECT_COLLECTION_DETAILS": "https://www.nftinspect.xyz/api/collections/details/{0}",
    "NFTINSPECT_MEMBERS": "https://www.nftinspect.xyz/api/collections/members/{0}?limit={1}&onlyNewMembers=false&sortMode=FOLLOWED",
}

NFTINSPECT_CONTRACT_ADDRESSES = [
    "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", # BAYC
    "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb", # CryptoPunks
    "0xed5af388653567af2f388e6224dc7c4b3241c544", # Azuki
    "0x23581767a106ae21c074b2276d25e5c3e136a68b", # Moonbirds
    "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e", # Doodles
    "0x60e4d786628fea6478f785a6d7e704777c86a7c6", # MAYC
    "0x1a92f7381b9f03921564a437210bb9396471050c", # mfers
    "0x79fcdef22feed20eddacbb2587640e45491b757f", # CloneX
    "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b", # LlamaVerse
    "0xbd3531da5cf5857e7cfaa92426877b022e612cf8", # Pudgy Penguins
    "0xbce3781ae7ca1a5e050bd9c4c77369867ebc307e", # Goblin Town
    "0x75e95ba5997eb235f40ecf8347cdb11f18ff640b", # Psychedelics Anonymous
    "0x80336ad7a747236ef41f47ed2c7641828a480baa", # Chimpers
    "0x364c828ee171616a39897688a831c2499ad972ec", # Sappy Seals
    "0xedb61f74b0d09b2558f1eeb79b247c1f363ae452", # Gutter Cat Gang
    "0x0c2e57efddba8c768147d1fdf9176a0a6ebd5d83", # Kaiju Kingz
    "0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949", # Beanz
    "0x19b86299c21505cdf59ce63740b240a9c822b5e4", # Degen Toolz
    "0x57a204aa1042f6e66dd7730813f4024114d74f37", # Cyberkongz
    "0x2acab3dea77832c09420663b0e1cb386031ba17b", # DeadFellaz
    "0xd1258db6ac08eb0e625b75b371c023da478e94a9", # DigiDaiku
    "0x59468516a8259058bad1ca5f8f4bff190d30e066", # Invisible Friends
]

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

provider = Web3(HTTPProvider(f'https://eth-mainnet.g.alchemy.com/v2/LrOnpxvPgi2TEiVVpH0G-QgkhYG-ygPr'))
ns = ENS.fromWeb3(provider)

def get_confident_source(wallet_address):
    sources = Source.objects.filter(
        holdings__wallet_address=wallet_address,
    )
    
    # Get the source with the most references to the address if there are multiple.
    if len(set(sources.values_list("holdings__wallet_address", flat=True))) > 1:
        sources = sources.filter(
            holdings__wallet_address=wallet_address,
        ).annotate(
            wallet_address_count=Count("holdings__wallet_address")
        ).order_by("-wallet_address_count")

    source = sources.first()

    return source

## For source that has not had a collection members lookup in the last X
@util.close_old_connections
def get_nftinspect_collection_members(contract_address):
    # Trimmed to the first 5000 results as everything past that appears to be a scam / very low accuracy rates
    response = requests.get(NFTINSPECT_URLS["NFTINSPECT_MEMBERS"].format(contract_address, 5000))
    
    if response.status_code == 200:
        response_data = response.json()
        members = response_data["members"]

        for member in members:
            created = False
            if Source.objects.filter(
                identifiers__source_type="twitter_id", 
                identifiers__identifier=member["id"]
            ).exists():
                source = Source.objects.get(
                    identifiers__source_type="twitter_id", 
                    identifiers__identifier=member["id"]
                )
            else:
                source = Source.objects.create()
                source.identifiers.get_or_create(
                    source_type="twitter_id",
                    identifier=member["id"],
                )

                created = True

            if not created and source.updated > django.utils.timezone.now() - datetime.timedelta(days=7):
                continue

            if (source.identifiers
                .filter(source_type="twitter_username")
                .exclude(identifier=member["name"])
                .exists()
            ):
                source.identifiers.filter(source_type="twitter_username").delete()

            if (source.identifiers
                .filter(source_type="twitter_handle")
                .exclude(identifier=member["username"])
                .exists()
            ):
                source.identifiers.filter(source_type="twitter_handle").delete()

            source.identifiers.get_or_create(
                source_type="twitter_username",
                identifier=member["name"],
            )

            source.identifiers.get_or_create(
                source_type="twitter_handle",
                identifier=member["username"],
            )

            # Assign the holdings to the source if they have one
            # Not all members will have a token.
            if member["token"] is not None:
                pieces = member["token"].split(":")

                if 'ETH' not in pieces: 
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

# @util.close_old_connections
# def get_nametag_collection_members():
#     list_url = "https://nametag.org/api/v2/spaces"
#     response = requests.get(list_url)

#     if not response.status_code == 200:
#         return

#     response_data = response.json()
#     space_ids = [space["id"] for space in response_data["spaces"]]
#     print(response_data)


@util.close_old_connections
def get_wallet_address_from_holdings():
    # Get the balance of all the wallets that have a holding in the database.
    query_results = shroom.query(BALANCES_QUERY.format(f"""
        {','.join([f'\'{holding.token_id}\'' for holding in (
            SourceHolding.objects
                .filter(contract="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
                .values_list("wallet_address", flat=True)
                .distinct()
            )])
        }"""))

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

        for key, value in list(filter(None, record.items()))[1:len(ENS_COLUMNS_TO_IDENTIFIERS.keys())]:
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

        # Get the NFTInspect collection members once every 24 horus
        for contract_address in NFTINSPECT_CONTRACT_ADDRESSES:
            scheduler.add_job(
                get_nftinspect_collection_members,
                args=[contract_address],
                trigger=CronTrigger(hour="*/23"),
                id=f"get_nftinspect_collection_members_{contract_address}",
                max_instances=1,
                replace_existing=True,
            )
            print(f"Added: `get_nftinspect_collection_members_{contract_address}`")                

        # Get the wallet address from the holdings
        # scheduler.add_job(
        #     get_wallet_address_from_holdings,
        #     trigger=CronTrigger(minute="*/1"),
        #     id="get_wallet_address_from_holdings",
        #     max_instances=1,
        #     replace_existing=True
        # )

        # Get the ENS details
        scheduler.add_job(
            get_ens_query,
            id="get_ens_query",
            trigger=CronTrigger(minute="*/10"),
            max_instances=1,
            replace_existing=True,
            next_run_time=datetime.now()
        )

        try:
            print("Starting scheduler...")
            scheduler.start()
        except KeyboardInterrupt:
            print("Stopping scheduler...")
            scheduler.shutdown()
            print("Scheduler shut down successfully!")