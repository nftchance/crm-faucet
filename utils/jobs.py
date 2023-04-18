from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from django_apscheduler.jobstores import DjangoJobStore

scheduler = BackgroundScheduler()


class Job:
    def __init__(
        self: object,
        name: str,
        func: callable,
        trigger: tuple = ("*", "*/59"),
        max_instances: int = 1,
        replace_existing: bool = True,
    ):
        self.name = name
        self.func = func
        self.trigger = trigger
        self.max_instances = max_instances
        self.replace_existing = replace_existing

    def __str__(self) -> str:
        return self.name


class JobManager:
    def __init__(self: object, jobs: list[Job], jobstore: str = "default", force=True):
        self.jobstore = jobstore
        self.jobs = jobs

        if force:
            self.ready()

    def ready(self: object) -> None:
        scheduler.add_jobstore(DjangoJobStore(), self.jobstore)

        for job in self.jobs:
            scheduler.add_job(
                f"{job}",
                id=f"{job}",
                trigger=CronTrigger.from_crontab(f"{job.trigger[0]} {job.trigger[1]}"),
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
