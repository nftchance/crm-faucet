from datetime import datetime
from typing import Callable, List

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from django_apscheduler.jobstores import DjangoJobStore

scheduler = BackgroundScheduler()


class Job:
    def __init__(
        self,
        name: str,
        func: Callable,
        trigger: str = "* * * * *",
        max_instances: int = 1,
        replace_existing: bool = True,
    ):
        self.name: str = name
        self.func: Callable = func
        self.trigger: str = trigger
        self.max_instances: int = max_instances
        self.replace_existing: bool = replace_existing

    def __str__(self) -> str:
        return self.name


class JobManager:
    def __init__(
        self,
        jobs: List[Job],
        jobstore: str = "default",
        force: bool = True,
    ):
        self.jobstore: str = jobstore
        self.jobs: List[Job] = jobs

        if force:
            self.ready()

    def ready(self) -> None:
        scheduler.add_jobstore(DjangoJobStore(), self.jobstore)

        for job in self.jobs:
            scheduler.add_job(
                job.func,
                id=job.name,
                trigger=CronTrigger.from_crontab(job.trigger),
                max_instances=job.max_instances,
                replace_existing=job.replace_existing,
            )
            print(f"Added: `{job}`")

        try:
            print("Starting scheduler...")
            scheduler.start()

            for job in scheduler.get_jobs():
                job.modify(next_run_time=datetime.now())

        except KeyboardInterrupt:
            print("Stopping scheduler...")
            scheduler.shutdown()
            print("Scheduler shut down successfully!")
