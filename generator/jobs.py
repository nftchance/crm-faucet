from django_apscheduler import util
from django_apscheduler.models import DjangoJobExecution

from utils.jobs import Job, JobManager


@util.close_old_connections
def generate_sources() -> None:
    # TODO: This should be a cron job that runs every hour or so
    #       to create the Source objects for all the wallets that we want to watch.

    # This will use a bulk create so that we only have a single database operation.

    # The list of addresses will come from the provided query.
    pass


@util.close_old_connections
def delete_old_job_executions(max_age=60 * 60) -> None:
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


jobs = [
    Job("generate_sources", generate_sources, trigger=("*/59", "*")),
    Job("delete_old_job_executions", delete_old_job_executions),
]

manager = JobManager(jobs)
