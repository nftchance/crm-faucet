from typing import List

from django_apscheduler import util
from django_apscheduler.models import DjangoJobExecution

from django.conf import settings

from utils.jobs import Job, JobManager

from .models import Generator


@util.close_old_connections
def generate_sources() -> None:
    jobs = [
        Job(
            f"generator_{generator.id}: {generator.name}",
            generator.ready,
            trigger=generator.trigger,
        )
        for generator in Generator.objects.active()
    ]

    JobManager(jobs, force=False)


@util.close_old_connections
def delete_old_job_executions(max_age: int = 60 * 60) -> None:
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


jobs: List[Job] = [
    Job("generate_sources", generate_sources, trigger="* * * * *"),
    Job("delete_old_job_executions", delete_old_job_executions),
]

manager: JobManager = JobManager(jobs)
