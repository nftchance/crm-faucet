from typing import List

from django_apscheduler import util
from django_apscheduler.models import DjangoJobExecution

from django.conf import settings

from utils.jobs import Job, JobManager

from .models import Generator

@util.close_old_connections
def generate_sources(generator: Generator) -> None:
    if settings.STALLING:
        return

    generator.ready()

@util.close_old_connections
def delete_old_job_executions(max_age: int = 60 * 60) -> None:
    DjangoJobExecution.objects.delete_old_job_executions(max_age)

generator_jobs: List[Job] = [
    Job(
        f"generator_{generator.id}", 
        generate_sources, 
        trigger=generator.trigger, 
        job_args=[generator.id]
    ) for generator in Generator.objects.active()
]

jobs: List[Job] = generator_jobs + [
    Job("delete_old_job_executions", delete_old_job_executions),
]

manager: JobManager = JobManager(jobs)
