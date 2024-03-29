from typing import Callable, List, Optional

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from django_apscheduler.jobstores import DjangoJobStore

scheduler = BackgroundScheduler()

scheduler.add_jobstore(DjangoJobStore(), "default")

class Job:
    def __init__(
        self,
        name: str,
        func: Callable,
        trigger: Optional[str] = "* * * * *",
        job_args: Optional[List[any]] = None,
        max_instances: Optional[int] = 1,
        replace_existing: Optional[bool] = True,
    ):
        self.name: str = name
        self.func: Callable = func
        self.trigger: str = trigger
        self.job_args: tuple = job_args or []
        self.max_instances: int = max_instances
        self.replace_existing: bool = replace_existing

    def __str__(self) -> str:
        return self.name


class JobManager:
    def __init__(
        self,
        jobs: List[Job],
        force: bool = True,
    ):
        self.jobs: List[Job] = jobs

        for job in self.jobs:
            scheduler.add_job(
                job.func,
                args=job.job_args,
                id=job.name,
                trigger=CronTrigger.from_crontab(job.trigger),
                max_instances=job.max_instances,
                replace_existing=job.replace_existing,
            )
            print(f"Added: `{job}`")

        if force:
            self.ready()

    def ready(self) -> None:
        try:
            print("Starting scheduler...")
            scheduler.start()
        except KeyboardInterrupt:
            print("Stopping scheduler...")
            scheduler.shutdown()
            print("Scheduler shut down successfully!")
